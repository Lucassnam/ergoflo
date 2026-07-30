/* ============================================================
   POST /api/notify — Cloudflare Pages Function.

   Replaces the old Next route at app/api/notify/route.ts, which cannot
   exist in a static export. Same URL, same request/response shapes, same
   six defence layers. The client (components/NotifyForm.tsx) did not
   change.

   WHY RAW fetch AND NOT @supabase/supabase-js:
   The old route called createClient() on every request. That leaked ~13 KB
   of LIVE heap per request — measured at 113 MB -> 2.5 GB over 60k POSTs,
   and it survived a forced gc(). A module-level singleton fixes it (64 MB,
   flat), but a plain fetch to PostgREST removes the entire failure class:
   there is no client object to retain, no WebSocket-dependent constructor
   to run on the Workers runtime, and nothing to bundle. Do not "simplify"
   this back to the SDK without re-running the memory test in
   docs/plans/2026-07-30-memory-audit-and-production-hardening.md.

   Layers, outermost first:
     1. Rate limit per IP.
     2. Content-Type check, so only real JSON posts get parsed.
     3. Body size cap, applied before the JSON parser sees it.
     4. Honeypot field — a filled `website` returns the SAME 200 a real
        signup gets, and writes nothing. Bots must not be able to tell
        rejection from success, or they retry with the field removed.
     5. Email length + shape validation.
     6. `product` allowlist — anything unrecognised becomes null.

   NOTE: the unique constraint on `email` (see the migration) is what makes
   duplicate submissions harmless, and the 23505 branch below depends on
   it. Do not drop that constraint.
   ============================================================ */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}

/** 5 signups per IP per 10 minutes. Generous for a human, useless for a script. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** Bytes. A legitimate payload here is well under 200. */
const MAX_BODY_BYTES = 2_000;

/** RFC-shaped enough for a signup form; the real check is the confirmation email. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Must match PRODUCT_LABELS in app/notify/page.tsx. */
const ALLOWED_PRODUCTS = new Set(["passive-panel", "complete-backpack"]);

/** Identical success shape, used for both real signups and honeypot hits. */
const success = () => Response.json({ ok: true });

/* ---------- rate limiter ----------
   Fixed window, in-isolate. Cloudflare runs many isolates and recycles
   them, so the real ceiling is roughly LIMIT x (live isolates) and a cold
   isolate resets a bucket early. It stops casual abuse and scripted
   floods; it is not a defence against a distributed attacker. For a hard
   guarantee this needs Durable Objects or KV — deliberately not worth it
   for a waitlist.

   THE IP IS NOT SPOOFABLE HERE, and that is the whole point of using
   CF-Connecting-IP. The previous deployment read the left-most entry of
   `x-forwarded-for` from behind Caddy, which APPENDS rather than
   overwrites — so the client controlled it and could bypass the limit by
   rotating a header. Cloudflare sets CF-Connecting-IP itself and strips
   any client-supplied copy. Never switch this back to x-forwarded-for. */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Cap the Map so a flood of unique IPs can't grow it without bound. */
const MAX_TRACKED_KEYS = 10_000;

function checkRateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // Opportunistic sweep of expired buckets, so this never needs a timer.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
      // Still full of live buckets — drop the oldest rather than grow.
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

  // Degrade to a clear 503 rather than throwing, exactly as the old route
  // did — a missing binding should not look like a server crash.
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "The notify list isn't configured yet." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const limit = checkRateLimit(`notify:${ip}`);
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

  // Honeypot. Real users never see this field, so anything in it is a bot.
  // Returning the success shape is deliberate — see the header comment.
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return success();
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const product =
    typeof payload.product === "string" && ALLOWED_PRODUCTS.has(payload.product)
      ? payload.product
      : null;

  /* PostgREST insert. `return=minimal` keeps the row out of the response —
     no reason to echo an email back over the wire. The secret key bypasses
     RLS and MUST stay server-side; it is a Pages environment variable and
     never reaches the browser. */
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/notify_signups`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email, product }),
  });

  if (!res.ok) {
    // 23505 = unique_violation — already on the list, treat as a success.
    const detail = (await res.json().catch(() => null)) as { code?: string } | null;
    if (detail?.code === "23505") return success();

    // Log the code, not the message or the email: server logs are a common
    // accidental path for personal data into third-party log viewers.
    console.error("[/api/notify] insert failed, code:", detail?.code ?? res.status);
    return Response.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }

  return success();
}
