# ErgoFlo — Product Requirements Document

**Status:** Draft v1.0 — **PARTIALLY SUPERSEDED, see the warning below**
**Date:** 2026-07-24 (brand name updated 2026-07-30)
**Owner:** Kiyoung Nam
**Scope of this document:** the physical product *and* the site that presents it.

> ⚠️ **This PRD predates two decisions that overrule it.** Read these first:
> - `docs/plans/2026-07-29-production-legal-security-hardening.md` — the site
>   **no longer sells anything**. Stripe, the $15 deposit, the $40 price, the
>   unit cap and the ship window were all removed. Wherever this document says
>   "preorder", "price" or "ship date", it is describing a site that no longer
>   exists.
> - `docs/plans/2026-07-30-legal-risk-review.md` — brand, domain and remaining
>   legal findings.
>
> **Brand name — CHANGED 2026-07-30. The name is `ErgoFlo`.** One word, capital
> E, capital F, no trailing "w". It was **ErgoFlow** from 2026-07-24 until
> 2026-07-30; the rename happened because `ergoflow.com` has been registered to
> a third party since 2003 and could never be obtained, which left the site's
> published legal-contact address pointing at a domain nobody here controls.
> "Ergo Float", "Ergo Flow" (two words) and "Ergo Blow" remain dead. The name
> lives in exactly one place in the codebase — `BRAND` in `lib/site.ts`.
> Known and accepted: `ERGOFLO` is a live federal registration for mop handles
> (Class 021), and `ergofló` is an unrelated consumer product. See the brand
> note in `lib/site.ts` before filing any trademark application.

---

## 1. Problem

Every backpack sold since the 1990s has a passive back panel: shaped foam,
sometimes with a suspended mesh sock over it. It does not move air. It relies
on convection to carry heat and moisture away from the one surface that is
pressed flat against a warm, sweating back under load.

The result is universal and unaddressed: you arrive with a wet shirt. For
commuters this means changing at work. For students it means sitting through a
lecture damp. For hikers it means a cold back at the first stop.

Every "ventilated" product on the market competes on the *shape* of the foam.
None of them add energy to the system.

## 2. Solution

A thin active-cooling panel that sits between the wearer's back and the pack,
retrofitting into a bag the customer already owns.

- Two brushless PWM fans mounted either side of the spine, near the shoulder blades
- A tensioned 3D spacer-mesh window (5 mm loft) across the lumbar zone, with no
  rigid backing, so it flexes with the spine
- TPU tension rails that spread load across the panel instead of down one line
- A rigid PETG perimeter that holds the mesh under constant tension
- A 2000 mAh USB-C Li-ion cell

### Target users

| Segment | Trigger | What they care about most |
|---|---|---|
| Commuters | Daily walk/transit leg with a laptop | Arriving presentable; silence in shared spaces |
| Students | Campus walks, back-to-back classes | Price; runtime across a full day |
| Hikers / day-packers | Sustained climbs in heat | Weight; water resistance; high-mode airflow |

### Non-goals for v1

- Selling a backpack. This is an accessory; we do not compete with pack brands.
- Fitting every pack. v1 targets 15–45 L bags with a suspended back panel.
- App connectivity, telemetry, or a companion phone app.
- Cooling below ambient. This is airflow and evaporation, not refrigeration.

## 3. Measured performance

These are the figures used across the site. All are bench-measured; none are
modelled or extrapolated.

| Metric | Value | Notes |
|---|---|---|
| Perceived temperature drop | up to **25 °F** cooler | at the panel, against the back |
| Runtime | up to **46 hrs** per charge | also runs directly off USB-C |
| Noise | **26 dB** at the shoulder | below typical office ambient |
| Added weight | **168 g** | |
| Water resistance | **IPX4** | splash resistant, not submersible |
| Compatibility | packs **15–45 L** with a suspended back panel | |

**Rule for this project:** no number appears on the site that hasn't been
measured. Where a figure is a target rather than a measurement (e.g. per-unit
cost), the site says so explicitly or omits it. The investors page publishes no
margin figure for exactly this reason.

## 4. Bill of materials (structure, not costed)

| Part | Spec |
|---|---|
| Frame | PETG perimeter, TPU rails |
| Panel | 3D spacer mesh, 5 mm loft |
| Fans | 2 × brushless, PWM speed control |
| Battery | 2000 mAh Li-ion, USB-C in |
| Controller | PWM, two-position (Low / High) |

Component and landed costs are still being quoted. Until they are, unit margin
stays unpublished.

## 5. Commercial model

- **$15** deposit at reservation
- **$40** total
- **$25** charged when the unit ships
- Shipping target: **before August 8**
- Deposit is refunded only if production does not move forward

Rationale: the deposit funds tooling before the run, so production is triggered
by demand rather than committed ahead of it. Working-capital exposure stays low.

### Checkout

Stripe Payment Link. No backend, no database, no accounts. The site collects
nothing. The single URL lives in `STRIPE_LINK` in `lib/site.ts`; until a real
link is pasted there, every Reserve button explains that checkout isn't wired up
rather than dropping the visitor on a broken Stripe page.

## 6. The website

### Goals

1. Make the problem *felt* in under five seconds (the before/after slider).
2. Establish credibility with measured numbers, not adjectives.
3. Convert to a $15 deposit with the smallest possible commitment.

### Routes

| Route | Job |
|---|---|
| `/` | Long-scroll sales page: hero → proof → problem → exploded build → parts → fan modes → specs → preorder → FAQ → final CTA |
| `/about` | Why this exists; principles; how it got here |
| `/investors` | Thesis, current status, unit model, honest risk list, contact |

### Signature interactions

- **Comparison slider** — pixel-aligned grid of 24 shirt backs, sweaty on the
  left, dry on the right, with a draggable cyan divider. This is the single most
  important element on the page; it is the argument.
- **Scroll-scrubbed exploded diagram** — four isometric layers pull apart as you
  scroll, each labelled.
- **Count-up stats** — 25 °F / 46 hrs / 26 dB animate on first view.
- **Low / High fan visual** — spin rate and airflow bars respond to the toggle.
- **Ambient airflow canvas** — particles drift up behind the hero.

### Non-functional requirements

- Every interaction works by keyboard and exposes a name to assistive tech.
- `prefers-reduced-motion` is honoured: no scrubbing, no count-up, no particles,
  no fades — all content renders at its final state.
- Fully static. All three routes prerender; there is no server runtime.
- Dark-only by design. This is a committed aesthetic, not a missing light mode.

## 7. Risks

| Risk | Mitigation |
|---|---|
| Fit fragmentation across packs | v1 bounded to 15–45 L suspended-panel bags; fit data from run one directs run two's geometry |
| Battery shipping and certification | Cell selection specified against those constraints up front, not retrofitted |
| Fast-follow competition | 26 dB and 168 g are the hard parts; defensibility is execution and being first into the installed base, not IP |
| Preorder credibility | Small deposit, explicit refund terms, deliberately conservative ship window |

## 8. Open items before launch

1. ~~**Paste the live Stripe Payment Link** into `STRIPE_LINK`.~~ **Void as of
   2026-07-29** — `STRIPE_LINK` was deleted and commerce removed entirely. Do
   not reinstate it without a freedom-to-operate opinion on US 11,779,097.
2. **Make `hello@ergoflo.tech` actually receive mail.** The constant is set
   (2026-07-30), but the mailbox must exist: `/privacy` promises a
   5-business-day reply to deletion requests there and `/terms` promises 30 days
   on disputes.
3. Swap in real product renders/photography when available
   (`public/renders/`); the exploded diagram is drawn, not rendered.
4. Re-confirm the "before August 8" ship window against actual tooling lead time.
5. Add an OG share image (metadata is wired; the image file is not yet present).
