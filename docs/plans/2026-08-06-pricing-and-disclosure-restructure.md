# Pricing change + disclosure restructure — plan

**Date:** 2026-08-06
**Author:** audit-first workflow, three parallel read-only audits (pricing surfaces, legal disclaimers, UI/architecture)
**Status:** APPROVED 2026-08-06. Decisions recorded in §0.3.

Requested: (1) price becomes **$70 regular** with a **$50 early-bird** that **ends in 4 days**;
(2) the legal disclaimers are "a lot, and loud" — restructure so they are not in the way of the
experience.

---

## 0. Two findings that change the job before anything else

### 0.1 Changing the price in this repo does not change what a customer is charged

`PRICE_CENTS` in `lib/site.ts:293` is a genuinely well-kept single source of truth — every
rendered price on the site comes from `formatPrice()`, and the audit found **zero** hand-written
`$49.99` strings in any rendered JSX. That discipline holds.

It does not reach the money. The live checkout path is **Route A**: `STRIPE_LINK`
(`lib/site.ts:279`) is a live Stripe Payment Link, and `components/PreorderCheckout.tsx:102-114`
renders it as a plain `<a href>`. The browser leaves this origin and pays on Stripe's page. **The
amount charged is configured in the Stripe dashboard, which this repo cannot read, verify, or
change.** `lib/site.ts:239-241` already says so: *"the code cannot check any of this… A link
priced differently silently contradicts every page on this site."*

Consequence: if only the code changes, the site advertises $50/$70 and Stripe charges $49.99.
Nothing in the build, lint, or typecheck can catch it — there is no test suite and no CI.

**This requires out-of-band work in the Stripe dashboard that only the account holder can do.**
It is step 1 of execution, not a footnote. See §4.

### 0.2 "$70 regular, $50 early bird" is a deceptive framing as stated; "price goes up" is not

The product has only ever sold at $49.99. A "$70 regular / $50 early bird" presentation is a
former-price claim, and under the FTC's pricing guides (16 CFR 233.1) a reference price must be
a price the item was **actually and openly offered at for a reasonable period** — not a number
introduced to make the current price look like a discount. $70 has never been charged, so
advertising $50 as a saving against it is the one genuinely new legal exposure this change
would add — on a site that has otherwise been careful.

The same commercial outcome is available and fully honest: **$50 now, going up to $70 on
<DATE>.** A stated future price increase is a promise about your own future conduct, not a claim
about the past. It creates the same urgency and is true.

**Recommendation:** ship the price-increase framing. Never render "was $70" or a struck-through
$70 next to $50. This plan is written that way throughout; say the word if you want it changed.

Related, and cheap to get right: the deadline must be **real and fixed**. A countdown that
resets on reload, or an "ends in 4 days" that still says 4 days next week, is a textbook FTC
dark pattern. The plan uses one hardcoded instant and lets it genuinely expire.

### 0.3 Decisions taken by the owner, 2026-08-06

1. **Framing: price-increase, not discount.** "$50, goes up to $70 on Aug 10." No struck-through
   $70, no "save $20", anywhere on the site or in metadata.
2. **Stripe: ONE Payment Link, repriced by hand.** No second link. `STRIPE_LINK` stays a single
   URL; the owner sets it to $50.00 now and changes it to $70.00 in the dashboard on Aug 10.
   This is simpler than two links and its failure mode is the benign one — see below.
3. **Disclosures: de-duplicate only.** Nothing with a cited statute moves, changes prominence,
   or goes behind an accordion.

**What decision 2 means for correctness.** Because one link serves both tiers, the site's
displayed price and Stripe's charged price can disagree in exactly two ways:

| When | Site shows | Stripe charges (if not repriced) | Harm |
|---|---|---|---|
| Now, before owner sets $50 | $50 | $49.99 | 1¢ in the customer's favour. Negligible. |
| After Aug 10, if the owner forgets | $70 | $50 | Customer pays **less** than advertised. Lost margin, no deception. |

Both drift directions undercharge rather than overcharge, which is the safe way round and is why
this option is acceptable without a second link. The unacceptable direction — advertising $50 and
charging $70 — cannot occur under this design, because the price only ever rises on the site
*after* the link would have been repriced upward. This is worth stating plainly in `lib/site.ts`
so nobody "fixes" it later by inverting the defaults.

---

## 1. Current state (audited, not assumed)

### Pricing
| Fact | Evidence |
|---|---|
| Canonical constant | `lib/site.ts:293` — `PRICE_CENTS = 4999` |
| Mirrored duplicate | `functions/api/checkout.ts:44` — hand-synced, per its own comment at `:36-42` |
| Every display surface uses `formatPrice()` | 15 surfaces confirmed; zero hand-written literals in rendered JSX |
| Actual charge amount | Stripe dashboard, external to repo |
| Route B (`/api/checkout`) | Unreachable — `checkout.ts:43` hardcodes `PREORDERS_ENABLED = false`, and no `STRIPE_SECRET_KEY` is set |
| Deadline/countdown infrastructure | **None exists anywhere in the repo** |
| JSON-LD | `FAQPage` only. An `Offer` node with a price was deliberately removed (`app/page.tsx:21-29`) over 35 U.S.C. §271(a) patent exposure — **do not re-add one, including `priceValidUntil`** |
| Tests / CI | None. No test script, no `.github/` workflows. `next build` typechecks, but `4999` vs `7000` is not a type error |
| `out/` on disk | Stale build with `$49.99` baked into HTML, RSC payloads and a JS chunk. A deploy that ships this instead of a fresh build serves the old price |

### Static export constraints (`next.config.ts:33`, `output: "export"`)
- No Node server in production. No per-request render, no ISR, no revalidation.
- `Footer.tsx:75`'s `new Date().getFullYear()` evaluates **at build time** and freezes.
- Therefore: **a countdown must be client-side.** The only alternative — a Cloudflare Pages
  Function serving the time — is real but is not worth a network round-trip for a price badge.

### Disclaimers
The audit classified every disclosure string into three buckets. Summary:

**Load-bearing at point of sale — not touched by this plan.** Each has a statute or rule cited
in an existing code comment: the final-sale term (Cal. Civ. Code §1723 conspicuousness,
`lib/site.ts:339-345`), the 120-day ship window (16 CFR 435.2, `lib/site.ts:301-306`),
"batteries not included" (FTC deception, `lib/site.ts:507-510`), "no unit exists"
(`app/preorder/page.tsx:30-35`), and the Terms-assent links adjacent to the button (clickwrap vs
browsewrap, `components/PreorderCheckout.tsx:181-186`).

**The actual problem is duplication, not the required disclosures.** Counted on a single page view:
- "No unit exists / not built" — **6 times** on the home page, plus 2 more inside the footer
  paragraph. 3 times on `/preorder`.
- "Figures are targets, not measurements" — **9+ locations**, on top of the `(target)` tag
  already attached to every individual number.
- "Preorders are final" — 3 times on the home page, 3 on `/preorder`.
- "Batteries not included" — 7 locations, 5 of them before checkout completes.
- `NOT_A_COMPANY_NOTICE` renders **twice on `/terms` itself** — once in its own §1
  (`app/terms/page.tsx:89`) and again via the shared `LegalPage` footer
  (`components/LegalPage.tsx:75`). No comment anywhere argues for this; it is a component
  artifact.

**Visual weight is bimodal.** There is exactly one loud block — the `/preorder` disclosure box,
`border-neutral-900 bg-neutral-50`, deliberately above the price — and about a dozen quiet
restatements at `text-[11.5px] text-neutral-400`. The "loud everywhere" feeling comes from the
*repetition*, not from the one block that is legally required to be prominent.

There is also no shared notice component: three different hand-rolled treatments are copy-pasted
across the site (`LegalPage.tsx:45-49`, `app/preorder/page.tsx:57`, `PreorderCheckout.tsx:79`).

---

## 2. Proposed changes

### 2.1 Pricing model (`lib/site.ts`)

Replace the single `PRICE_CENTS` with an explicit two-tier model plus a hard deadline:

```ts
export const PRICE_CENTS = 7000;              // regular, $70
export const EARLY_BIRD_PRICE_CENTS = 5000;   // $50
export const EARLY_BIRD_ENDS = "2026-08-11T06:59:59Z"; // 2026-08-10, 23:59:59 PT
```

Per decision §0.3.2 there is **no second Stripe link** — `STRIPE_LINK` remains one URL used by
both tiers, repriced by hand in the dashboard.

`formatPrice()` keeps its current signature and behaviour so nothing that calls it breaks.
Two new helpers:
- `isEarlyBird(now = new Date())` — pure, testable, no side effects.
- `currentPriceCents(now)` / `currentStripeLink(now)` — the single place tier selection happens.

**Fail-safe direction.** The static HTML is built with the early-bird tier as the default and
the client corrects after the deadline. This is the correct direction to fail: a stale cached
page shows $50 and links to the $50 Stripe link, so a customer is charged exactly what they were
shown. The opposite default risks advertising $50 and charging $70, which is the outcome that
actually matters. Cost of this choice: lost margin on stale-cache orders after the deadline,
bounded by redeploying once the promo ends.

### 2.2 Countdown UI — new `components/EarlyBirdBadge.tsx`

`"use client"`, following the existing `Header.tsx` idiom (`useEffect` + `useState`), since no
countdown pattern exists to copy. Behaviour:
- Renders "Early-bird price. Goes up to $70 on Monday, Aug 10." plus days/hours remaining.
- Recomputes on mount and on an interval; when the deadline passes it swaps itself to the
  regular-price state without a reload.
- Respects `useReducedMotion` — no ticking animation, just a number.
- **No struck-through $70 anywhere.** Increase framing only (§0.2).

Placed at exactly two surfaces, both already price-adjacent: the `/preorder` price card
(`app/preorder/page.tsx:144-166`) and the home `#waitlist` CTA card (`app/page.tsx:113-173`).
Not in the header, not as a site-wide bar — that is the change that would make the site feel
louder, which is the opposite of request (2).

### 2.3 Disclosure restructure

Guiding rule: **remove repetition, keep every required disclosure, change placement of nothing
that has a statute cited next to it.**

1. **New `components/Notice.tsx`** — one component, three variants (`prominent` / `inline` /
   `fine`), replacing the three copy-pasted Tailwind treatments. Consistency alone makes the
   site read as calmer without deleting a word.
2. **Footer** (`Footer.tsx:73-78`) — currently concatenates a bespoke sentence +
   `TARGETS_DISCLAIMER` + the full `PREORDER_NOTICE`, restating "no unit exists" twice inside one
   paragraph. Reduce to one sentence plus links to Terms/Refunds. `PREORDER_NOTICE` stays in
   full at the point of sale, which is where the comment at `Footer.tsx:67-72` says it earns its
   place — it is not required in the footer of `/privacy`.
3. **Home page** — the marketing surface, and where the cost is highest and the legal duty
   lowest. Collapse the 6 restatements of "no unit exists" to 2: the "Not built yet" badge and
   the `PREORDER_NOTICE` under the buy control. Drop the duplicate `TARGETS_DISCLAIMER` from
   `PricingSection.tsx:238` (every figure already carries `(target)` inline).
4. **`/terms`** — delete the duplicated `NOT_A_COMPANY_NOTICE` render. Keep §1's copy, drop the
   shared-footer repeat on this one page. Pure defect fix.
5. **`/preorder` disclosure block** — **stays where it is, above the price, with its current
   prominence.** Tighten the prose only: bullets 1 and 2 currently overlap
   (`TARGETS_DISCLAIMER` restates "nothing has been bench-tested" from bullet 1). Same six
   disclosures, roughly 30% fewer words, easier to actually read. Styling and order untouched.
6. **FAQ** — no change. It is already an accordion, closed by default (`Faq.tsx:8`).

Net effect: the visitor reads each required fact **once, clearly, at the moment it matters**,
instead of six times in shrinking grey text.

---

## 3. Files touched

| File | Change |
|---|---|
| `lib/site.ts` | Two-tier pricing, deadline constant, tier helpers; update the commerce comment blocks in the same edit (required by `lib/site.ts:22-29`) |
| `functions/api/checkout.ts` | Mirror the new constants; keep `PREORDERS_ENABLED = false` kill switch as-is |
| `components/EarlyBirdBadge.tsx` | **New** |
| `components/Notice.tsx` | **New** |
| `components/PreorderCheckout.tsx` | Tier-aware price + link; `Disclosure()` text unchanged in substance |
| `components/PreorderButton.tsx` | Label reads current tier price |
| `app/preorder/page.tsx` | Badge in price card; disclosure prose tightened |
| `app/page.tsx` | Badge in CTA card; de-duplicate disclosures |
| `components/PricingSection.tsx` | Tier price; drop duplicate targets disclaimer |
| `components/Footer.tsx` | Reduce to one sentence + links |
| `app/terms/page.tsx` | Remove duplicate notice render |
| `app/refunds/page.tsx`, `app/preorder/success/page.tsx` | Read via `formatPrice()` — verify only, likely no edit |

---

## 4. Out-of-band steps only the account holder can do

**These are load-bearing. The change is not done without them.**

1. **Now — set the existing Payment Link to $50.00** in the Stripe dashboard. Until this is
   done the site advertises $50 and charges $49.99. (Harmless, but wrong.) While you are in
   there, re-check the rest of the `lib/site.ts:236-247` checklist: US shipping collection on,
   free shipping, redirect to `/preorder/success`, ToS acceptance pointing at `/terms`.
2. **On 2026-08-10 — change the same Payment Link to $70.00.** This is the only step that makes
   the post-deadline price real. If you miss it, customers are charged $50 while the site says
   $70: you lose margin, nobody is overcharged, nothing is deceptive. Fix it whenever you notice.
3. **Redeploy on 2026-08-11** so the static HTML stops defaulting to the early-bird tier. Until
   a redeploy happens, a cached page may still show $50 — which is honoured by the still-$50
   link if step 2 has not run yet, and undercharges if it has.

---

## 5. Do-not-touch list

Carried from the audit; each has a cited reason in an existing comment or plan doc.

- Never move the final-sale term below the fold or below the buy button — Cal. Civ. Code §1723.
- Never move the checkout above the `/preorder` disclosure block — `app/preorder/page.tsx:30-35`.
- Never render a buy control without `Disclosure()` beneath it — `PreorderCheckout.tsx:187`.
- Never point header/hero/final-CTA buttons straight at Stripe — they must pass through
  `/preorder` — `PreorderButton.tsx:51-60`.
- Do not add `amount` to the `/api/checkout` request body — `PreorderCheckout.tsx:26-29`.
- Do not add a card field or Stripe Elements (PCI SAQ-A → SAQ-D) — `PreorderCheckout.tsx:18-24`.
- Do not add a `schema.org/Offer`, `AggregateOffer`, price, availability, **or `priceValidUntil`**
  to the JSON-LD — `app/page.tsx:21-29`, §271(a).
- Do not narrow the three refund exceptions; do not lower `LEAD_TIME_DAYS`.
- Do not fill `SELLER_OF_RECORD` to silence the Terms notice.
- Do not remove "batteries not included" from the point of sale.
- Update the commerce comment blocks in `lib/site.ts` in the same edit as any commerce change.

---

## 6. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Stripe link not repriced → site says $70, charges $49.99 | **High** | §4 steps 1-2; verification below is manual and mandatory |
| Reference-price framing reads as a fake discount | **High** | Increase framing only, no struck-through $70 (§0.2) |
| Stale `out/` deployed → old price served | Medium | Rebuild before deploy; verify with grep below |
| Client clock skew / spoofing on the countdown | Low | Fail-safe defaults to early-bird; Stripe link is the real enforcement |
| Trimming a disclosure that mattered | Medium | Nothing with a cited statute is moved or cut; §5 is the gate |
| Two `PRICE_CENTS` drift | Medium | Same-commit edit; grep check below |

---

## 7. Verification

Run after implementation. Report actual exit codes, not piped tails.

```bash
# 1. Typecheck — baseline is currently clean (exit 0, confirmed 2026-08-06)
npx tsc --noEmit; echo "EXIT=$?"

# 2. Lint
npm run lint; echo "EXIT=$?"

# 3. Full build
npx next build; echo "EXIT=$?"

# 4. No stale price anywhere in the fresh build
grep -rc '49\.99' out/ | grep -v ':0' || echo "OK: no 49.99 in build output"

# 5. Both constants agree
grep -n 'PRICE_CENTS' lib/site.ts functions/api/checkout.ts

# 6. Documented regression check from docs/DEPLOY.md
grep -c "Be first to know" out/notify.html   # must be 1

# 7. Point-of-sale disclosures survived the restructure
grep -o 'Batteries are not included' out/preorder.html | wc -l   # must be >= 1
grep -o 'Preorders are final'        out/preorder.html | wc -l   # must be >= 1

# 8. Visual check — no automated visual tooling exists in this repo
npx next build && npx serve out    # then read / and /preorder by eye
```

**Cannot be verified from this repo, must be checked by hand in the Stripe dashboard:** that the
link charges the tier the site is showing, and that it collects a US shipping address with free
shipping. Anything not confirmed is reported as `UNVERIFIED — to confirm, run: …`.

---

## 8. Execution log — 2026-08-06

### Build/verify results (actual exit codes)

| Check | Result |
|---|---|
| `npx tsc --noEmit` (baseline, before changes) | **exit 0** |
| `npx tsc --noEmit` (after changes) | **exit 0** |
| `npm run lint` | **exit 0** — 4 warnings, all pre-existing (same count before and after) |
| `next build` | **exit 0**, 15 static routes generated |
| `49.99` anywhere in fresh `out/` | **none** |
| `out/notify.html` "Be first to know" | **1** (DEPLOY.md regression check passes) |
| All 6 routes served from `out/` over HTTP | **200** |
| Struck-through / "was $" / "% off" language in build | **none found** |

### Build gotcha worth recording

`npx next build` fails on this machine with *"You are using Node.js 18.20.8"* even though
`node -v` is v20.20.2. Cause: `npx` prepends `node_modules/.bin` from every **ancestor**
directory, and a stray `~/node_modules/.bin/node` is a Node 18 binary. It wins over nvm's Node
20. `docs/DEPLOY.md:48` currently advises "use `npx next build`, **not** `npm run build`" — that
advice is now inverted; both runners do the same PATH walk.

**Working command:** `node node_modules/next/dist/bin/next build`

This is machine-local only. Cloudflare Pages is unaffected — it has no `~/node_modules`, and
`.nvmrc` + `NODE_VERSION` pin 22 there.

### Deviations from the plan

1. **`components/Notice.tsx` was NOT created.** The plan proposed it to unify three hand-rolled
   notice treatments. On implementation it was the wrong call: the three treatments differ
   precisely because `/preorder`'s box uses `border-neutral-900` to be *more* conspicuous than
   `LegalPage`'s `border-neutral-200`, and that difference is the Cal. Civ. Code §1723 argument.
   A shared component with one look would flatten it — which is the option the owner explicitly
   declined. A shared component with three variants preserving each look would be a wrapper with
   no consolidation value. Skipped deliberately; the de-duplication was achieved by removing
   repeated *text*, which is what was actually causing the problem.
2. **`/preorder` prose trim was smaller than the "~30% fewer words" the plan estimated.** Only
   one clause was removed (the duplicate "nothing has been bench-tested or certified" in bullet
   1, which `TARGETS_DISCLAIMER` restates verbatim in bullet 2). The rest of that block is
   load-bearing and `TARGETS_DISCLAIMER` must stay verbatim per `lib/site.ts:376-377`, so there
   was less slack there than the plan assumed. The real duplication was elsewhere.

### Two live defects found and fixed en route (not in the original scope)

1. **`app/page.tsx` final CTA promised "Refundable in full until the day it ships."** That is the
   pre-2026-08-04 policy, left behind when `REFUND_POLICY` narrowed to
   all-sales-final-except-on-delay. It was live on the home page and promised something *more*
   generous than the policy beside it — the direction a buyer would reasonably rely on. Corrected
   to match `REFUND_POLICY`.
2. **`functions/api/checkout.ts` `PRODUCT_DESCRIPTION` said "Cancel any time before shipment for
   a full refund."** Same stale policy, and this string is what Stripe displays *at the moment of
   payment*. It has never been shown to a buyer because route B is switched off, but it would
   have contradicted the site the day route B was enabled. Corrected, and "batteries not
   included" added since that is a point-of-sale disclosure.

### Outstanding — owner action required

Nothing in this repo can do these, and the change is not complete without step 1:

1. **Set the Stripe Payment Link to $50.00 now.** Until then the site says $50 and Stripe charges
   $49.99.
2. **Change it to $70.00 on 2026-08-10**, and **redeploy on 2026-08-11**.
3. `UNVERIFIED — to confirm, log into Stripe and check the payment link's price, US shipping
   collection, free shipping rate, and the /preorder/success redirect.`
4. `UNVERIFIED — no visual/browser check was run; this repo has no screenshot tooling. To
   confirm: node node_modules/next/dist/bin/next build && npx serve out`, then read `/` and
   `/preorder` by eye, including the countdown after JS loads.
