# ErgoFlo landing — memory audit & production hardening

**Date:** 2026-07-30
**Trigger:** Site crashed on a Namecheap host with a 1 GB memory limit.
**Status:** AUDIT COMPLETE — awaiting approval before any code change.

All numbers below were measured on this machine against a real production build
(`next build`, exit 0) running the actual `.next/standalone` server. Nothing here
is estimated.

---

## Verdict

**Yes — there is a real, unbounded memory leak, and it is in our code, not the framework.**

`lib/supabase.ts` calls `createClient()` on **every** request to `/api/notify`.
Each call leaks ~13 KB of *live* JS heap that survives forced garbage collection.
Under sustained POSTs the server grew from 113 MB to **2.53 GB** and was still
climbing linearly when the test stopped.

**But the leak is almost certainly not what crashed the Namecheap box.** The far
more likely immediate cause is that `deploy.sh` runs `docker compose up -d --build`
**on the server**, and a Next build peaks at **789 MB in a single process while
running 11 parallel workers**. `docs/DEPLOY.md` already says a build needs ~2 GB and
that a 1 GB instance "will OOM mid-build."

Both need fixing. They are independent problems.

---

## Measurements

### Build (this is what kills a 1 GB box)

| Metric | Value |
|---|---|
| Peak RSS, largest single process | **789 MB** |
| Parallel workers spawned | **11** (scales with CPU count) |
| Exit code | 0 |

Command: `/usr/bin/time -l node ./node_modules/next/dist/bin/next build`

### Runtime — steady state (healthy)

| Scenario | RSS |
|---|---|
| Idle after boot | 89 MB |
| 5,400 page requests (`/`, `/about`, `/privacy`) | **plateaus at 131 MB** |
| After `sharp` optimizes every allowed width | 266 MB |
| Repeat image passes (cache hits) | **plateaus at 304 MB** |

Page serving and image optimization are **clean** — both plateau. `sharp` costs a
one-time ~135 MB arena; that is expected, bounded, and not a leak.

### Runtime — `/api/notify` (the leak)

Identical 60,000 POSTs, two paths through the same route:

| Path | Start | End | Shape |
|---|---|---|---|
| Unique IP each request — reaches `createClient()` | 113 MB | **2,532 MB** | linear, no plateau |
| Same IP — rate limiter 429s **before** `createClient()` | 89 MB | 265 MB | flat plateau |

This is the isolation proof: same endpoint, same request count, same payload
size. The only difference is whether `createClient()` runs.

### Confirming it is a true leak, not lazy GC

20,000 clients, forcing `gc()` twice every 5,000 and dropping the reference:

| Clients | RSS | **Live heap (`used_heap_size`)** |
|---|---|---|
| 0 | 51 MB | 6 MB |
| 10,000 | 328 MB | 139 MB |
| 20,000 | 463 MB | **268 MB** |
| ref dropped + 2× gc() | 463 MB | **268 MB** |

Live heap survives forced collection. Genuine leak: **~13 KB live heap / ~20 KB RSS
per client**.

### The fix, measured before recommending it

Three-way comparison, 20,000 constructions each:

| Variant | End RSS |
|---|---|
| Unchanged (`persistSession: false`) | 459 MB |
| `autoRefreshToken: false` added | **459 MB — no effect** |
| **Module-level singleton** | **64 MB — flat** |

> **A hypothesis I had to discard.** `GoTrueClient.js:4313` sets an interval that
> holds a strong ref to each client, which made "disable auto-refresh" look like the
> fix. It measured *identically to the bug*. `GoTrueClient.nextInstanceID` was also
> ruled out — it stores integers, not clients. The exact retainer inside
> `@supabase/supabase-js@2.109.0` is **not identified**; the singleton is
> nonetheless proven to eliminate the growth. Recommending the auth-option change
> would have shipped a no-op.

Note `_initRealtimeClient` runs inside the `SupabaseClient` constructor, so every
call also builds a Realtime client — one reason each instance is expensive.

---

## Findings

### F1 — Per-request Supabase client (CRITICAL, the leak)
`lib/supabase.ts:19-24`. `getSupabaseAdmin()` constructs a new client per request.
**Fix:** module-level singleton, created once and reused.

### F2 — Build runs on the 1 GB server (CRITICAL, the likely crash)
`deploy.sh:129` → `docker compose up -d --build`. Needs ~2 GB; the host has 1 GB.
**Fix (pick one):** add 2 GB swap (documented, `docs/DEPLOY.md` step 2); or build
elsewhere and ship an image; or cap build parallelism. Swap is the smallest change.

### F3 — Rate limiter is bypassable behind Caddy (HIGH — this is what weaponizes F1)
`Caddyfile:55` uses `reverse_proxy web:3000` with **no `trusted_proxies`**. Caddy
*appends* to `X-Forwarded-For`, so an attacker-supplied value stays left-most, and
`clientIp()` (`lib/rate-limit.ts:73-77`) takes `split(",")[0]`. Rotating a spoofed
header gives unlimited requests — each one leaking ~20 KB.

`lib/rate-limit.ts:17-21` **predicted this in a comment**: "safe on Vercel and would
not be on a bare Node server." The deployment moved to a bare Node server.

**Fix:** set `trusted_proxies` in Caddy and read the *right-most* untrusted hop,
or have Caddy overwrite `X-Forwarded-For` rather than append.

Combined blast radius: ~43,000 spoofed POSTs to exhaust 1 GB. Trivial to automate.

### F4 — `public/product-hero.png` is 2.3 MB and unreferenced (MEDIUM)
Nothing imports it (`ProductRender.tsx:32` uses `product-render.webp`). It ships in
the image and is still reachable at `/_next/image?url=/product-hero.png&w=3840`,
forcing `sharp` to decode 2.3 MB on demand. **Fix:** delete it.

### F5 — Local `npm run` is broken by a stray Node 18 (LOW, local only)
`~/node_modules/.bin/node` → **v18.20.8** shadows nvm's v20.20.2 for every
`npm run` under the home directory. Production is unaffected (`node:22-slim`).
Already recorded in memory as `env_stray_node_modules.md`.

### What is NOT a problem

- **Client components are clean.** Every `useEffect` in `flow-field-background.tsx`,
  `scroll-morph-hero.tsx`, `ComparisonSlider.tsx`, `Header.tsx` and `CountUp.tsx`
  cancels its rAF / disconnects its observer / clears its timers on unmount.
- **The rate-limiter Map is not a leak.** Capped at 10,000 small buckets with an
  opportunistic sweep.
- **`sharp` is not a leak.** Bounded ~135 MB arena; widths are allowlisted.
- **Page serving is not a leak.** Flat at 131 MB across 5,400 requests.
- One nit: `flow-field-background.tsx` runs its rAF loop even when scrolled
  off-screen — a client CPU/battery cost, not server memory.

---

## Proposed changes

| # | File | Change | Risk |
|---|---|---|---|
| 1 | `lib/supabase.ts` | Singleton client instead of per-request | Low |
| 2 | `Caddyfile` | Add `trusted_proxies`; read client IP correctly | Low |
| 3 | `lib/rate-limit.ts` | Take right-most untrusted hop from XFF | Low |
| 4 | `public/product-hero.png` | Delete (unreferenced, 2.3 MB) | Low |
| 5 | `docs/DEPLOY.md` | Namecheap 1 GB section: swap is mandatory | None |
| 6 | `docker-compose.yml` | Add a `mem_limit` on `web` so a leak degrades one container instead of the host | Low |

## Do NOT touch

- The Supabase **auth options** (`persistSession: false`) — measured as having no
  effect on the leak. Changing them is noise.
- `SUPABASE_SECRET_KEY` handling, `server-only` imports, `env_file` wiring.
- The honeypot, the `product` allowlist, the 23505 unique-violation branch, or the
  unique constraint on `email` — all load-bearing.
- The rate limiter's existence. F3 fixes how the IP is *derived*, not the limit.
- `caddy_data` volume. Never `docker compose down -v`.
- CSP `img-src ... images.unsplash.com` — the hero needs it.
- The removal of the `Offer` JSON-LD node and all commerce (patent exposure).

## Verification commands

```bash
# 1. Build still succeeds — check $? directly, not a pipe (zsh has no PIPESTATUS)
node ./node_modules/next/dist/bin/next build > /tmp/build.log 2>&1; echo "EXIT=$?"
grep -nE 'error|Compiled successfully' /tmp/build.log

# 2. Leak is gone — must PLATEAU, not climb
#    (start stub on :4999, run standalone server with SUPABASE_URL pointed at it)
node scratchpad/load.js 12000    # repeat 5x, print RSS between runs
#    PASS = flat after the first round.  FAIL = linear growth.

# 3. Rate limiter no longer spoofable — expect 429s despite rotating XFF
for i in $(seq 1 20); do
  curl -s -o /dev/null -w '%{http_code} ' -H 'Content-Type: application/json' \
    -H "X-Forwarded-For: 10.0.0.$i" -d '{"email":"a@b.co"}' \
    https://ergoflo.tech/api/notify
done
```

## Open question for the user

Is the target host a Namecheap **VPS** (root, Docker, can add swap) or **shared
cPanel hosting** (no Docker at all)? If it is shared hosting, this entire Docker +
Caddy stack cannot run and the answer is a different deployment shape — that
decision comes before any of the changes above.
