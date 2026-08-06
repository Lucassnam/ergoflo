# Instagram launch post — ErgoFlo preorder

**Date:** 2026-08-06
**Status:** Draft, ready to post pending the three gates in §5.
**Companion to:** `docs/plans/2026-08-03-preorder-commerce.md` (what is being sold),
`docs/plans/2026-08-06-pricing-and-disclosure-restructure.md` (what the price will be),
`docs/asset-shot-list.md` (how product imagery gets made).

This is the first marketing doc in the repo. There was no `docs/marketing/` before
today and no established social conventions, so this file sets them. Anything added
later — Reels scripts, Reddit posts, outreach email — should reuse the conventions in
§4 and §6 rather than reinventing them.

**Every factual claim below was diffed against `lib/site.ts` on 2026-08-06.** That
file is the source of truth. If a number here disagrees with it, this file is wrong.

---

## 0. The one decision that shapes the whole post

Every competing product post on Instagram makes a confident performance claim.
ErgoFlo cannot: nothing has been built, nothing has been bench-tested, and
`TARGETS_DISCLAIMER` says so on every page. Fighting that constraint produces a
weak, hedge-filled post.

**So the post is built on the constraint instead.** The hook is that this is a real
design by two students who will tell you exactly what they haven't proven yet. On a
feed full of dropshipped gadgets with fake specs, "here is what we have not measured"
is the differentiator, not the liability. It is also the only version that survives
contact with `lib/site.ts`.

Practical consequence: the required disclosures live **on the slides**, in readable
type, not buried under Instagram's "…more" fold. See §3.

---

## 1. Format

**Carousel, 6 slides, 1080 × 1350 (4:5).** Reasons: 4:5 is the tallest ratio
Instagram serves in-feed, carousels get a second impression when a user doesn't
swipe, and six slides is enough to carry the disclosures without a wall of caption
text.

Only two usable images exist — `public/product-render.webp` (1024×1024, black PETG
frame on white) and `public/student-carry.webp` (928×1160, student wearing a pack).
Both need upscaling/reframing to 1080×1350. Slides 2–5 are type-led on the site's
white background, which matches the light theme and costs nothing to produce.

---

## 2. Slide-by-slide

Visual direction follows the live site: white background (`#FFF`), near-black text,
single cyan accent (`#0891b2`), Baskerville-style serif for headlines.

**Slide 1 — hook**
- Image: `student-carry.webp`, cropped to 4:5, warm outdoor frame.
- Overlay headline (serif, large): *"Your backpack is why your back is soaked."*
- Small corner tag, cyan: `Not built yet · Preorder`

**Slide 2 — the mechanism**
- Image: `product-render.webp` on white, product filling ~70% of frame.
- Headline: *"It sits between you and the pack you already own."*
- Sub: *"Two blower fans push air along a channel instead of straight at your back."*
- **Required corner caption, small but legible:** `Render of an unbuilt design.
  Colour, finish and hardware may change.`
  This is mandatory — it is the same disclaimer `components/ProductRender.tsx`
  carries on the site, and the rule in the project notes is that it travels with
  any pre-production image.

**Slide 3 — the targets, labelled as targets**
- Type only, three stats stacked, each with its qualifier attached:
  - `25°F` — *Target: how much cooler the panel surface should feel*
  - `4–6 hrs` — *Target runtime per set of AA cells*
  - `26 dB` — *Target noise at the shoulder*
- Footer line, same size as the labels, not smaller:
  *"Targets for a design that has not been built. Nothing has been bench-tested or
  certified."*

**Slide 4 — what you actually get**
- Type only, four lines:
  - One-piece PETG frame
  - 3D spacer mesh, 5 mm loft
  - Two PWM blower fans
  - Takes AA batteries — **not included, you supply them**
- Sub: *"No lithium pack. Nothing that can vent or catch fire against your back."*

**Slide 5 — the honest slide (this is the one that earns the follow)**
- Headline: *"Things we haven't proven."*
- Body:
  - No unit exists. No fan or frame has been produced.
  - Fit has not been validated against a single real backpack.
  - 26 dB was calculated against one fan. The design now has two. We owe you a
    measurement.
- Closing line: *"We'd rather you read this before you order than after."*

**Slide 6 — the ask**
- Headline: *"Preorder at ergoflo.tech"*
- Body:
  - Free shipping, United States only
  - We aim to ship in about 120 days
  - Preorders are final — except if we miss the window, if we abandon the project,
    or if it arrives damaged. Then you're refunded in full.
  - *A student project by Lucas Nam and Edison Hsu. Not a company.*

---

## 3. Caption

Instagram truncates at roughly 125 characters. Everything before the break has to
work standing alone. **The material terms are on the slides, so the caption is
persuasion, not disclosure** — but it repeats the important ones anyway.

```
Every backpack company solved back sweat by adding more mesh and hoping.

We added a fan.

ErgoFlo is a thin panel that sits between your back and the pack you already
own. Two blower fans push air along a channel, so the air actually moves
instead of sitting there being trapped by a wall of foam.

Here's the part most product posts skip:

It doesn't exist yet. We're two students, no company, no factory, no shelf
full of stock. Every number on these slides is an engineering target we're
designing against — not a measurement, because there is nothing to measure
yet. Nothing has been bench-tested or certified.

We think that's a better thing to tell you than a spec sheet we made up.

If you want one, you can preorder it now. $49.99, free shipping, US only, and
we aim to ship in about 120 days. Runs on AA batteries you supply — no lithium
pack riding against your spine. Preorders are final, with three exceptions:
we miss the window, we abandon the project, or it shows up damaged. Any of
those and you get your money back.

ergoflo.tech — link in bio.
```

**Hashtags** (first comment, not the caption — keeps the caption clean and the
disclosures uncrowded):

```
#backpack #edc #gearreview #productdesign #industrialdesign #3dprinting
#studentfounder #hiking #commuting #everydaycarry #maker #prototyping
#backpacking #ventilation #newproduct
```

Fifteen tags, mid-size rather than mega-tags. `#backpack` and `#hiking` are
saturated; the design and maker tags are where a niche physical product actually
gets discovered.

**Alt text** (set per slide in Instagram's advanced settings — Instagram's
auto-generated alt text will not describe a render correctly):

1. A student in a white t-shirt walking outside a campus building with a navy backpack.
2. A black plastic ventilation panel with a grid of rectangular cutouts, rendered on a white background.
3. Three engineering target figures: 25 degrees Fahrenheit, 4 to 6 hours, 26 decibels.
4. A list of materials: PETG frame, 3D spacer mesh, two blower fans, AA batteries not included.
5. A list of things the makers have not yet proven about the design.
6. Preorder details: 49 dollars 99, free shipping, United States only, ships in about 120 days.

---

## 4. Conventions this doc establishes

Reuse these in every future ErgoFlo marketing asset.

| Convention | Value | Why |
|---|---|---|
| Link | `https://ergoflo.tech/preorder?src=ig` | Attribution. Harmless under `output: "export"` — the param is ignored by the app. **Currently inert:** no analytics is installed, so nothing reads it yet. Keep using it so the data exists when analytics does. |
| Every number carries its condition | "25°F — target, panel surface" never bare "25°F" | Matches `HERO_STATS[].note` in `lib/site.ts`. A bare number off-site contradicts the site. |
| Pre-production imagery carries the render disclaimer | On the asset itself, not just the caption | Same rule as `components/ProductRender.tsx`. |
| Never name a competitor in social copy | — | The site names Vaucluse under `TRADEMARK_NOTICE`. A social post has no room for that notice, and the unresolved patent question (§5.2) makes a public side-by-side the worst possible place to start. |
| Never show a struck-through or "was" price | — | `docs/plans/2026-08-06-pricing-and-disclosure-restructure.md` §0.2 — $70 has never been charged, so a reference-price claim is an FTC problem. Price-increase framing only. |
| Hashtags in first comment | — | Keeps required disclosures uncrowded in the caption. |

---

## 5. Gates — resolve before posting

### 5.1 The price in the caption may be wrong within four days — **blocking**

The caption says **$49.99**, which is what `lib/site.ts:293` (`PRICE_CENTS = 4999`)
says today. But `docs/plans/2026-08-06-pricing-and-disclosure-restructure.md` was
**approved today** and moves the site to $50 now → $70 on 2026-08-10. That plan is
**not implemented** — the constant is still 4999 and no early-bird constants exist.

Three outcomes:

- **Post today, plan ships later** → the post advertises $49.99 while the site says
  $70. An Instagram post is not editable after publishing except for its caption
  (captions *are* editable — slides are not). Since the price is in the caption and
  on slide 6, **slide 6 would be permanently wrong.**
- **Take the price off slide 6** and leave it in the caption only → the caption can
  be edited on Aug 10. This is the safe version and is what I recommend if you post
  before the pricing change ships.
- **Wait until the pricing change ships**, then use the variant in §6.

**Recommendation: remove the price from slide 6, keep it in the caption only.**
Slide 6 becomes "Preorder at ergoflo.tech · Free shipping, US only · ~120 days".

### 5.2 Patent exposure widens — **flag, not a blocker**

35 U.S.C. §271(a) makes an *offer to sell* infringing on its own; nothing has to
ship. The site already carries this exposure at the owner's explicit decision
(`lib/site.ts` commerce block: *"THIS RISK IS NOW LIVE ON THE SITE"*), and no FTO
opinion on **US 11,779,097** exists. An Instagram post does not create a new
*category* of risk — but it makes the offer discoverable by exactly the party most
motivated to search for it, and public posts are archived and screenshotted.

This is your call and you've already made the underlying one. Two concrete
mitigations that cost nothing: **do not name Vaucluse** (see §4), and **do not use
the word "adjustable"** anywhere in the post — that limitation in claim 1 is the
likeliest basis for a non-infringement position, and the fixed 5 mm loft is the
argument. Don't write copy that undermines it.

### 5.3 Do not put paid spend behind this — **blocking for ads, not for organic**

Both operators are minors. The same issue that blocks the Stripe account (no adult
18+ named as account holder; contracts voidable under Cal. Family Code §6710)
applies to a Meta ads account and its payment method. Post organically; do not
boost.

### 5.4 Check the provenance of `student-carry.webp`

The image shows a person's face and has artifacts consistent with generative
imagery in the lower right. Before it runs as advertising, confirm which it is:

- **AI-generated** → fine as illustrative context, but it must not be presented or
  implied to be a customer or a photo of the product in use. It isn't, in this draft.
- **A real person** → you need their permission to use their likeness in an
  advertisement. A photo licensed for a website is not automatically licensed for
  paid or promotional social use.
- **Licensed stock** → check whether the licence covers social advertising.

Either way there is **no ErgoFlo product in that photo**, so the slide must not
imply the pack is wearing one. The current slide-1 copy doesn't.

---

## 6. Variant — use only after the pricing change ships

Do not use this until `EARLY_BIRD_PRICE_CENTS` exists in `lib/site.ts` **and** the
Stripe Payment Link has actually been repriced to $50.00 in the dashboard. The site
cannot verify the Stripe amount; only the account holder can. Advertising a price
Stripe doesn't charge is the failure mode §0.1 of the pricing plan describes.

Replace the price paragraph in §3 with:

```
$50 to preorder, free shipping, US only. On August 10 the price goes to $70 —
not a fake discount, just the price going up. We aim to ship in about 120 days.
```

**Never** write "was $70", "save $20", or a struck-through price. $70 has never
been charged, so a reference-price claim is unsubstantiated under 16 CFR 233.1.

---

## 7. Pre-flight — verified 2026-08-06

- [x] `docs/` listed and skimmed; this doc declared a companion to the three plans it depends on
- [x] Source of truth located (`lib/site.ts`); every number diffed against it
- [x] Corrected against stale notes: **IPX4 removed** (never tested, `lib/site.ts:482-485`); **battery is AA cells, not a 2000 mAh USB-C pack** (`lib/site.ts` SPECS); **runtime 4–6 hrs, not 9–12** (cut 2026-08-04 for two blowers); **TPU rails gone**, PETG throughout
- [x] Every number carries its condition
- [x] No competitor named; no prior-art comparison made
- [x] No unverified specific presented as fact
- [x] Price contradiction flagged as blocking (§5.1) rather than guessed
- [x] Post-dated pricing variant gated inert behind an explicit condition (§6)
- [x] Gates listed explicitly in the summary
