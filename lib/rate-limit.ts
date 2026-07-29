import "server-only";

/* ============================================================
   FIXED-WINDOW RATE LIMITER — in-process, no dependencies.

   KNOWN LIMITATION, STATED PLAINLY: this is best-effort. On Vercel the
   app runs across multiple serverless instances and each holds its own
   Map, so the real ceiling is roughly LIMIT × (number of warm
   instances), and a cold start resets a bucket early. It stops casual
   abuse and scripted floods; it is not a defence against a distributed
   attacker.

   Everything is deliberately behind this one module so the store can be
   swapped for Vercel KV, Upstash, or Redis without the route changing:
   keep the `check()` signature and replace the Map.

   The IP is read from x-forwarded-for, which Vercel populates at the
   edge. That header is trivially spoofable when the app is NOT behind a
   proxy that overwrites it — so this is safe on Vercel and would not be
   on a bare Node server. Noted because the deployment target is part of
   why this is acceptable.
   ============================================================ */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Cap the Map so a flood of unique IPs can't grow it without bound. */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets — sent as Retry-After on a 429. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
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
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { ok: true, retryAfter: 0 };
}

/**
 * Best available client IP. `x-forwarded-for` may be a comma-separated
 * chain; the left-most entry is the original client.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
