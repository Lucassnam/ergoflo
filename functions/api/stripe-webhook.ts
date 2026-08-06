/* ============================================================
   POST /api/stripe-webhook — Cloudflare Pages Function.

   THIS, NOT THE SUCCESS PAGE, IS WHAT RECORDS A PAID ORDER.
   /preorder/success is a URL. Anyone can visit it, a buyer can close the
   tab before it loads, and a mobile browser can drop the redirect
   entirely. If the success page wrote orders, you would have both forged
   orders and missing real ones. Stripe retries this endpoint until it
   gets a 2xx, which is the only delivery guarantee in the flow.

   SIGNATURE VERIFICATION IS NOT OPTIONAL. The URL is public. Without a
   verified signature anyone who finds it can POST a fake
   checkout.session.completed and mint themselves a paid order. The
   verification below is a hand-rolled equivalent of stripe.webhooks
   .constructEvent, using Web Crypto because the Workers runtime has no
   Node `crypto` module and we are not pulling in the SDK (see the header
   of functions/api/checkout.ts for why).

   Three things the verification must do, and all three are load-bearing:
     1. HMAC-SHA256 over `${timestamp}.${rawBody}` with the endpoint
        secret — over the RAW body, before any JSON parsing. Re-serialising
        parsed JSON changes bytes and every signature fails.
     2. Timing-safe comparison, so the check cannot be brute-forced by
        measuring how long a wrong prefix takes to reject.
     3. A timestamp tolerance, so a captured-and-replayed request from
        last month is refused.
   ============================================================ */

/* These imports are RELATIVE, not `@/lib`. The path alias is a tsconfig
   feature that the Pages Functions bundler does not read — that is what
   the "cannot import from @/lib" note in checkout.ts means. A relative
   import bundles fine, and lib/site.ts is a pure module with no imports
   of its own, so nothing React- or Node-shaped comes with it.

   Prefer this over hand-mirroring constants. checkout.ts mirrors four of
   them because it was written before this was established; that block is
   a known drift hazard, not a pattern to copy. */
import {
  REFUND_POLICY,
  NOT_A_COMPANY_NOTICE,
  SELLER_OF_RECORD,
  BRAND,
} from "../../lib/site";
import { shipByDate, toDateColumn, SHIP_WINDOW_PHRASE } from "../../lib/shipping";

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  /* Optional. When both are set, a paid order pokes the mailer Worker so
     the confirmation goes out in seconds instead of waiting for the next
     scheduled drain. Absent, everything still works -- the cron picks the
     rows up on its next pass. Never make these required: a missing env
     var must not be able to stop an order being recorded. */
  MAILER_URL?: string;
  MAILER_SHARED_SECRET?: string;
}

/* Crockford base32 without I, L, O, U — removes the character pairs a
   customer misreads over the phone and the one that produces unfortunate
   words by accident. */
const ORDER_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Human-readable order reference, e.g. `EF-2608-K3M9NQ2T`.
 *
 * The uuid primary key is the real identity; this exists because nobody
 * can read a uuid down the phone or type it into a support reply. The
 * date segment makes an order's age obvious at a glance, which matters
 * when the promise is 120 days long.
 *
 * 8 random characters over a 32-symbol alphabet is ~1.1e12 values. A
 * collision would surface as a unique violation on insert, which the
 * handler below distinguishes from the stripe_session_id case and
 * retries — see the 23505 branch.
 */
function generateOrderNumber(now: Date): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let suffix = "";
  for (const b of bytes) suffix += ORDER_ALPHABET[b % 32];
  return `EF-${yy}${mm}-${suffix}`;
}

/** Stripe's own default. Rejects replays of captured requests. */
const TOLERANCE_SECONDS = 300;

const encoder = new TextEncoder();

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

/** Constant-time compare. A plain `===` on a hex string leaks how many
    leading characters matched via timing, which is enough to forge a
    signature byte by byte given enough attempts. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string
): Promise<boolean> {
  if (!header) return false;

  /* Header shape: `t=1699999999,v1=abc...,v1=def...`
     Multiple v1 entries appear while an endpoint secret is being rotated.
     Accept if ANY of them matches, or rotation breaks live webhooks. */
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === "t") timestamp = value;
    else if (key === "v1") signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${rawBody}`))
  );

  for (const sig of signatures) {
    const provided = hexToBytes(sig);
    if (provided && timingSafeEqual(expected, provided)) return true;
  }
  return false;
}

/* Shape of the bits of checkout.session.completed we actually read.
   Deliberately partial — Stripe adds fields constantly and a strict type
   here would be wrong within a quarter. */
interface CheckoutSession {
  id?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  customer_email?: string | null;
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
  /* `collected_information.shipping_details` on 2024-06-20 and later;
     `shipping_details` on older versions. Both are read below because the
     account-level API version can be changed from the dashboard by
     someone who has never seen this file. */
  collected_information?: {
    shipping_details?: StripeShipping | null;
  } | null;
  shipping_details?: StripeShipping | null;
}

interface StripeShipping {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  /* Pages Functions provide this. Optional in the type because the local
     wrangler dev shim has been inconsistent about it, and a missing
     waitUntil must degrade to "ping synchronously" rather than throw. */
  waitUntil?: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    console.error("[/api/stripe-webhook] missing env binding");
    /* 500, not 503: Stripe retries 5xx. A misconfiguration should cause
       redelivery once it is fixed, not silent loss of a paid order. */
    return new Response("Not configured", { status: 500 });
  }

  /* Read the RAW text and never re-serialise it. JSON.parse followed by
     JSON.stringify produces different bytes (key order, whitespace,
     unicode escaping) and every signature check would fail. */
  const rawBody = await request.text().catch(() => null);
  if (rawBody === null) return new Response("Bad request", { status: 400 });

  const valid = await verifyStripeSignature(
    rawBody,
    request.headers.get("stripe-signature"),
    env.STRIPE_WEBHOOK_SECRET
  );
  if (!valid) {
    console.error("[/api/stripe-webhook] signature verification failed");
    /* 400, not 401. This is deliberate: Stripe does not retry 4xx, and an
       unsigned request is not something a retry would fix. It also means
       an attacker probing the endpoint gets no retry amplification. */
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { type?: string; data?: { object?: CheckoutSession } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  /* Acknowledge everything we do not handle. Returning an error for an
     event type we did not subscribe to makes Stripe retry it forever and
     eventually disable the endpoint — taking the events we DO care about
     down with it. */
  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data?.object ?? {};

  /* A completed session is not necessarily a paid one — delayed payment
     methods complete as `unpaid` and settle later. Recording those as
     paid orders would mean shipping against money that never arrived. */
  if (session.payment_status !== "paid") {
    return new Response("Not paid", { status: 200 });
  }

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  if (!email || !session.id) {
    console.error("[/api/stripe-webhook] completed session missing id or email");
    return new Response("Incomplete session", { status: 200 });
  }

  const shipping =
    session.collected_information?.shipping_details ??
    session.shipping_details ??
    null;
  const addr = shipping?.address ?? null;

  const now = new Date();
  /* Falls back to 120 rather than 0 if metadata is somehow absent —
     recording a zero-day promise against an order would misstate the
     Mail Order Rule obligation for that customer. Route A (the hosted
     Payment Link) never sets this metadata, so this fallback is the
     normal path today, not the exceptional one. */
  const promisedDays = Number(session.metadata?.promised_ship_days ?? 120);

  const row = {
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent ?? null,
    email: email.trim().toLowerCase(),
    shipping_name: shipping?.name ?? session.customer_details?.name ?? null,
    shipping_line1: addr?.line1 ?? null,
    shipping_line2: addr?.line2 ?? null,
    shipping_city: addr?.city ?? null,
    shipping_state: addr?.state ?? null,
    shipping_postal_code: addr?.postal_code ?? null,
    shipping_country: addr?.country ?? null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    promised_ship_days: promisedDays,
    order_number: generateOrderNumber(now),
    /* The concrete date this buyer is promised, computed once here and
       never recomputed. See lib/shipping.ts. */
    promised_ship_date: toDateColumn(shipByDate(now, promisedDays)),
    /* The terms THIS buyer bought under, frozen now. The site's legal
       copy changes — REFUND_POLICY was already narrowed once on
       2026-08-04 — and the emails in this sequence go out up to four
       months later. Quoting today's constant in a day-90 email would
       state terms the buyer never agreed to. */
    terms_snapshot: {
      refund_policy: REFUND_POLICY,
      not_a_company_notice: NOT_A_COMPANY_NOTICE,
      ship_window_phrase: SHIP_WINDOW_PHRASE,
      seller_of_record: SELLER_OF_RECORD,
      product_name: `${BRAND} Flopack V1 panel`,
    },
    status: "paid",
  };

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/preorders`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      /* representation, not minimal: we need the new row's id to enqueue
         the confirmation email without a second round trip. */
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  let orderId: string | null = null;

  if (res.ok) {
    const inserted = (await res.json().catch(() => null)) as
      | Array<{ id?: string }>
      | null;
    orderId = inserted?.[0]?.id ?? null;
  } else {
    const detail = (await res.json().catch(() => null)) as {
      code?: string;
      details?: string;
      message?: string;
    } | null;

    /* 23505 = unique_violation. TWO different constraints can raise it
       here and they need opposite responses:

         - stripe_session_id: the NORMAL retry path. Stripe redelivers
           until it sees a 2xx, so the second delivery of a
           successfully-handled event lands here. Idempotent, return 200.

         - order_number: a genuine (astronomically unlikely) collision on
           the random reference. Returning 200 here would silently DROP a
           paid order. Fall through to the 500 so Stripe retries and a
           fresh order number is generated.

       Treating every 23505 as "already recorded" is the bug this branch
       exists to avoid. */
    const violation = `${detail?.details ?? ""} ${detail?.message ?? ""}`;
    const isDuplicateSession =
      detail?.code === "23505" && violation.includes("stripe_session_id");

    if (isDuplicateSession) {
      /* A redelivery. The order row exists, but we may have died last
         time BETWEEN the insert and the enqueue — so look the id up and
         fall through to the enqueue rather than returning here. The
         outbox's unique (order_id, kind) makes doing it twice a no-op.
         This is the whole reason this path does not return early. */
      const params = new URLSearchParams({
        select: "id",
        stripe_session_id: `eq.${session.id}`,
        limit: "1",
      });
      const lookup = await fetch(
        `${env.SUPABASE_URL}/rest/v1/preorders?${params}`,
        {
          headers: {
            apikey: env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
          },
        }
      );
      const found = (await lookup.json().catch(() => null)) as
        | Array<{ id?: string }>
        | null;
      orderId = found?.[0]?.id ?? null;
    } else {
      /* Log the code only, never the row: it holds an email and a home
         address. Same rule as /api/notify. 500 so Stripe retries — a
         transient Supabase failure must not lose a paid order. */
      console.error(
        "[/api/stripe-webhook] insert failed, code:",
        detail?.code ?? res.status
      );
      return new Response("Insert failed", { status: 500 });
    }
  }

  /* ---- Enqueue the confirmation email. -----------------------------
     NOT a send. This handler must return 2xx or Stripe retries, and a
     provider outage must not put a paid order at risk. Writing a row
     here and letting workers/ergoflo-mailer drain it makes the order and
     the email independently retryable.

     A failure to enqueue does NOT fail the webhook. The order is
     recorded and that is the fact worth protecting; a missing
     confirmation is recoverable by hand from the outbox, whereas a lost
     order is not recoverable at all. */
  if (orderId) {
    /* Two messages, one insert. They answer different questions — the
       receipt is what was charged, the confirmation is what happens next
       — and a buyer hunting for one should not have to read past the
       other. Both rows go in together so a partial write cannot leave an
       order with a receipt and no shipping date. */
    const enqueue = await fetch(`${env.SUPABASE_URL}/rest/v1/email_outbox`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        { order_id: orderId, kind: "receipt" },
        { order_id: orderId, kind: "confirmation" },
      ]),
    });

    if (!enqueue.ok) {
      const detail = (await enqueue.json().catch(() => null)) as {
        code?: string;
      } | null;
      /* 23505 on (order_id, kind) is the expected outcome of a
         redelivery: already queued or already sent. Not an error. */
      if (detail?.code !== "23505") {
        console.error(
          "[/api/stripe-webhook] enqueue failed, code:",
          detail?.code ?? enqueue.status
        );
      }
    }
    /* ---- Poke the mailer so the buyer gets their email in seconds.
       WHY THIS IS FIRE-AND-FORGET, AND MUST STAY THAT WAY:
       Stripe wants a fast 2xx and retries anything else. If this call
       were awaited and the Worker were slow or down, the webhook would
       be slow or fail, and Stripe would redeliver an order that was
       already recorded correctly. The email is not worth risking the
       order record for.

       waitUntil lets the response return immediately while the request
       finishes in the background. If the ping never lands, the Worker's
       scheduled drain sends the same rows on its next pass -- this is a
       latency optimisation, not a delivery mechanism. */
    if (env.MAILER_URL && env.MAILER_SHARED_SECRET) {
      const ping = fetch(`${env.MAILER_URL.replace(/\/$/, "")}/run`, {
        method: "POST",
        headers: { "x-mailer-secret": env.MAILER_SHARED_SECRET },
      }).catch(() => {
        /* Swallowed on purpose. A failed ping is invisible to the buyer
           and self-heals on the next drain. */
      });
      if (context.waitUntil) context.waitUntil(ping);
    }
  } else {
    console.error("[/api/stripe-webhook] no order id, confirmation not queued");
  }

  return new Response("OK", { status: 200 });
}
