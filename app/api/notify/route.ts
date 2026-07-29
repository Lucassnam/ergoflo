import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/* ============================================================
   POST /api/notify — the only write endpoint on the site.

   Hardened 2026-07-29. Before that it accepted unlimited requests from
   anyone: a loop could fill the table, and any 64-character attacker
   string was persisted in `product`.

   Layers, outermost first:
     1. Rate limit per IP (best-effort — see lib/rate-limit.ts).
     2. Content-Type check, so only real JSON posts get parsed.
     3. Body size cap, applied before the JSON parser sees it.
     4. Honeypot field — a filled `website` returns the SAME 200 a real
        signup gets, and writes nothing. Bots must not be able to tell
        rejection from success, or they retry with the field removed.
     5. Email length + shape validation.
     6. `product` allowlist — anything unrecognised becomes null.

   NOTE: the unique constraint on `email` (see the migration) is what
   makes duplicate submissions harmless, and the 23505 branch below
   depends on it. Do not drop that constraint.
   ============================================================ */

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

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return Response.json(
      { error: "The notify list isn't configured yet." },
      { status: 503 }
    );
  }

  const limit = checkRateLimit(`notify:${clientIp(request)}`, RATE_LIMIT);
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

  const supabase = getSupabaseAdmin()!;
  const { error } = await supabase.from("notify_signups").insert({ email, product });

  // 23505 = unique_violation — already on the list, treat as a success.
  if (error && error.code !== "23505") {
    // Log the code, not the message or the email: server logs are a common
    // accidental path for personal data into third-party log viewers.
    console.error("[/api/notify] insert failed, code:", error.code);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  return success();
}
