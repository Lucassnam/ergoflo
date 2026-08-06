/* ============================================================
   Resend, over raw fetch.

   NO SDK, for the reasons already established in
   functions/api/notify.ts and functions/api/checkout.ts: a per-request
   client object leaked ~13 KB of live heap there (113 MB -> 2.5 GB over
   60k requests, surviving a forced gc()), and SDKs written for Node pull
   in built-ins the Workers runtime does not have. Sending an email is one
   POST with a JSON body. Do not add a dependency for it.
   ============================================================ */

import type { RenderedEmail } from "./types";

export interface SendResult {
  ok: boolean;
  /** Resend's message id, for the outbox row. */
  id?: string;
  /** Short code or reason. NEVER the raw response body -- Resend echoes
      the recipient address back, and this string is written to
      email_outbox.last_error where anyone with dashboard access reads it. */
  error?: string;
  /** True for 429 and 5xx: worth another attempt later. False for a
      malformed address or a rejected domain, where retrying just burns
      sending reputation against the same bad input. */
  retryable?: boolean;
}

export interface SendOptions {
  apiKey: string;
  from: string;
  replyTo: string;
  to: string;
  email: RenderedEmail;
  /** Outbox row id. Resend deduplicates on this, so a redelivery that
      races the status update cannot produce a second message. Belt and
      braces over the unique (order_id, kind) constraint. */
  idempotencyKey: string;
}

export async function sendEmail({
  apiKey,
  from,
  replyTo,
  to,
  email,
  idempotencyKey,
}: SendOptions): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
  } catch {
    /* Network-level failure. Always worth retrying -- it says nothing
       about whether the message itself is deliverable. */
    return { ok: false, error: "network", retryable: true };
  }

  if (res.ok) {
    const body = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, id: body?.id };
  }

  /* Read the error NAME only. The `message` field frequently contains the
     recipient address and sometimes a fragment of the payload. */
  const detail = (await res.json().catch(() => null)) as {
    name?: string;
  } | null;

  return {
    ok: false,
    error: detail?.name ?? `http_${res.status}`,
    /* 429 = rate limited, 5xx = their side. Everything else (422 invalid
       address, 403 unverified domain, 401 bad key) is a fact about the
       request that a retry cannot change. */
    retryable: res.status === 429 || res.status >= 500,
  };
}
