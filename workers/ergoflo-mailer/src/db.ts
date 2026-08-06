/* PostgREST access, over raw fetch. Same rule as everywhere else in this
   repo: no @supabase/supabase-js. See functions/api/notify.ts:9-18. */

import type { OutboxRow } from "./types";

export interface Db {
  url: string;
  key: string;
}

function headers(db: Db, extra: Record<string, string> = {}) {
  return {
    apikey: db.key,
    Authorization: `Bearer ${db.key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/* Columns the templates read, as an embedded select. Written out rather
   than `preorders(*)` so adding a column to the table cannot silently
   start shipping it into a Worker that has no business reading it. */
const ORDER_COLUMNS = [
  "id",
  "order_number",
  "email",
  "shipping_name",
  "shipping_line1",
  "shipping_line2",
  "shipping_city",
  "shipping_state",
  "shipping_postal_code",
  "shipping_country",
  "amount_cents",
  "currency",
  "promised_ship_days",
  "promised_ship_date",
  "terms_snapshot",
  "status",
  "created_at",
].join(",");

/**
 * Pending outbox rows that are due, oldest first, with their order.
 *
 * `limit` is a guard against a first run (or a backlog after an outage)
 * trying to send hundreds of messages inside one scheduled invocation and
 * hitting the Workers CPU limit partway through. Anything not drained
 * this run is still pending and goes out on the next tick.
 */
export async function fetchDueEmails(
  db: Db,
  limit: number
): Promise<OutboxRow[]> {
  const params = new URLSearchParams({
    select: `id,order_id,kind,body_markdown,status,attempts,preorders(${ORDER_COLUMNS})`,
    status: "eq.pending",
    scheduled_for: `lte.${new Date().toISOString()}`,
    order: "scheduled_for.asc",
    limit: String(limit),
  });

  const res = await fetch(`${db.url}/rest/v1/email_outbox?${params}`, {
    headers: headers(db),
  });

  if (!res.ok) {
    console.error("[mailer] fetchDueEmails failed:", res.status);
    return [];
  }
  return (await res.json()) as OutboxRow[];
}

/**
 * Claim a row before sending.
 *
 * `status=eq.pending` in the filter makes this a compare-and-swap: if a
 * previous overlapping run already moved it, this update matches zero
 * rows and returns false, and the caller skips it. Without this, two
 * scheduled invocations that overlap (a slow run plus the next tick) both
 * read the same pending row and both send it. Resend's idempotency key
 * would catch that, but relying on the provider for correctness we can
 * enforce here is the wrong order of defences.
 */
export async function claimEmail(db: Db, id: string): Promise<boolean> {
  const res = await fetch(
    `${db.url}/rest/v1/email_outbox?id=eq.${id}&status=eq.pending`,
    {
      method: "PATCH",
      headers: headers(db, { Prefer: "return=representation" }),
      body: JSON.stringify({ status: "sending" }),
    }
  );
  if (!res.ok) return false;
  const rows = (await res.json().catch(() => [])) as unknown[];
  return rows.length === 1;
}

export async function markSent(
  db: Db,
  id: string,
  resendId: string | undefined
): Promise<void> {
  await fetch(`${db.url}/rest/v1/email_outbox?id=eq.${id}`, {
    method: "PATCH",
    headers: headers(db, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      status: "sent",
      sent_at: new Date().toISOString(),
      resend_id: resendId ?? null,
      last_error: null,
    }),
  });
}

/**
 * Record a failure.
 *
 * Retryable failures go back to `pending` with a backoff on
 * scheduled_for. Non-retryable ones become `failed` and stop -- an
 * invalid address will not become valid, and hammering it damages the
 * sending domain's reputation, which is the asset that makes the *other*
 * emails arrive.
 */
export async function markFailed(
  db: Db,
  id: string,
  attempts: number,
  error: string,
  retryable: boolean
): Promise<void> {
  const giveUp = !retryable || attempts + 1 >= 5;
  /* Exponential backoff in hours: 1, 2, 4, 8. The scheduled handler runs
     daily, so this mostly matters when the job is triggered manually
     during an incident. */
  const backoffMs = Math.min(2 ** attempts, 8) * 60 * 60 * 1000;

  await fetch(`${db.url}/rest/v1/email_outbox?id=eq.${id}`, {
    method: "PATCH",
    headers: headers(db, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      status: giveUp ? "failed" : "pending",
      attempts: attempts + 1,
      last_error: error,
      scheduled_for: giveUp
        ? undefined
        : new Date(Date.now() + backoffMs).toISOString(),
    }),
  });
}
