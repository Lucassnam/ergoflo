/* ============================================================
   POST /api/checkout — Cloudflare Pages Function.

   Creates a Stripe Checkout Session and returns its hosted URL. The
   browser then navigates to it. We never see a card number, which keeps
   this project in PCI SAQ-A.

   WHY RAW fetch AND NOT THE stripe SDK:
   Same reason functions/api/notify.ts uses raw fetch instead of
   @supabase/supabase-js. A per-request client object leaked ~13 KB of
   live heap per request there (measured 113 MB -> 2.5 GB over 60k POSTs,
   surviving a forced gc()). The Stripe SDK is heavier still and pulls in
   Node built-ins the Workers runtime does not have. Two form-encoded
   POSTs need no SDK. Do not "modernise" this.

   THE PRICE IS NOT ACCEPTED FROM THE CLIENT. It is hardcoded server-side
   below. This is the single most important line in the file: a checkout
   endpoint that trusts a client-supplied amount lets anyone buy a $49.99
   product for one cent by editing a fetch body in devtools. The client
   sends an email address and nothing else that touches money.

   Defence layers, outermost first:
     1. PREORDERS_ENABLED kill switch (returns 503).
     2. Rate limit per IP.
     3. Content-Type check.
     4. Body size cap, before the JSON parser.
     5. Honeypot — a filled `website` returns a fake-success shape.
     6. Email length + shape validation.
   ============================================================ */

interface Env {
  STRIPE_SECRET_KEY: string;
  SITE_URL?: string;
}

/* ---- Mirrored from lib/site.ts. -------------------------------------
   Pages Functions are bundled separately from the Next app and cannot
   import from @/lib. These MUST be kept in step with lib/site.ts by
   hand. If you change a price or the lead time there, change it here in
   the same commit — a mismatch means the page advertises one thing and
   Stripe charges another, which is the exact fact pattern behind a
   deceptive-pricing complaint.

   PREORDERS_ENABLED is the exception: lib/site.ts DERIVES it from
   STRIPE_LINK, while this is a deliberate second kill switch that is
   hardcoded false. It is not a mirror and is not meant to agree. */
const PREORDERS_ENABLED = false;

/* Flat price, mirroring lib/site.ts. The two-tier early-bird scheme was
   removed 2026-08-06; keep this in step by hand if the price changes. */
const PRICE_CENTS = 4999;

const CURRENCY = "usd";
const LEAD_TIME_DAYS = 120;

const PRODUCT_NAME = "ErgoFlo Active Fan panel — preorder";
/* Shown on the Stripe Checkout page and on the card statement descriptor
   suffix. The buyer sees this at the moment of payment, so the unbuilt
   status and the ship window belong here, not only on our own page. */
/* The final clause used to read "Cancel any time before shipment for a
   full refund." That stopped being true on 2026-08-04 when the policy
   narrowed to all-sales-final-except-on-delay, and this string was
   missed — it is in the route-B path, which is switched off, so it has
   never been shown to a buyer. Corrected 2026-08-06.

   It has to match REFUND_POLICY in lib/site.ts, because this is the
   text Stripe shows at the moment of payment. A refund promise made on
   the checkout page is the one a buyer would reasonably rely on, and it
   would override anything narrower on our own site. */
const PRODUCT_DESCRIPTION =
  `Preorder for a product that has not been built yet. Ships in about ${LEAD_TIME_DAYS} days. ` +
  `Free US shipping. Batteries not included — takes AA cells you supply. ` +
  `Preorders are final, with no change-of-mind refunds; full refund if we miss the ` +
  `${LEAD_TIME_DAYS}-day window, abandon the project, or your order arrives damaged.`;

/** 5 attempts per IP per 10 minutes, matching /api/notify. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MAX_BODY_BYTES = 2_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Fixed-window in-isolate limiter, same trade-off as /api/notify: many
   isolates means the real ceiling is LIMIT x (live isolates). Stops
   casual abuse and scripted floods, not a distributed attacker. Stripe
   itself rate-limits and fingerprints beyond this. */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

function checkRateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
      if (buckets.size >= MAX_TRACKED_KEYS) {
        const oldest = buckets.keys().next().value;
        if (oldest !== undefined) buckets.delete(oldest);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > RATE_LIMIT.limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  /* The kill switch comes FIRST — before rate limiting, before parsing,
     before anything that could have a side effect. While this is false
     there is no code path to a live charge, whatever else is wrong. */
  if (!PREORDERS_ENABLED) {
    return Response.json(
      {
        error:
          "Preorders aren't open yet. Leave your email on the notify list and we'll tell you the moment they are.",
      },
      { status: 503 }
    );
  }

  if (!env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: "Checkout isn't configured yet." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const limit = checkRateLimit(`checkout:${ip}`);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Invalid request." }, { status: 415 });
  }

  const raw = await request.text().catch(() => null);
  if (raw === null || raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Invalid request." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;

  /* Honeypot. Returns a URL-less success so a bot cannot distinguish
     rejection from acceptance — same principle as /api/notify, except
     here we must not hand back a real Stripe URL. */
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return Response.json({ ok: true, url: null });
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  /* Derive the origin from the request rather than trusting a header or
     an env var that could drift from reality. Stripe rejects non-absolute
     return URLs, and a wrong origin here strands the buyer after payment. */
  const origin = env.SITE_URL ?? new URL(request.url).origin;

  /* Stripe's API is form-encoded, including nested keys via bracket
     notation. This is the whole reason the SDK exists; it is also about
     fifteen lines to do by hand. */
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("customer_email", email);
  form.set("success_url", `${origin}/preorder/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/preorder?cancelled=1`);

  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", CURRENCY);
  /* Server-side only: the amount is never accepted from the client. */
  form.set("line_items[0][price_data][unit_amount]", String(PRICE_CENTS));
  form.set("line_items[0][price_data][product_data][name]", PRODUCT_NAME);
  form.set(
    "line_items[0][price_data][product_data][description]",
    PRODUCT_DESCRIPTION
  );

  /* A shipping address is required to ship a physical good, and US-only
     matches SHIPS_TO in lib/site.ts. Narrow allowed_countries is not
     cosmetic: it is what keeps GDPR, UK GDPR, EU GPSR and per-destination
     lithium air-freight rules out of scope. Do not widen it casually. */
  form.set("shipping_address_collection[allowed_countries][0]", "US");

  /* Free shipping as an explicit $0 rate, so the buyer sees a line that
     says "Free shipping" rather than an absent field they have to infer. */
  form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "0");
  form.set(
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]",
    CURRENCY
  );
  form.set(
    "shipping_options[0][shipping_rate_data][display_name]",
    "Free shipping"
  );

  /* Carried through to the webhook so a recorded order keeps the promise
     it was actually sold under, even if LEAD_TIME_DAYS later changes. */
  form.set("metadata[promised_ship_days]", String(LEAD_TIME_DAYS));

  /* Stripe renders these as required checkboxes. The buyer cannot pay
     without accepting them, which is what makes the terms part of the
     contract rather than something linked from a footer they never read. */
  form.set("consent_collection[terms_of_service]", "required");
  form.set(
    "custom_text[terms_of_service_acceptance][message]",
    `I understand this is a preorder for a product that has not been built yet, ` +
      `and that it ships in about ${LEAD_TIME_DAYS} days. I can cancel for a full ` +
      `refund any time before it ships. [Terms](${origin}/terms) · [Refunds](${origin}/refunds)`
  );

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      /* Pin the API version. Stripe ships breaking changes behind dated
         versions, and an account-level default can be upgraded from the
         dashboard by someone who has no idea this code exists. */
      "Stripe-Version": "2024-06-20",
      /* Idempotency: a double-clicked button or a retried fetch must not
         create two sessions (and two chances to pay) for the same buyer.
         Keyed per email per minute — tight enough to dedupe a stutter,
         loose enough that a genuine retry a minute later works. */
      "Idempotency-Key": `checkout:${email}:${Math.floor(Date.now() / 60_000)}`,
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as {
      error?: { code?: string; type?: string };
    } | null;
    /* Log the code and type only. Stripe error messages can echo request
       content back, and this endpoint handles an email address — server
       logs are a well-worn accidental path for personal data into
       third-party log viewers. Same rule as /api/notify. */
    console.error(
      "[/api/checkout] stripe error:",
      detail?.error?.type ?? res.status,
      detail?.error?.code ?? ""
    );
    return Response.json(
      { error: "We couldn't start checkout. Try again in a moment." },
      { status: 502 }
    );
  }

  const session = (await res.json()) as { url?: string };
  if (!session.url) {
    console.error("[/api/checkout] session created with no url");
    return Response.json(
      { error: "We couldn't start checkout. Try again in a moment." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, url: session.url });
}
