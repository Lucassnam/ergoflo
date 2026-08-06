/* ============================================================
   ergoflo-mailer — a Cloudflare Worker, separate from the Pages project.

   WHY THIS IS NOT A PAGES FUNCTION. Cron Triggers are a Workers feature:
   they map a cron expression to a `scheduled()` handler
   (developers.cloudflare.com/workers/configuration/cron-triggers/). A
   Pages project has no scheduled entry point, so the site's existing
   functions/ directory cannot host a periodic job. This is a second
   deployable by necessity, not by preference.

   WHAT IT DOES:
     scheduled()  daily — drain email_outbox through Resend.
     fetch()      POST /run with a shared secret — the same drain, on
                  demand, for testing and for pushing a confirmation out
                  immediately rather than waiting for the next tick.

   WHAT IT DELIBERATELY DOES NOT DO: decide that anything is owed. Rows
   are enqueued by whoever knows the fact (the Stripe webhook, for a
   confirmation). This Worker only turns pending rows into sent mail. That
   split is what keeps "an order happened" and "an email was sent"
   independently retryable — see the header of the migration.
   ============================================================ */

import { fetchDueEmails, claimEmail, markSent, markFailed, type Db } from "./db";
import { sendEmail } from "./resend";
import { renderConfirmation } from "./templates/confirmation";
import type { OutboxRow, RenderedEmail } from "./types";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  /** Guards POST /run. Without it the endpoint is a public button that
      drains the outbox, which is a way to make someone else's outage
      into a duplicate-send incident. */
  MAILER_SHARED_SECRET: string;
  /** e.g. "ErgoFlo <orders@send.ergoflo.tech>". A SUBDOMAIN sender — see
      the DNS note in docs/plans/2026-08-06-transactional-email.md §5.
      Putting Resend's DKIM on the apex risks the MX that serves
      hello@ergoflo.tech, which /privacy publishes as the deletion address. */
  MAIL_FROM: string;
  MAIL_REPLY_TO: string;
}

/* Declared locally rather than imported from @cloudflare/workers-types.
   That package is the right long-term home for it, but adding a
   dependency means editing package.json, and this Worker is deliberately
   installable without touching the site's dependency tree. The handler
   ignores the controller entirely; this exists so the signature
   typechecks. Module-scoped, so it does not collide if workers-types is
   installed later. */
interface ScheduledController {
  cron: string;
  scheduledTime: number;
}

/** Per invocation. Keeps a backlog from running into the CPU limit
    mid-drain; the remainder is still pending and goes on the next tick. */
const BATCH_SIZE = 40;

/**
 * Pick the template. Returns null for kinds not yet built — those rows
 * stay pending rather than being marked failed, so they send as soon as
 * the template lands instead of needing a manual reset.
 */
function render(row: OutboxRow): RenderedEmail | null {
  const order = row.preorders;
  if (!order) return null;

  switch (row.kind) {
    case "confirmation":
      return renderConfirmation(order);
    /* update_30/60/90, address_check, shipped, delayed and
       cancelled_refunded are specified in
       docs/plans/2026-08-06-transactional-email.md §3 and not yet built.
       'delayed' in particular must be written before day 120, not
       improvised under time pressure — 16 CFR 435.2 governs its content. */
    default:
      return null;
  }
}

async function drain(env: Env): Promise<{ sent: number; failed: number; skipped: number }> {
  const db: Db = { url: env.SUPABASE_URL, key: env.SUPABASE_SECRET_KEY };
  const rows = await fetchDueEmails(db, BATCH_SIZE);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = render(row);
    if (!email) {
      /* No template, or an orphaned row with no order. Left pending on
         purpose; logged so it is visible rather than silently stuck. */
      console.warn("[mailer] no template for kind:", row.kind);
      skipped++;
      continue;
    }

    /* Compare-and-swap. If another run already took this row, move on. */
    if (!(await claimEmail(db, row.id))) {
      skipped++;
      continue;
    }

    const result = await sendEmail({
      apiKey: env.RESEND_API_KEY,
      from: env.MAIL_FROM,
      replyTo: env.MAIL_REPLY_TO,
      to: row.preorders!.email,
      email,
      idempotencyKey: row.id,
    });

    if (result.ok) {
      await markSent(db, row.id, result.id);
      sent++;
    } else {
      /* Code only. Never the recipient address, never the provider body. */
      console.error("[mailer] send failed:", row.kind, result.error);
      await markFailed(
        db,
        row.id,
        row.attempts,
        result.error ?? "unknown",
        result.retryable ?? false
      );
      failed++;
    }
  }

  return { sent, failed, skipped };
}

function configured(env: Env): boolean {
  return Boolean(
    env.SUPABASE_URL &&
      env.SUPABASE_SECRET_KEY &&
      env.RESEND_API_KEY &&
      env.MAIL_FROM
  );
}

export default {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    if (!configured(env)) {
      console.error("[mailer] missing env binding, skipping run");
      return;
    }
    const result = await drain(env);
    console.log(
      `[mailer] drain sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/run") {
      return new Response("Not found", { status: 404 });
    }
    if (!configured(env) || !env.MAILER_SHARED_SECRET) {
      return new Response("Not configured", { status: 503 });
    }

    /* Constant-time compare on the shared secret. A plain !== leaks how
       many leading characters matched via timing — the same reasoning as
       the signature check in functions/api/stripe-webhook.ts. */
    const provided = request.headers.get("x-mailer-secret") ?? "";
    if (!timingSafeEqualStr(provided, env.MAILER_SHARED_SECRET)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await drain(env);
    return Response.json(result);
  },
};

function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
