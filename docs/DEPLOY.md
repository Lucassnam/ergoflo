# Deploying ErgoFlo — Cloudflare Pages

**Domain:** `ergoflo.tech` · **Host:** Cloudflare Pages · **TLS:** automatic

The site is a **static export**. `next build` writes plain HTML/CSS/JS to `out/`,
Cloudflare serves it from their CDN, and the one dynamic endpoint runs as a Pages
Function on the Workers runtime.

```
                    ┌─────────────────────────────┐
 visitor ──▶ :443 ──│   Cloudflare Pages (CDN)    │
                    │  out/  static HTML + assets │
                    │  functions/api/notify.ts    │──▶ Supabase (PostgREST)
                    └─────────────────────────────┘
```

**There is no server to run out of memory.** That is the point. The previous
EC2/Docker/Caddy setup is retired in `deploy/aws-ec2-retired/` — see its README and
`docs/plans/2026-07-30-memory-audit-and-production-hardening.md` for why.

---

## Files

| File | Purpose |
|---|---|
| `next.config.ts` | `output: "export"`, `images.unoptimized` |
| `public/_headers` | **the only place security headers exist** |
| `functions/api/notify.ts` | the waitlist endpoint (Workers runtime) |
| `.env.local.example` | local dev template |
| `out/` | build output — this is what gets deployed. Not committed. |

---

## First-time setup

### 1. Connect the repo

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → connect to Git.

| Setting | Value |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npx next build` |
| Build output directory | `out` |
| Production branch | whichever you ship from |

Use `npx next build`, **not** `npm run build` — see the Node caveat at the bottom.

### 2. Environment variables

Pages → Settings → **Environment variables**. Set for **both** Production and Preview,
or previews will 503 on every signup:

| Name | Value |
|---|---|
| `SUPABASE_URL` | from Supabase → Settings → API |
| `SUPABASE_SECRET_KEY` | the **service-role** key |
| `NODE_VERSION` | `22` — belt and braces; `.nvmrc` now pins this too, see below |
| `STRIPE_SECRET_KEY` | **route B only.** Omit entirely if you went live via `STRIPE_LINK` |
| `STRIPE_WEBHOOK_SECRET` | **route B only.** `whsec_...`, from Developers → Webhooks |

The two Stripe rows were missing from this table until 2026-08-05, while
`functions/api/checkout.ts` and `functions/api/stripe-webhook.ts` had already
shipped. Both functions return 5xx without them — `/api/checkout` a 503,
`/api/stripe-webhook` a 500 — and the webhook failure is **silent**: the card is
charged and no order row is ever written. They are genuinely not needed on the
payment-link path (route A); see the two-routes block in `lib/site.ts`.

### The Node version is now pinned in the repo

`.nvmrc` (`22`) and `engines.node` (`>=20.9.0`) in `package.json` were added
2026-08-05. Before that the version lived **only** in the `NODE_VERSION`
dashboard variable, with nothing in the repo — so a Pages project whose build
image defaults to Node 18, or one where `NODE_VERSION` was set for Preview but
not Production, failed the build with:

```
You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.
```

That error names Node, not the thing you changed most recently, which makes it
easy to misattribute to whatever was in the last commit. Keep `.nvmrc` and the
`NODE_VERSION` variable in agreement if you change either.

`SUPABASE_SECRET_KEY` bypasses row-level security. It is read only by the Pages
Function, server-side. **Never** give it a `NEXT_PUBLIC_` prefix — that ships it to
every visitor's browser.

### 3. DNS

Keep the domain registered wherever it is; point it at Cloudflare.

- Pages → Custom domains → add `ergoflo.tech` and `www.ergoflo.tech`.
- If the domain is not already on Cloudflare, move its nameservers there (free).
  Cloudflare then issues and renews TLS automatically.

### 4. Verify the headers — do not skip this

`public/_headers` is the **only** place CSP, HSTS and clickjacking protection are
defined. Next's `headers()` config does nothing in a static export: a build with one
succeeds and silently ships a site with no CSP. The only proof it worked is the
live response:

```bash
curl -sI https://ergoflo.tech | grep -iE 'content-security|strict-transport|x-frame'
```

If those are missing, `_headers` did not get picked up. It must end up at the root
of `out/` — anything in `public/` is copied there by the export.

### 5. Verify a real signup

Submit the form on `/notify` and confirm the row lands in `notify_signups`.
A 503 means the environment variables are missing for that deployment.

---

## Day-to-day

```bash
git push          # Cloudflare builds and deploys automatically
```

Every branch and PR gets a preview URL. Rollback is one click in the Pages
dashboard — **Deployments** → pick a previous build → *Rollback*. No git revert
needed.

To check the build locally before pushing:

```bash
npx next build && ls out
```

---

## Things that must stay in sync

- `lib/site.ts` → `SITE_URL`, and the Pages custom domain. Drift here breaks
  canonical URLs and share cards.
- The `product` allowlist exists in **two** places and both must agree:
  `app/notify/page.tsx` (`PRODUCT_LABELS`) and `functions/api/notify.ts`
  (`ALLOWED_PRODUCTS`). Adding a product to only the first silently stores `null`.
- `components/PricingSection.tsx` `notifySlug` values must be in that allowlist.

## Local build caveat — `npm run build` is broken on this machine

`~/node_modules/.bin/node` is **v18.20.8** and npm prepends every ancestor
`node_modules/.bin` to PATH, so it shadows nvm's v20+ for every `npm run` under your
home directory. `node -v` in the terminal looks fine; the build fails anyway with a
version error.

Use the binary directly:

```bash
npx next build
# or: node ./node_modules/next/dist/bin/next build
```

Cloudflare's build environment is unaffected — this is local only. Fixing it for
good means deleting the stray `~/node_modules`.

## Troubleshooting

| Symptom | Cause | Check |
|---|---|---|
| No CSP/HSTS on the live site | `_headers` not deployed | `curl -sI`; confirm `out/_headers` exists |
| Signup returns 503 | env vars missing for that environment | Pages → Settings → Environment variables |
| Signup returns 429 unexpectedly | rate limit: 5 per IP per 10 min | expected; wait it out |
| `/notify` renders blank before JS | a `useSearchParams` + `Suspense` regression | `grep -c "Be first to know" out/notify.html` must be 1 |
| Build fails on `/robots.txt` | missing `export const dynamic = "force-static"` | `app/robots.ts`, `app/sitemap.ts` |
| Cloudflare build fails, `"You are using Node.js 18…"` | build image on Node 18; `.nvmrc`/`NODE_VERSION` not picked up | Pages → Settings → check `NODE_VERSION` is set on **Production**, not just Preview |
| A deploy fails right after a commerce change | **usually not the commerce change.** Read the build log's first error line before attributing it | the Stripe payment link cannot fail a build — nothing in the repo gates on it |
| Images look soft/large | `images.unoptimized` is on by necessity | keep source images small |

## Still outstanding

- **`hello@ergoflo.tech` does not exist.** It is published on `/privacy` and
  `/terms` as the route for data deletion and disputes, and a legal page naming an
  address that bounces is worse than one naming none. Cloudflare Email Routing
  forwards it to an existing inbox for free; sending *as* that address needs an SMTP
  relay configured in Gmail.
- **HSTS `preload` is asserted** in `public/_headers`. Harmless until you actually
  submit the domain to the browser preload list — but submission is close to
  irreversible. Don't submit until every `ergoflo.tech` subdomain is HTTPS-only,
  forever.
- **`public/demo/` is 3.4 MB and unreferenced** by any mounted page — 60% of the
  deployed payload. See the note in the migration summary.
