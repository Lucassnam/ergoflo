# ErgoFlo landing — cPanel deployment re-plan (supersedes the VPS fixes)

**Date:** 2026-07-30
**Supersedes:** the deployment half of `2026-07-30-memory-audit-and-production-hardening.md`
**Status:** PROVEN FEASIBLE — awaiting approval before changing the real repo.

Read the memory audit doc first for the leak evidence. This doc covers **where the
site should run**, which the cPanel answer changed fundamentally.

---

## The headline

**On Namecheap cPanel, the memory problem disappears entirely — because there is no
Node process at all.**

This site is already 95% static. The only two things that needed a server were
`/api/notify` and a `?product=` query param on `/notify`. Both have clean
workarounds. A static export was **built and verified**, exit 0:

```
Route (app)
┌ ○ /            ├ ○ /about      ├ ○ /privacy    ├ ○ /robots.txt
├ ○ /_not-found  ├ ○ /notify     ├ ○ /terms      └ ○ /sitemap.xml
```

All 8 routes `○ Static`. Total output: **2.1 MB** of plain HTML/CSS/JS in `out/`.
Every page was served and checked: hero, headline, waitlist CTA, notify form,
honeypot field and the Terms/Privacy consent line all present in the static HTML.

| | Docker/Node on 1 GB | Static export on cPanel |
|---|---|---|
| Node processes | 1 + Caddy + dockerd | **0** |
| Runtime RAM | 131–304 MB, plus a leak to 2.5 GB | **0** (Apache serves files) |
| Build on the host | 789 MB peak × 11 workers → OOM | **none** — build on your Mac |
| Supabase leak | fatal | **not in the runtime path** |
| `sharp` 135 MB arena | present | gone (`images.unoptimized`) |

Docker, Compose and Caddy were built for the EC2 attempt. On cPanel they cannot run
— no root, no daemon. They should stop being the deployment path.

## Why not "Setup Node.js App" in cPanel?

Namecheap's cPanel Node option runs under Passenger with an LVE memory cap — that
1 GB ceiling is exactly what you hit. It would run the leaking server, need the
build done elsewhere anyway, and give you a worse result than static files for a
page that has no dynamic content. Not recommended.

---

## What changed from the 6 approved fixes

You approved all 6. Three of them target infrastructure that does not exist on
cPanel. **I have not applied any of them** — flagging rather than silently dropping:

| # | Original fix | Status on cPanel |
|---|---|---|
| F1 | Supabase singleton | **Still do it** — correctness; protects if a server ever returns |
| F2 | Swap for the 789 MB build | **Moot** — build moves to your Mac |
| F3 | Caddy `trusted_proxies` | **Moot** — no Caddy. Replaced by R3 below |
| F4 | Delete unused 2.3 MB `product-hero.png` | **Still do it** — bigger win now (no optimizer) |
| F5 | DEPLOY.md swap section | **Replaced** by a cPanel upload guide |
| F6 | `mem_limit` on the web container | **Moot** — no containers |

---

## Revised plan

### R1 — Switch to static export
`next.config.ts`: `output: "export"`, `images: { unoptimized: true }`.
Add `export const dynamic = "force-static"` to `app/robots.ts` and `app/sitemap.ts`
— **verified required**; without it the build fails with
`Failed to collect page data for /robots.txt`.

### R2 — Keep `/notify` fully static
**Verified pitfall.** My first attempt read `?product=` with `useSearchParams` in a
client component wrapped in `Suspense`. It built fine but shipped an **empty page
body** — 18 KB vs 35–43 KB for other pages, headline and form missing from the HTML,
invisible to crawlers and to anyone before hydration.

The working version: keep `page.tsx` a static server component, delete the
`searchParams` prop, and have `NotifyForm` read the param **at submit time**:

```ts
const product = new URLSearchParams(window.location.search).get("product");
```

No `useSearchParams`, no `Suspense`, full HTML prerendered. Re-verified: 21 KB with
`Be first to know`, `notify-email`, the honeypot and the consent line all present.

Cost: the personalised "…the moment **the Passive Panel** is ready" line becomes
generic. Restoring it client-side would re-introduce the blank-shell problem, so it
should stay generic unless you want it back badly.

### R3 — Replace `/api/notify`
`app/api/notify/` cannot exist in a static export. Two options:

**Recommended — Supabase Edge Function.** Move the route body as-is. Keeps the rate
limiter, honeypot, `product` allowlist, email validation, the 23505 branch and the
secret key server-side. Runs on Supabase's infra, not cPanel. Preserves every
hardening layer you deliberately built on 2026-07-29.

**Simpler — direct browser insert.** `supabase/migrations/...sql:15-19` **already has**
an anon insert-only RLS policy, written "in case a client-side path is added later."
That path is now needed. But: the honeypot becomes client-side only (a bot can skip
it) and there is **no rate limit** on a public insert. If you choose this, add DB
`CHECK` constraints for email shape and the `product` allowlist. Fine for a waitlist;
weaker than what you have.

Either way the leak (F1) leaves the request path entirely.

### R4 — Move security headers to `.htaccess` (**do not skip**)
`next.config.ts` `headers()` **does nothing** in a static export — confirmed: the
served output carried no CSP and no HSTS. Every header from `next.config.ts:45-63`
must be restated in `public_html/.htaccess` or the site ships with **no CSP, no
HSTS, no clickjacking protection** and nothing in the build says so.

Two required CSP edits:
- `connect-src 'self'` → must include your Supabase origin, or every signup fails.
- `img-src` must keep `https://images.unsplash.com` — the hero loads 20 remote photos.

### R5 — Delete `public/product-hero.png`
2.3 MB, referenced by nothing (`ProductRender.tsx:32` uses `product-render.webp`).

### R6 — New deploy path
Build on your Mac → upload `out/` to `public_html` (cPanel File Manager, or SFTP/rsync).
Retire `deploy.sh`, `Dockerfile`, `docker-compose.yml`, `Caddyfile` — or keep them in
a `deploy/aws/` folder clearly marked as the unused EC2 path, so they stop reading as
the live deployment.

**Local build caveat:** `npm run build` is broken on this machine —
`~/node_modules/.bin/node` is v18.20.8 and shadows nvm's v20.20.2 for every `npm run`
under your home directory. Use the explicit interpreter:

```bash
node ./node_modules/next/dist/bin/next build   # with nvm's node first on PATH
```

---

## Do NOT lose in this migration

- The `.htaccess` headers (R4). Silent, total loss of CSP/HSTS otherwise.
- The honeypot, `product` allowlist, email validation, the 23505 branch, and the
  `email` unique constraint.
- The consent line adjacent to the submit button — verified still prerendered.
  It is what keeps `/terms` from being unenforceable browsewrap.
- `img-src ... images.unsplash.com`.
- No `Offer` / price / availability JSON-LD, and no commerce (patent exposure).
- `SUPABASE_SECRET_KEY` must never reach the browser. If R3 uses direct insert, that
  is the **anon/publishable** key — a different key. Do not swap one for the other.

## Verification

```bash
# 1. Export builds and every route is static
node ./node_modules/next/dist/bin/next build > /tmp/b.log 2>&1; echo "EXIT=$?"
sed -n '/Route (app)/,/^$/p' /tmp/b.log     # expect ○ on all 8, no ƒ

# 2. /notify is NOT a blank shell — this is the regression to watch
grep -c "Be first to know" out/notify.html   # expect 1, not 0
ls -la out/notify.html                       # expect ~21KB, not ~18KB

# 3. Headers actually present once live (the .htaccess check)
curl -sI https://ergoflo.tech | grep -iE "content-security|strict-transport"

# 4. A real signup lands in Supabase
```

## Still outstanding (unchanged, from DEPLOY.md)

- `hello@ergoflo.tech` does not exist. It is published on `/privacy` and `/terms`
  as the route for data deletion and disputes.
- HSTS `preload` is asserted. Do not submit the domain to the preload list until
  every subdomain is permanently HTTPS-only.
