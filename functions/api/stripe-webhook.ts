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

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
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
    /* Falls back to 120 rather than 0 if metadata is somehow absent —
       recording a zero-day promise against an order would misstate the
       Mail Order Rule obligation for that customer. */
    promised_ship_days: Number(session.metadata?.promised_ship_days ?? 120),
    status: "paid",
  };

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/preorders`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { code?: string } | null;

    /* 23505 = unique_violation on stripe_session_id. This is the NORMAL
       path for a retry, not an error — Stripe redelivers until it sees a
       2xx, so the second delivery of a successfully-handled event lands
       here. Returning 200 is what makes the handler idempotent. */
    if (detail?.code === "23505") return new Response("Already recorded", { status: 200 });

    /* Log the code only, never the row: it holds an email and a home
       address. Same rule as /api/notify. 500 so Stripe retries — a
       transient Supabase failure must not lose a paid order. */
    console.error(
      "[/api/stripe-webhook] insert failed, code:",
      detail?.code ?? res.status
    );
    return new Response("Insert failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
