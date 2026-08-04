# Preorder commerce — $49.99, free shipping, 120-day lead time

**Date:** 2026-08-03
**Branch:** `waitlist-pivot-legal-hardening`
**Requested by:** Lucas Nam
**Status:** executing (approval given in-session, twice: "lets just do the whole",
"lets do the whole cost for 49.99 free shipping up front")

---

## What changed and why this doc exists

This reverses the 2026-07-29 decision recorded in `lib/site.ts` and
`components/PricingSection.tsx`, which removed a $15 deposit and every price
from the site. That removal was documented with two named reasons. Both still
stand as of today, and neither has been resolved. They are restated in
"Accepted risks" below so that whoever reads this next does not mistake the
reversal for a discovery that the old reasoning was wrong. It was not
re-analysed. It was overridden.

## Decisions (fixed, from the user)

| Decision | Value |
| --- | --- |
| Charge model | Full amount captured at checkout |
| Price | $49.99 USD |
| Shipping | Free, included |
| Ship window | 120 days from order date |
| Ships to | United States only (unchanged) |
| Payment rail | Stripe Checkout, hosted redirect |
| Live money | **No** — gated behind `PREORDERS_ENABLED` + Stripe test keys |

The live-money gate was my call, not the user's — they declined to answer the
merchant-of-record question twice. See "Blocking before this can take real
money".

## Update 2026-08-04 — product facts changed, and a simpler payment route

Owner supplied revised specs and a second, simpler way to go live.

**Product facts (all applied site-wide):**

| Was | Now |
| --- | --- |
| One brushless axial fan | **Two blower fans** |
| 9–12 hr runtime target | **4–6 hr** |
| PETG perimeter + TPU rails | **PETG throughout, no TPU** |
| "Active Fan" | **"FlowPack V1"** |
| Passive Panel / Complete Backpack: "Concept" / "Idea only" | **"Launching Q2 2027"** |

Two of these collided with copy that argued the opposite and had to be
rewritten rather than find-replaced:

- `app/about/page.tsx` narrated *"Two fans meant two noise sources… a single
  brushless fan… is the design we settled on. Subtraction, not addition."* It
  now tells the reversal honestly — one fan could not move enough air through a
  5 mm channel — and states the cost (runtime halved, 26 dB harder).
- The same file's founder note asserted "The fan count here is ONE, matching
  PARTS and SPECS". Updated, with a warning that the count has now changed
  twice and the prose cannot read from `lib/site.ts`.

**Open risk introduced by the spec change:** the **26 dB target was set against
one axial fan**. Two blowers at equal airflow are louder, and `/about`
principle 02 makes quietness a gate the product must clear. The figure is
retained only because everything on the site is labelled a target. Measure it
before it is ever firmed up.

**"Launching Q2 2027"** is a public availability claim on two products with no
design work started. Softer than a ship promise — nothing is for sale, so no
Mail Order Rule clock runs — but availability claims are the easiest FTC
deception cases to prove because they are specific and checkable. If Q2 2027
arrives and neither has launched, change the date; do not let it sit stale.

### Route A — Stripe Payment Link (added, and now the recommended path)

`STRIPE_LINK` in `lib/site.ts`. Paste a `https://buy.stripe.com/…` URL and
preorders go live: no API key, no secret in the repo, no webhook, no Pages
Function. `PREORDERS_ENABLED` derives from it automatically. Trade-off: nothing
is written to the `preorders` table, so the Stripe dashboard is the only order
list — fine for the first hundred orders.

Route B (Checkout Session API + webhook) stays built and is unchanged. Route A
wins if both are configured.

**Verified by smoke test:** setting `STRIPE_LINK` to a placeholder rendered a
live `<a href="https://buy.stripe.com/…">Preorder · $49.99</a>` on `/preorder`
with the disclosure intact, flipped all eight site CTAs from "Join the
waitlist" to "Preorder · $49.99", and removed the closed-state panel. Reverted
to `""` afterwards.

**Header/hero/footer CTAs deliberately link to `/preorder`, never straight to
Stripe** — those placements have no disclosure text near them, and a hero
button going directly to a payment page lets someone buy without ever passing
the "no unit exists" block.

## Architecture

The site is `output: "export"` on Cloudflare Pages. There is no Node server.
So checkout follows the existing `/api/notify` precedent exactly:

```
browser                     Pages Function              Stripe
   |                              |                        |
   |-- POST /api/checkout ------->|                        |
   |                              |-- POST /v1/checkout/   |
   |                              |        sessions ------>|
   |                              |<------ session.url ----|
   |<---- { url } ----------------|                        |
   |                                                       |
   |-- window.location = url ----------------------------->|
   |                                                       |
   |<-- redirect /preorder/success ------------------------|
                                  |                        |
                                  |<-- POST /api/stripe-   |
                                  |    webhook (signed) ---|
                                  |-- insert preorders --->| (Supabase)
```

Two Pages Functions, both raw `fetch` — no `stripe` SDK, no
`@supabase/supabase-js`. This is not a style preference: the memory audit in
`docs/plans/2026-07-30-memory-audit-and-production-hardening.md` measured the
Supabase SDK leaking ~13 KB of live heap per request. Same reasoning applies to
any per-request client object. Do not "simplify" these to SDKs.

**The webhook is the source of truth for a paid order, not the success
redirect.** A user can close the tab, and a success URL can be visited directly
by anyone. Only `checkout.session.completed` with a verified signature writes a
row.

### CSP

`public/_headers` needs **no change**. Checkout is a top-level JS navigation to
`checkout.stripe.com`, which CSP does not govern — `connect-src 'self'` already
covers the same-origin POST to `/api/checkout`, and `form-action` is not
involved because we redirect rather than submit a form. This was checked
deliberately; do not add `https://*.stripe.com` to the CSP "just in case", it
widens the policy for nothing.

## Files

**New**
- `functions/api/checkout.ts` — creates a Stripe Checkout Session
- `functions/api/stripe-webhook.ts` — verifies signature, records paid order
- `app/preorder/page.tsx` — the preorder page (price, terms, lead time)
- `app/preorder/success/page.tsx` — post-payment confirmation
- `app/refunds/page.tsx` — cancellation & refund policy (FTC requirement)
- `components/PreorderButton.tsx` — replaces `WaitlistButton`
- `components/PreorderCheckout.tsx` — client, POSTs to `/api/checkout`
- `supabase/migrations/20260803_create_preorders.sql`

**Modified**
- `lib/site.ts` — price/lead-time constants, rewritten legal notices, FAQ
- `components/PricingSection.tsx` — price returns to the Active Fan card
- `components/{Header,Footer}.tsx` — CTA copy
- `app/{page,about/page,not-found}.tsx` — CTA copy
- `app/terms/page.tsx` — sale terms, ship window, cancellation
- `app/privacy/page.tsx` — Stripe named as a processor
- `lib/site.ts` `LEGAL_NAV` — add Refunds

## Legal work this forces (not optional, all included)

Taking money creates obligations that a waitlist did not. Each of these is
implemented, not just noted:

1. **FTC Mail Order Rule (16 CFR 435).** Requires a stated shipping estimate at
   the time of order. 120 days is stated on the preorder page, in Terms, and in
   the Stripe Checkout description. If the date slips, the Rule requires a
   revised-date notice offering a full refund with no conditions — the refunds
   page commits to this in those terms.
2. **Refund policy.** Published at `/refunds`, linked from the footer, the
   preorder page and Terms.
3. **`NOT_A_COMPANY_NOTICE` was false the moment this shipped.** It read
   "nothing is sold here, and no money is collected". Rewritten.
4. **`NOT_AN_OFFER_NOTICE` is deleted, not edited.** It read "This is a
   waitlist, not a shop... Nothing on this site is an offer to sell." Keeping a
   softened version next to a checkout button would be worse than removing it.

## Accepted risks — READ BEFORE TOUCHING THIS AGAIN

These are the reasons the deposit was removed on 2026-07-29. The user has
overridden them. They are not fixed.

1. **Patent — the serious one.** 35 U.S.C. §271(a) makes an *offer to sell* an
   act of infringement on its own; nothing has to ship for liability to attach.
   Vaucluse Gear holds **US 11,779,097** (granted 2023, expires ~2042) covering
   a modular spacer that creates airflow between a user and a wearable bag via
   extension loops a strap passes through. ErgoFlo has had **no
   freedom-to-operate opinion**. Publishing a definite product at a definite
   price is precisely the act §271(a) reaches. Adding a fan is not a
   design-around — under the all-elements rule, practising every element of a
   claim infringes regardless of what is added. The plausible distinction is
   that claim 1 requires an *adjustable* gap and ErgoFlo's 5 mm spacer-mesh loft
   is fixed. That is an attorney's call.
2. **Capacity.** `lib/site.ts` records both operators as under 18. A minor's
   contracts are voidable (Cal. Family Code §6710), and Stripe's ToS requires
   the account holder be 18+. There is currently no lawful seller of record.
3. **Selling an unbuilt product.** No unit exists, no battery cell is selected,
   nothing is bench-tested or certified. Every figure on the site is an
   engineering target. Taking full payment for it makes each of those targets a
   representation a paying customer relied on.
4. **Sales tax.** Not handled. Stripe Tax is not enabled. Economic-nexus
   thresholds are unlikely to be hit at this volume, but "unlikely" is not
   "handled".

## Blocking before this can take real money

`PREORDERS_ENABLED` is `false` and the Stripe key is a test key. Flipping it
requires, in order:

1. An adult 18+ as Stripe account holder and named seller of record.
2. A freedom-to-operate opinion on US 11,779,097.
3. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set as Cloudflare Pages
   environment variables (never in the repo).
4. Webhook endpoint registered in the Stripe dashboard against
   `https://ergoflo.tech/api/stripe-webhook` for `checkout.session.completed`.
5. `SELLER_OF_RECORD` in `lib/site.ts` set to the adult's legal name, and
   `/terms` re-read end to end with that name in place.

Until 1 and 2 are true, flipping the flag means taking money for a product that
may not lawfully be offered, from customers who have no enforceable counterparty.
