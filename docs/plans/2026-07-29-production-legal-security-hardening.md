# ErgoFlow — Production, Legal & Security Hardening Plan

**Date:** 2026-07-29
**Status:** EXECUTED. Build / lint / typecheck / audit all exit 0.

> ## ⚠️ MID-EXECUTION PIVOT — read this before the rest of the document
>
> Partway through, a competitor's virtual patent marking page surfaced and the
> project changed shape. Sections 3.1–3.6 below were written for a **preorder
> site** and are partly superseded. Section 8 records what actually shipped.
>
> **The finding:** Vaucluse Gear sells a **passive retrofit backpack
> ventilation frame** — $33.95, 96 g, fits 15–65L, 100+ brands, shipping today
> — protected by **US 11,779,097 B1**, "Modular spacer device for airflow
> between a user and a wearable bag" (inventor Brice H. Sokolowski, filed
> 2022-02-25, priority 2021-09-27, expires ~2042). The marking page lists one
> patent family three ways (provisional 63/248,879 → application 17/681,448 →
> the granted patent); it is one patent, not three.
>
> **Claim 1 requires all of:** two panels each with a substantially planar web
> body; a plurality of modular supports between them; the gap being
> substantially uniform **and adjustable**; and extension loops sized for a
> strap to pass through.
>
> **The trap to avoid:** adding a fan is NOT a design-around. Under the
> all-elements rule, practising every element of a claim infringes no matter
> what else you add. ErgoFlow's likely non-infringement position rests on the
> **adjustable** limitation — its 5 mm spacer-mesh loft is fixed — not on being
> active. Element 4 is the exposure: ErgoFlow's own copy says "the straps
> become the suspension."
>
> **Why this forced the commerce pivot:** 35 U.S.C. §271(a) makes "offers to
> sell" an infringing act on its own. A definite product at a definite price is
> itself the risky act, before anything ships. The site now takes no money.
>
> **This is not a freedom-to-operate opinion.** Claim 1 was read via Google
> Patents, not the certified USPTO copy. Owner now has **actual notice** of the
> patent, which raises willfulness exposure (§284, up to treble damages; §285
> fees). A written FTO opinion from a patent attorney is now the highest-value
> action on this project and the standard defence against willfulness.
**Repo:** `/Users/coolio_999/Desktop/ergoflowlanding`
**Branch:** `main` @ `bc96253` (22 uncommitted files, incl. the entire `/api/notify` backend)

---

## 0. Decisions locked in this session

| # | Question | Decision |
|---|---|---|
| 1 | Markets | **US shipping only**, plus UCSD campus (California) |
| 2 | Legal entity | **Sole proprietor — Lucas Nam.** No LLC. Reduce risk through documents. |
| 3 | Ship window | **Q4 2026** (keep as published) |
| 4 | Deposit refunds | **Refundable until production starts** |
| 5 | Claims | **All estimates. IPX4 is NOT tested.** Nothing is bench-measured. |
| 6 | Certifications | **None. No battery selected yet.** |
| 7 | `/investors` | Public, thesis only, `SHOW_ASK` stays `false` permanently |
| 8 | Email list | Supabase, **one launch notification only** |
| 9 | `/specs` | **Delete the route**, nav item, and all inbound links |
| 10 | `/api/notify` | Honeypot + IP rate limit + DB unique constraint |
| 11 | Hosting | **Vercel** |

**Round 2 decisions (2026-07-29, same session):**

| # | Question | Decision |
|---|---|---|
| 12 | Team | **Lucas Nam, Edison Hsu, Jonathan Tsai, Nikoloz Surmava.** Names + roles + explicit **no-partnership disclaimer**. |
| 13 | Competitors | Keep names; soften to **sourced** statements; add trademark + no-affiliation notice |

**Why the no-partnership disclaimer matters (Cal. Corp. Code §16202):** a general
partnership forms by conduct, with no filing. Publicly presenting four people as a team
on a deposit-taking site is evidence of one — and partners are **jointly and severally
liable personally** for the whole business. Today the exposure is Lucas's alone. The
disclaimer, plus non-owner role framing, is what keeps it there and off Edison, Jonathan,
and Nikoloz.

**Competitor exposure (Lanham Act §43(a)):** `/investors` asserts *"Not one of them moves
air"* about four named, real products. An absolute comparative claim needs one
counterexample to become false advertising, and a named competitor has standing to sue.
Rephrased as attributed, checkable statements + a trademark/no-endorsement notice. Naming
competitors is nominative fair use; the risk is the absolutes, not the names.

**Round 3 decisions (2026-07-29, after the patent finding):**

| # | Question | Decision |
|---|---|---|
| 14 | Commerce | **Full pivot to a waitlist.** No prices, no deposit, no checkout, no ship date. |
| 15 | `/investors` | **Taken down** until a freedom-to-operate opinion exists |

> **Blockers list superseded — see §9.** Decisions 3, 4, 7 and 8 above were
> overtaken by the pivot: there is no ship window, no deposit, no `/investors`
> page, and `STRIPE_LINK` no longer exists in the codebase.

**Still outstanding:** confirmation that Edison, Jonathan, and Nikoloz each consent to
being named publicly on the site.

---

## 1. Current state

Next 16.2.11 (App Router, Turbopack) + React 19.2.4 + Tailwind v4 + Motion.
5 routes: `/`, `/specs`, `/about`, `/investors`, `/notify`.
One live API route: `POST /api/notify` → Supabase `notify_signups`, authenticated
with `SUPABASE_SECRET_KEY` (bypasses RLS).

`.env.local` is correctly gitignored and untracked — verified with `git ls-files`.

---

## 2. Findings

### 2.1 CRITICAL — `components/PricingSection.tsx` sells a product that does not exist

This is the single largest liability on the site and was not in the earlier notes.

| Line | Claim | Problem |
|---|---|---|
| `status: "Available Now"` on the Active Fan tier | Says the product is purchasable today | No battery is selected and no unit exists. Presenting an unbuilt product as "Available Now" is a straightforward FTC deception claim, not puffery. |
| `"Lifetime warranty"` on the Complete Backpack tier | Federal warranty commitment | Magnuson-Moss Warranty Act. A lifetime warranty from a sole proprietor, on an unbuilt product, is an unbounded personal liability with federal disclosure duties attached. |
| `price: 39.99 / 20 / 120` hardcoded | Second source of truth | Contradicts `PRICING.total = 40` in `lib/site.ts`, which the rest of the site uses. Two prices for one product. |
| `"IPX4 water resistant"` | Untested IEC 60529 rating | See 2.2. |
| `"9–12 hours runtime"`, `"26 dB"` | Presented as specs | Estimates. |

### 2.2 CRITICAL — IPX4 is published in 6 places and is not tested

`lib/site.ts:96`, `lib/site.ts:123` (whole FAQ answer), `app/investors/page.tsx:90`,
`components/ExplodedDiagram.tsx:344`, `components/PricingSection.tsx:37`, `app/about/page.tsx:59`.

IPX4 is a formal IEC 60529 rating. Untested, it is a specific, falsifiable claim — the
easiest kind for a regulator or a competitor to disprove.

### 2.3 CRITICAL — `/investors` asserts substantiation that does not exist

The most dangerous page to carry a false claim, because it is aimed at investors.

- Header comment, line ~30: *"Every number below is either a bench-measured spec or a published price."* — false.
- Section heading **"What we measured"**, subhead *"Off a bench, on the current prototype… Instrument list, test conditions, and raw logs go out with the deck."* — there is no bench data, no instrument list, no logs.
- `MEASURED` table constant, incl. an `IPX4` row.
- Hero copy: *"the honest version: what we have measured"*.
- Risk block: *"That work is being specified into cell selection… It is a known cost and a known calendar"* — implies cert work underway on a cell that hasn't been chosen.
- Moat claim: *"what is not trivially copyable is 26 dB at 168 g"* — moat rests on two estimates.

### 2.4 HIGH — `/api/notify` is unprotected

No rate limit, no honeypot, no bot check, no `product` allowlist, no request-size cap.
Anyone can loop-POST unlimited rows using your secret-key-authenticated route.
The DB `unique` constraint on `email` already exists (migration line 5) and dedupes,
but does not stop volume.

### 2.5 HIGH — No legal pages at all

No Privacy Policy, Terms of Sale, or Refund Policy — while collecting email addresses
*and* taking deposits. Stripe's own rules require refund terms and a business identity
be reachable from the checkout page. California residency (UCSD) puts CCPA/CPRA in scope.

### 2.6 HIGH — Consumer-facing copy contradicts the chosen refund policy

`components/Footer.tsx` legal line: *"Preorder figures are targets from bench testing"*
(no bench testing) and *"Deposits are refunded only if production does not move forward"*
— which is **narrower** than the policy you chose. The FAQ in `lib/site.ts` and the
`ECONOMICS` block in `/investors` state a third variation. Three different refund
promises across one site is exactly what a chargeback dispute turns on.

### 2.7 MEDIUM — Dependency vulnerabilities

`npm audit --omit=dev` → **3 high**, all transitive under `next@16.2.11`:

- `postcss <=8.5.17` (3 advisories) — **build-time only**; the project's own top-level
  postcss is already 8.5.23. Reachable only by processing untrusted CSS, which this
  project never does. Real-world risk here: negligible.
- `sharp 0.34.5 < 0.35.0` — libvips CVEs, used by `next/image` at runtime. No
  `images.remotePatterns` is configured, so only bundled local images are optimized;
  an attacker cannot supply an image. Real-world risk here: low.

**`npm audit fix --force` would install `next@9.3.3`** — a seven-major-version
downgrade that would destroy the site. It will not be run. Fix is `overrides` +
a patch bump; see 3.6.

### 2.8 MEDIUM — Dead code and dead dependencies

- `three`, `gsap`, `@tsparticles/react`, `@tsparticles/slim`, `@types/three` — imported
  by nothing that ships. `three` is imported only by `Fan3D.tsx` and `HorizonHero.tsx`,
  which nothing renders.
- Orphan components: `Fan3D.tsx`, `HorizonHero.tsx`, `AirflowCanvas.tsx`.
- Both `framer-motion` **and** `motion` are installed. `motion/react` is used in 6 files,
  `framer-motion` in 2 (`PricingSection.tsx`, `ui/scroll-morph-hero.tsx`). Same library,
  two copies, doubled bundle and CVE surface.
- `bloom` class used 6× across `/about`, `/specs`, `/investors` but **deleted from
  `globals.css`** during the light-theme pivot — renders nothing, silently.

### 2.9 MEDIUM — Missing production baseline

No security headers, no `robots.txt`, no `sitemap.xml`, no `metadataBase` (so OG/Twitter
URLs resolve relative and break when shared), no OG image, no `not-found.tsx`, no
`error.tsx`, no `loading` states. `package.json` name is still `ergoflow_scaffold`.

---

## 3. Proposed changes

### 3.1 Legal pages (new)

| Route | Contents |
|---|---|
| `/terms` | Terms of Sale + site terms. Seller of record: **Lucas Nam, sole proprietor**, mailing address. Pre-production disclosure. All specs are design targets. **Limitation of liability capped at amount paid.** Disclaimer of implied warranties to the maximum extent California law permits. No lifetime warranty anywhere. Governing law: California. FTC Mail Order Rule delay-notice commitment tied to the Q4 2026 window. |
| `/privacy` | What's collected (email + optional product interest + timestamp), why, Supabase named as processor, retention, no sale/sharing of personal information, CCPA/CPRA rights (know / delete / opt-out / non-discrimination), how to exercise them, contact. |
| `/refunds` | Deposit is **refundable until production starts**, where "production starts" is defined as **the date of an email notice sent to every depositor** — a fixed, provable trigger rather than a judgment call. Balance of $25 charged at fulfilment with advance notice. How to request a refund and the turnaround. Shipping & delivery section (US only, Q4 2026, what happens if it slips). |

All three linked from the footer and reachable from checkout.

**Risk-reduction rationale for sole proprietorship:** with no LLC, your personal assets
sit behind every claim. The liability cap, warranty disclaimer, explicit battery-safety
warnings, absence of any health/medical claim, and the refundable-deposit structure are
what stand in for the corporate veil. They reduce exposure; they do not eliminate it.
Separately flagged, not part of this code change: product liability insurance before any
unit ships, and revisiting the LLC decision once revenue exists (California's $800/yr
minimum franchise tax is why it isn't automatic today).

### 3.2 Claim correction (site-wide)

- **Delete IPX4 everywhere** (6 sites). Replace with "splash-resistant design goal — not yet IP-rated".
- Every number becomes a **design target**, labelled at the point of display, not in a
  footnote: `HERO_STATS`, `SPECS`, `PRICING` copy, `ProductRender` spec list, `ExplodedDiagram` labels.
- **`components/PricingSection.tsx`:** `"Available Now"` → `"Reserve now — ships Q4 2026"`;
  **delete `"Lifetime warranty"`**; delete IPX4; prices read from `lib/site.ts` instead of
  hardcoded literals; add a pre-production note to the tier block.
- **`app/about/page.tsx`:** rewrite timeline entry 5 (battery certs — currently implies
  UN38.3/IEC 62133 work is done) and entry 6 (*"The engineering questions are answered"*
  — they are not). Rewrite principle 03, *"Numbers with their conditions attached"*, which
  currently presents estimates as measurements. Remove dead `bloom` class.
- **`app/investors/page.tsx`:** header comment corrected; `MEASURED` → `TARGETS`; heading
  "What we measured" → "Design targets"; delete the instrument-list/raw-logs sentence;
  delete the IPX4 row; correct the cell-certification risk entry to say no cell is selected;
  soften the 26 dB moat claim to a target; keep all four thesis claims (they cite real,
  checkable third-party products and remain accurate); **add a securities disclaimer** —
  informational only, not an offer to sell securities; `SHOW_ASK` stays `false`;
  `SHOW_TEAM` → `true` once the 4 real bios land.
- **`components/Footer.tsx`:** replace both false legal sentences with copy that matches
  `/refunds` exactly.
- **`lib/site.ts`:** FAQ deposit answer rewritten to the defined trigger; IPX4 FAQ deleted;
  `SPECS` retargeted or removed with `/specs`.

### 3.3 Delete `/specs`

Remove `app/specs/`, the `NAV` entry in `lib/site.ts:130`, and the three prose references
(`app/about/page.tsx:15`, `app/investors/page.tsx:83`, `components/ProductRender.tsx:5`).
Verify no route 404s afterwards.

### 3.4 Harden `POST /api/notify`

- **Honeypot** — hidden field in `NotifyForm`; a filled value returns `200 {ok:true}` and
  writes nothing, so bots can't distinguish success from rejection.
- **IP rate limit** — fixed window per IP off `x-forwarded-for` (Vercel-populated).
  Documented caveat: in-memory state is per-instance and resets on cold start, so this is
  best-effort. The store is isolated behind one module so it can be swapped for Vercel KV
  or Upstash later without touching the route.
- **`product` allowlist** — only `passive-panel` / `complete-backpack` accepted; anything
  else stored as `null`. Currently any 64-char attacker string is persisted.
- **Request size cap** + reject non-JSON content types.
- **Generic error responses**; no Supabase internals returned to the client.
- Consent line at the form: what you'll receive (one launch email), and how to be removed.

### 3.5 Security headers + production baseline

In `next.config.ts` (Vercel applies these at the edge):
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
`X-Frame-Options: DENY`, `Permissions-Policy` (camera/mic/geo off), and a
`Content-Security-Policy`.

CSP note: `img-src` must include `images.unsplash.com` — the scroll-morph hero loads 20
remote photos via raw `<img>`. `script-src` will need `'unsafe-inline'` unless a
nonce-issuing middleware is added; a nonce middleware is a meaningfully riskier change to
a working hero, so the plan ships the header set with inline allowed and notes it. Say the
word and I'll do the nonce version instead.

Also add: `metadataBase`, `robots.ts`, `sitemap.ts`, `not-found.tsx`, `error.tsx`,
`opengraph-image`, and rename `ergoflow_scaffold` → `ergoflow-landing`.

### 3.6 Dependencies

- Remove `three`, `gsap`, `@tsparticles/react`, `@tsparticles/slim`, `@types/three`.
- Delete `Fan3D.tsx`, `HorizonHero.tsx`, `AirflowCanvas.tsx`.
- Migrate 2 files off `framer-motion` onto `motion/react`; drop `framer-motion`.
- Bump `next` 16.2.11 → 16.2.12 (patch).
- Add `overrides: { sharp: "^0.35.0" }` to clear the runtime advisory.
- Re-run `npm audit --omit=dev`. **`--force` will not be run** (see 2.7).

---

## 4. Do-not-touch list

1. **`.env.local` and the `.env*` gitignore rule** — never read, print, commit, or alter.
2. **`SUPABASE_SECRET_KEY` stays server-only.** Never `NEXT_PUBLIC_`, never in a client component.
3. **`lib/supabase.ts` `server-only` import** — that import is the guard that makes a client leak a build error.
4. **`notify_signups` unique constraint on `email`** and the `23505` success-path in the route.
5. **The RLS policy in the migration** — defence-in-depth; don't drop it while adding the rate limiter.
6. **`turbopack.root` pin in `next.config.ts`** — the stray `~/package-lock.json` breaks workspace inference without it.
7. **The bounds-release in `ui/scroll-morph-hero.tsx`** — without it the hero traps the reader's scroll forever.
8. **`brightness-[1.02]` on the product render** and its **rendering disclaimer** — pre-production imagery must keep the disclaimer.
9. **`suppressHydrationWarning` on `<body>`** — guards against extension-injected attributes.
10. **The four `/investors` thesis claims** — they name real, checkable competitor products and remain accurate; they are not part of the claim correction.

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| CSP breaks the hero or Motion animations | Ship headers, then verify the hero, pricing, and comparison slider render and animate before calling it done |
| In-memory rate limiting is per-instance on Vercel | Documented as best-effort; store isolated for a KV swap |
| Removing `framer-motion` changes animation behaviour in 2 components | Same library, but verify both visually |
| Legal pages are drafted by me, not a lawyer | Stated explicitly at the top of the plan and in my handoff: these are solid, conventional documents for a $15 pre-order, **not** legal advice. For a battery product a one-off attorney review before shipping units is genuinely worth the money |
| Deleting `/specs` orphans an inbound link | Grep after deleting; build fails on a broken `Link` |

---

## 6. Verification

Node 20 required — `npm run <script>` resolves Node 18 on this machine.

```bash
cd /Users/coolio_999/Desktop/ergoflowlanding
node node_modules/next/dist/bin/next build          # echo $? must be 0
node node_modules/eslint/bin/eslint.js .            # echo $? must be 0
npx tsc --noEmit                                    # echo $? must be 0
npm audit --omit=dev                                # expect 0 high after overrides
grep -rn "IPX4\|Available Now\|Lifetime warranty\|What we measured" app components lib   # must return nothing
grep -rn "bloom\|/specs" app components lib         # must return nothing
grep -rn "NEXT_PUBLIC_SUPABASE" app components lib  # must return nothing
```

Plus a runtime pass: rate limiter returns 429 on the 6th rapid POST, honeypot submission
writes no row, and `/`, `/about`, `/investors`, `/notify`, `/terms`, `/privacy`, `/refunds`
all render at 1440×900 and 390×844.

Exit codes will be reported from real output. Anything not run is reported as
`UNVERIFIED — to confirm, run: <command>`.

---

## 7. Execution order

1. Dependency cleanup + orphan deletion (smallest blast radius, unblocks a clean build)
2. Delete `/specs` + fix inbound links
3. Claim correction across `lib/site.ts`, PricingSection, About, Investors, Footer, ExplodedDiagram, ProductRender
4. Legal pages + footer links
5. `/api/notify` hardening + NotifyForm consent/honeypot
6. Security headers + robots/sitemap/metadataBase/error pages
7. Full verification sweep
8. Report, with the owner-blocked items listed as blockers

---

## 8. What actually shipped (2026-07-29)

Verified: `next build` exit 0 · `eslint` exit 0 · `tsc --noEmit` exit 0 ·
`npm audit --omit=dev` → **0 vulnerabilities** (was 3 high).

### Commerce removed entirely
- Deleted `STRIPE_LINK`, `isStripeLive`, `PRICING`, `TIER_PRICING`,
  `PREORDER_LIMIT`, `SHIP_WINDOW`, `PRODUCTION_START_TRIGGER`.
- `ReserveButton` → `WaitlistButton` (links to `/notify`, no checkout).
- **Deleted the JSON-LD `schema.org/Offer`** node on `/` — it published
  `price: 40` + `availability: PreOrder` as machine-readable, search-indexed
  offer-to-sell data.
- Pricing table → "What we're building": three concepts, no prices, no
  availability, no warranty term.
- Deleted routes: `/specs`, `/investors`, `/refunds`.

### Claims corrected
- **IPX4 removed from all 6 locations.** Never IP-tested.
- Every figure relabelled a target, at the point of display.
- `/about`: rewrote the battery-certification timeline entry (implied
  UN38.3/IEC 62133 work was underway — no cell is even selected), the
  "engineering questions are answered" close, and the principle that presented
  estimates as measurements.
- `PricingSection`: removed `"Available Now"`, the `"Shipping now"` badge,
  `"Lifetime warranty"` (Magnuson-Moss), and a dead `href="#"` link promising
  "View warranty details".
- Footer: replaced two false sentences ("targets from bench testing"; a refund
  rule contradicting two other pages).
- Competitor claims attributed to their own published materials; Vaucluse named
  in the FAQ and `/about`; `TRADEMARK_NOTICE` added.

### Legal
- New `/terms` (site + waitlist): no-offer/no-reliance §2, warranty disclaimer,
  liability cap ($100 floor), arbitration + class waiver, battery safety, no
  medical claims, **no-partnership clause** (Cal. Corp. Code §16202) protecting
  the three non-owner contributors, California governing law.
- New `/privacy`: accurate to a site with no payments — one email address, no
  analytics, no cookies, no trackers; Supabase and Vercel named as processors;
  CCPA/CPRA rights.
- Team block on `/about`, gated on `hasTeamRoles` so it cannot ship a
  placeholder role, rendered with the no-partnership notice.

### Security — runtime-verified against a production server
| Check | Result |
|---|---|
| Rate limit (5 / IP / 10 min) | reqs 1–5 pass, 6–7 → **429** ✓ |
| Honeypot filled | **200 `{ok:true}`**, no DB write ✓ |
| Invalid email | 400 ✓ |
| Wrong content-type | 415 ✓ |
| Oversized body | 413 ✓ |
| Malformed JSON | 400 ✓ |
| `product` allowlist | attacker string nulled ✓ |
| CSP / HSTS / nosniff / DENY / Referrer / Permissions | all present ✓ |
| `X-Powered-By` | absent ✓ |
| `/api/*` cache | `no-store` + `noindex` ✓ |
| `/specs`, `/investors`, `/refunds` | 404 ✓ |
| `/`, `/about`, `/notify`, `/terms`, `/privacy`, `/robots.txt`, `/sitemap.xml` | 200 ✓ |

Also added: `metadataBase`, `robots.ts`, `sitemap.ts`, `not-found.tsx`,
`error.tsx`. Removed `three`, `gsap`, `@tsparticles/*`, `@types/three`,
`framer-motion`; deleted `Fan3D`/`HorizonHero`/`AirflowCanvas`; stripped the
dead `bloom` class; `next` → 16.2.12; `sharp`/`postcss` pinned via `overrides`
(**never** `npm audit fix --force`, which installs `next@9.3.3`).

## 9. BLOCKERS — the site cannot launch until these are done

1. **`notify_signups` table does not exist in Supabase.** Live test returned
   `PGRST205` five times. The migration in `supabase/migrations/` was never
   applied. **The waitlist — the only function of the site — silently fails
   today.** Apply the migration before anything else.
2. `CONTACT_EMAIL` is still `hello@ergoflow.com`; `SITE_URL` still
   `https://ergoflow.com`. Both must be real.
3. `LEGAL_ADDRESS` is a placeholder. `/terms` and `/privacy` render a visible
   red warning until it is set.
4. Four `TEAM` roles are `REPLACE_WITH_ROLE`. The `/about` team block is hidden
   until all four are filled.
5. No OG share image.

## 10. Off-site actions, ranked by value (not code)

1. **Freedom-to-operate opinion on US 11,779,097** from a patent attorney.
   Highest value item on the project; also the defence against willfulness now
   that actual notice exists.
2. **Product liability insurance** before any unit ships. An LLC protects
   assets; insurance pays for the defence. For a lithium cell worn against a
   person's back this is not optional.
3. **Manufacturer indemnity + additional-insured status + a cell whose supplier
   already holds UN38.3 / IEC 62133 reports.** Moves certification burden onto
   the vendor.
4. **Entity timing.** If an LLC is ever formed, form it *before* taking money —
   it does not retroactively cover obligations incurred personally. California
   ~$70 filing + ~$800/yr minimum franchise tax.
5. **Trademark clearance on "ErgoFlow"** — never searched.
