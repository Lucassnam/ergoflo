/* ============================================================
   SITE CONFIG — single source of truth.

   CONTACT_EMAIL and SITE_URL are both set to the real ergoflo.tech
   domain as of 2026-07-30. Two things still have to be true off-site:
     1. hello@ergoflo.tech must actually receive mail. /privacy promises
        a 5-business-day answer to deletion requests at that address and
        /terms promises 30 days on disputes — those are the only two
        enforceable promises on the site, so a dead mailbox is a broken
        legal commitment, not a cosmetic gap.
     2. A records for ergoflo.tech AND www.ergoflo.tech must point at
        the deploy host, or Caddy cannot issue a certificate. See the
        header of ./Caddyfile.
   No postal address is published on purpose — see the identity note.
   Nothing else in the codebase hardcodes these two values.

   ─── COMMERCE IS LIVE. REAL MONEY. ───
   Free shipping, 120-day lead time, preorders final except on delay.
   STRIPE_LINK below holds a LIVE Stripe payment link (no `test_`
   prefix), so a visitor can complete a real card payment right now.
   PREORDERS_ENABLED derives from it automatically.

   THE PRICE IS FLAT, $49.99. The two-tier early-bird/regular scheme
   introduced 2026-08-06 (see docs/plans/2026-08-06-pricing-and-disclosure-
   restructure.md for that history) was removed on 2026-08-06 at the
   owner's request. $49.99 is also what the live Stripe payment link
   below is already priced at — read the pricing block above PRICE_CENTS
   before touching the number, so the two stay in sync.

   This block previously said commerce was "gated behind TEST keys, so
   no real money moves yet". That stopped being true on 2026-08-04 when
   the live link was pasted in, and the stale comment survived long
   enough to make the owner believe checkout was still closed. If you
   empty STRIPE_LINK or swap it for a test link, UPDATE THIS PARAGRAPH
   IN THE SAME EDIT — a comment about whether the site takes money is
   not documentation, it is the thing people check before trusting it.

   Read the commerce block below and
   docs/plans/2026-08-03-preorder-commerce.md before changing any of it.

   BRAND is settled: one word, capital E, capital F — "ErgoFlo".
   Renamed from "ErgoFlow" on 2026-07-30. Read the brand note below the
   identity block before changing it again.

   ─── CLAIMS RULE, READ BEFORE EDITING ANY NUMBER ───
   As of 2026-07-29 NOTHING on this product has been bench-measured and
   NO certification exists. Every figure below is an engineering TARGET
   derived from component datasheets. They must be presented as targets
   wherever they are displayed — never as measurements, never as specs.

   Do not add: an IP rating (IPX4 was removed — it is a formal IEC 60529
   rating and this product has never been tested), a certification mark
   (FCC/CE/UN38.3/IEC 62133), an availability claim like "Available Now",
   or a warranty term. Each of those is specific, checkable, and
   falsifiable — which is exactly what turns marketing copy into an FTC
   or Lanham Act problem.
   ============================================================ */

export const BRAND = "ErgoFlo";

/* ============================================================
   BRAND NAME — "ErgoFlo", set 2026-07-30. Was "ErgoFlow".

   The rename happened because ergoflow.com is not available: it has
   been registered to a third party since 2003-12-09 and serves a parked
   resale lander. No email on that domain could ever be reached, which
   mattered because CONTACT_EMAIL is the address /privacy publishes for
   data-deletion requests and /terms publishes for disputes.

   TWO THINGS THAT WERE KNOWN AND ACCEPTED WHEN THIS NAME WAS CHOSEN.
   Do not treat either as an open discovery:

     1. `ERGOFLO` is a LIVE federal registration — USPTO Reg. 4286129,
        Serial 85661701, filed 2012-06-26, registered 2013-02-05,
        Sections 8 & 15 accepted 2018-11-30 (so it is incontestable).
        Goods: mop handles, International Class 021. That is a distant
        class from a backpack accessory (Class 018 / 009), so
        coexistence is arguable — but it is an EXACT character match,
        which "ErgoFlow" was not. Registering ERGOFLO federally for this
        product is not a sure thing.
     2. `ergofló` is an existing consumer product name (Perfect Fit,
        an enema/douche system sold on Amazon). It is a Class 010
        medical device, so not a legal conflict, but it is what shares
        the name in consumer search results.

   These WERE tolerable while this was a waitlist page that sold
   nothing. As of 2026-08-03 the site takes orders, which raises the
   stakes on both: an exact-character match to a live incontestable mark
   matters more once you are using the name in commerce on goods. Run a
   knock-out search at tmsearch.uspto.gov in Class 018 and 009 before
   filing anything, and before any packaging or logo spend.
   ============================================================ */

/** On ergoflo.tech, the domain the deploy stack in ./Caddyfile serves. */
export const CONTACT_EMAIL = "hello@ergoflo.tech";

/** No trailing slash. Must match the site block in ./Caddyfile exactly —
    OG/Twitter cards, the sitemap and robots.txt all derive from it. */
export const SITE_URL = "https://ergoflo.tech";

/* ---------------- identity ---------------- */

/* ============================================================
   NO BUSINESS ENTITY IS CLAIMED. Changed 2026-07-29.

   This block previously declared "Lucas Nam, sole proprietor, doing
   business as ErgoFlo". That was removed once it became clear that
   BOTH people building this are under 18.

   Why the site now asserts no structure at all:
     - A minor's contracts are voidable (Cal. Family Code §6710), so
       declaring a business structure a minor cannot be bound to is at
       best meaningless and at worst a false statement about who
       operates the site — the one fact legal pages most need right.
     - Naming a second person as an owner would create an implied
       general partnership (Cal. Corp. Code §16202), making both
       personally liable. Neither wants that and neither needs it.
     - Nothing is sold here, so no seller of record is required.

   Saying "a student project" is accurate, claims nothing, and is the
   honest description. Do not reintroduce "sole proprietor", "LLC",
   "company", or an ownership claim without an adult with legal capacity
   actually holding that role.

   NO POSTAL ADDRESS IS PUBLISHED, deliberately. Both operators are
   minors, so a public mailing address would be a minor's home address.
   It is not required: CalOPPA does not ask for one, and CAN-SPAM only
   requires a physical address inside a commercial EMAIL. Before sending
   any launch email, use a PO box or a school/organisation address —
   never a home address.
   ============================================================ */

/** People who build it. Not owners, not an entity — see the note above. */
export const LEGAL_NAME = "Lucas Nam and Edison Hsu";

/** Used wherever the site has to say who is behind it. */
export const LEGAL_ENTITY = `${BRAND}, a student project by ${LEGAL_NAME}`;

/** Rendered in the legal pages so a reader knows exactly what this is.

    REWRITTEN 2026-08-03. The previous text ended "...nothing is sold here,
    and no money is collected. ...the only information it collects is an
    email address." Every clause of that became false the moment checkout
    shipped. A legal page that misdescribes what the site does is worse
    than no legal page — it is the document a regulator or a customer
    quotes back at you. If commerce is ever removed again, restore the
    old wording; do not leave this version standing over a waitlist. */
export const NOT_A_COMPANY_NOTICE = `${BRAND} is a student business project, not a company. No business entity has been formed. Preorders placed here are taken by the students named on this site, personally, for a product that has not been built yet. We collect your email address and, if you preorder, your name and shipping address. Card details go directly to Stripe and never touch our servers.`;

export const GOVERNING_LAW = "the State of California, United States";

/** Where units ship. Chosen deliberately narrow: US-only keeps GDPR, UK GDPR,
    EU GPSR (which would require a named EU Responsible Person for a battery
    product) and per-destination lithium air-freight rules entirely out of scope. */
export const SHIPS_TO = "the United States only";

export const isSiteUrlLive = !SITE_URL.includes("REPLACE_WITH");

/* ---------------- product ---------------- */

export const TAGLINE = "Active cooling for the pack you already own.";

/* ============================================================
   PREORDER COMMERCE. Changed 2026-08-03, at the owner's explicit and
   repeated instruction. This REVERSES the 2026-07-29 removal.

   The block that stood here said "DO NOT reintroduce a price, a
   deposit, a unit cap, or a ship date without a freedom-to-operate
   opinion in hand." That opinion still does not exist. The decision was
   overridden, not resolved. Preserving the reasoning verbatim, because
   the next person to read this file deserves to know what was traded:

   1. Consumer law. Taking payment triggers the FTC Mail Order Rule
      (16 CFR 435): a stated ship window, a revised-date notice with an
      unconditional refund offer if it slips, refund handling, and
      chargeback exposure. All of that is now implemented — see
      /refunds, /terms and REFUND_POLICY below. It is real work that a
      waitlist did not owe.

   2. Patent law. 35 U.S.C. §271(a) makes "offers to sell" an act of
      infringement on its own — nothing has to ship. Vaucluse Gear holds
      US 11,779,097 (granted 2023, expires ~2042) covering a modular
      spacer device that creates airflow between a user and a wearable
      bag, attaching via extension loops that a strap passes through.
      ErgoFlo has NOT had a freedom-to-operate opinion. Publishing a
      definite product at a definite price is the exact act §271(a)
      reaches. THIS RISK IS NOW LIVE ON THE SITE.

   Adding a fan is NOT a design-around. Under the all-elements rule,
   practising every element of a claim infringes regardless of what else
   you add. The likely distinction is that claim 1 requires the panel gap
   to be ADJUSTABLE via modular supports, and ErgoFlo's 5mm spacer-mesh
   loft is fixed. That is a question for a patent attorney, not this file.

   NOTHING KEEPS THIS SAFE TODAY. This paragraph used to read "WHAT KEEPS
   THIS SAFE TODAY: PREORDERS_ENABLED is false and the Cloudflare env
   holds a Stripe TEST key, so the flow is complete but takes no real
   money." Both clauses stopped being true on 2026-08-04 when the live
   payment link went into STRIPE_LINK below, and this block was missed
   while the one at the top of the file was updated — so the file
   contradicted itself for a day, in the two places someone checks to
   answer "does this site take money".

   It does. PREORDERS_ENABLED derives to true, every buy control is a
   live link, and a visitor can be charged the current tier price right
   now — whatever the Stripe dashboard has that link set to. The gate
   that used to hold this closed is simply not there any more, and the
   reason it existed has not gone away: no adult 18+ has been named as
   Stripe account holder, and both operators are minors whose contracts
   are voidable (Cal. Family Code §6710) — meaning a paying customer
   today has no enforceable counterparty.

   The checklist in docs/plans/2026-08-03-preorder-commerce.md was meant
   to be worked through BEFORE this went live. It is five items, none of
   them optional, and at least three were open when the link was pasted
   back in. See the block above STRIPE_LINK for which.
   ============================================================ */

/* ============================================================
   TWO WAYS TO TAKE A PAYMENT. Only one of them needs to be set up.

   A. STRIPE PAYMENT LINK (below). A URL you create in the Stripe
      dashboard — Product catalogue -> add product -> create payment
      link. Paste it here and preorders are live. No API key, no
      secret in the repo, no webhook, no Pages Function. Stripe hosts
      the whole checkout and emails the receipt. The trade-off is that
      nothing gets written to the `preorders` table, so the Stripe
      dashboard becomes the only order list — which is completely
      workable for the first hundred orders.

   B. CHECKOUT SESSION API (functions/api/checkout.ts, already built).
      Needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET set as
      Cloudflare Pages environment variables, plus a webhook endpoint
      registered in the dashboard. Gives you orders in your own
      database, custom metadata, and the ability to query them.

   STRIPE_LINK WINS IF BOTH ARE SET. That is deliberate: the link is
   the simpler, harder-to-get-wrong path, and if someone has bothered
   to paste one in, that is the intent.
   ============================================================ */

/** Paste a Stripe Payment Link here (https://buy.stripe.com/...) to go
    live via route A. Empty string means "not configured".

    WHAT MUST BE TRUE OF THE LINK ITSELF — the code cannot check any of
    this, so check it by hand in the Stripe dashboard:
      - Price matches PRICE_CENTS below: $49.99, flat, no expiry. A link
        priced differently silently contradicts every page on this site.
      - Shipping address collection is ON, limited to the US.
      - Shipping is free (no shipping rate, or a $0 rate).
      - The confirmation page is set to redirect to /preorder/success.
      - Terms-of-service acceptance is required, pointing at /terms.
    A live key link starts `https://buy.stripe.com/`; a test one starts
    `https://buy.stripe.com/test_`. Both work here — the test one is the
    right thing to paste first. */
/* The `: string` annotation is REQUIRED, not stylistic. Without it TS
   infers the literal type of whatever is pasted here, and then
   `STRIPE_LINK !== ""` below is comparing two non-overlapping literal
   types — a hard TS2367 build error. It failed exactly that way the
   first time a real link was pasted in. Keep the annotation. */
/* ============================================================
   THIS IS A LIVE PAYMENT LINK. No `test_` prefix, real cards.

   It was emptied earlier on 2026-08-04 to keep the merge to main from
   deploying a paying checkout, then deliberately restored. Because
   PREORDERS_ENABLED derives from this constant, a non-empty value here
   means every buy control is live and main deploys a site that charges
   money. Empty it and they all fall back to a waitlist CTA at /notify.

   KNOWN-OPEN ITEMS AT THE TIME THIS WAS RESTORED. These are from the
   "Blocking before this can take real money" section of
   docs/plans/2026-08-03-preorder-commerce.md, and none were closed:

     1. No adult 18+ named as Stripe account holder.
     2. No freedom-to-operate opinion on US 11,779,097 (Vaucluse Gear),
        which matters because 35 U.S.C. §271(a) makes an offer to sell
        an act of infringement on its own.
     3. SELLER_OF_RECORD is still "". /terms therefore renders its
        "No adult is currently named as the seller of record" notice
        alongside a working buy button. That pairing is deliberate and
        honest, but it is not a finished state: fill SELLER_OF_RECORD in
        as soon as an adult holds the Stripe account, and the notice
        swaps itself out.

   Whoever closes those, update this block in the same edit.
   ============================================================ */
export const STRIPE_LINK: string = "https://buy.stripe.com/fZu4gz3vleiGfcIdDM43S00";

/** Master switch. While false, every buy control renders as a waitlist
    CTA and /api/checkout refuses to create a session.

    It flips to true ON ITS OWN as soon as STRIPE_LINK is set, because a
    pasted payment link is an unambiguous statement of intent and having
    to flip a second flag is just a way to be confused for an afternoon.
    Set it to `true` manually only when going live via route B. */
export const PREORDERS_ENABLED = STRIPE_LINK !== "";

/* ============================================================
   FLAT PRICING. $49.99, no expiry, no second tier.

   The two-tier early-bird/regular scheme (early-bird $49.99 until
   2026-08-11, then $70.00) shipped 2026-08-06 and was removed the same
   day at the owner's request — see docs/plans/2026-08-06-pricing-and-
   disclosure-restructure.md for that history if it needs revisiting.

   $49.99 is also what the live Stripe payment link (STRIPE_LINK above)
   is already priced at, so removing the second tier requires no
   dashboard change: the site and Stripe still agree with zero action.
   ============================================================ */

/** Cents, not dollars — this is the number handed to Stripe, and float
    arithmetic on money is how you ship a $69.98 charge. Format for
    display with formatPrice(); never hand-write a price string. */
export const PRICE_CENTS = 4999;

export const CURRENCY = "usd";

/** Free shipping is a promise made in the price. Kept as an explicit
    constant so no page can quietly start charging for it. */
export const SHIPPING_CENTS = 0;

/** FTC Mail Order Rule (16 CFR 435.2) requires a shipping estimate at the
    time of order. Absent one, the Rule imposes a 30-day default — which
    this product cannot possibly meet. 120 days is the stated window and
    it must appear at checkout, on /terms and on /refunds. If it slips,
    the Rule requires a revised-date notice offering a full refund with
    NO conditions attached. Do not lower this number to look faster. */
export const LEAD_TIME_DAYS = 120;

/** Cancel-any-time-before-shipment is stricter than the law requires and
    is deliberate: it is the honest policy for an unbuilt product, and it
    is far cheaper than the chargebacks that follow from a stingy one. */
/* ============================================================
   ALL SALES FINAL, EXCEPT ON DELAY. Narrowed 2026-08-04 at the
   owner's explicit instruction, reaffirmed after the trade-off was
   put to them.

   WHAT THIS REPLACED: "Cancel any time before your order ships and we
   refund the full $49.99, no questions asked and no restocking fee."
   That was deliberately more generous than the law required, on the
   reasoning that it is the honest policy for an unbuilt product and
   cheaper than the chargebacks a stingy policy produces.

   THE THREE CARVE-OUTS BELOW ARE NOT OPTIONAL AND MUST NOT BE
   NARROWED FURTHER:

     1. DELAY. The FTC Mail Order Rule (16 CFR 435.2) requires that a
        seller who cannot ship within the stated window offer a revised
        date AND an unconditional right to cancel for a full refund.
        This is federal and cannot be contracted around. It is now the
        ONLY general refund path a buyer has.
     2. ABANDONMENT. If the product is never built, keeping the money
        is not "all sales final" — it is taking payment for goods you
        know will never ship, which is conversion and potentially wire
        fraud. Not a policy choice.
     3. DAMAGED OR NON-DELIVERY. A buyer who paid and received nothing,
        or received a broken unit, is owed a remedy regardless of any
        final-sale term.

   CONSPICUOUSNESS IS WHAT MAKES THIS ENFORCEABLE. A no-refund term
   that a buyer cannot see before paying is routinely unenforceable —
   Cal. Civ. Code §1723 is the sharpest version: a retail seller whose
   refund policy is not conspicuously posted must accept returns for 30
   days regardless of what the policy says. So this string renders at
   the point of sale, above the buy button, not only on /refunds.
   Never move it below the fold to lift conversion.

   THE RISK THIS TRADES FOR: chargebacks. A buyer who cannot get a
   refund from you goes to their card issuer instead, and with no adult
   named as seller of record that dispute is lost by default — costing
   the money AND the dispute fee. This was raised before the change and
   accepted.
   ============================================================ */
export const REFUND_POLICY =
  `All preorders are final. Because you are funding a build rather than buying from stock, ` +
  `we do not offer change-of-mind cancellations once an order is placed. ` +
  `If we cannot ship within ${LEAD_TIME_DAYS} days we will email you a revised date, ` +
  `and you can accept it or take a full refund. That choice is always yours. ` +
  `If we abandon the project, or your order arrives damaged or never arrives, you are refunded in full.`;

/** Single formatter so a price can never drift between two pages. */
export function formatPrice(cents: number = PRICE_CENTS): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Named seller. EMPTY UNTIL AN ADULT 18+ HOLDS THE STRIPE ACCOUNT —
    a sale needs a party with capacity to be bound by it, and neither
    operator has that. /terms renders a blocking notice while this is
    empty. Do not fill it in with a minor's name to silence the notice. */
export const SELLER_OF_RECORD = "";

/** Status line. Now that orders are taken, this has to describe a thing
    someone is paying for, without implying a unit exists. */
export const DEV_STAGE = "In development. Preorder now, ships in about 120 days";

/** One sentence, used verbatim wherever a target figure is displayed.
    Single constant so the disclosure can never drift between pages. */
export const TARGETS_DISCLAIMER =
  "Figures are engineering targets for a design that has not been built, not measured results. Nothing has been bench-tested or certified, and the final product may differ or may never ship.";

/* ============================================================
   NOT_AN_OFFER_NOTICE WAS DELETED HERE ON 2026-08-03. Do not restore
   it alongside a checkout button.

   It read: "This is a waitlist, not a shop. Nothing here is for sale,
   no price is being quoted, and joining does not create an order or any
   obligation on either side. Nothing on this site is an offer to sell."

   Every clause of that is now contradicted by a priced buy button three
   inches away. A disclaimer that the page itself falsifies does not
   reduce liability — it evidences that the operator knew the risk and
   papered over it. Softening it ("this is a preorder, not a sale") would
   be the same mistake in a quieter voice.

   PREORDER_NOTICE below replaces it. It does the one job the old notice
   did that is still honest and still necessary: making unmistakably
   clear that the buyer is paying for something that does not exist yet.
   ============================================================ */

/** Rendered next to every buy control. The specifics are the point — a
    vague "preorders are risky" line does not inform anyone. Name the
    price, the window, and the refund right in the same breath. */
export const PREORDER_NOTICE =
  `This is a preorder for a product that has not been built yet. Every unit is ` +
  `made to order after you pay, not pulled from stock. No unit exists, ` +
  `no fan or frame has been produced, and nothing has been bench-tested or certified. ` +
  `You are charged ${formatPrice()} today and we aim to ship in about ${LEAD_TIME_DAYS} days. ` +
  `All preorders are final, with no change-of-mind refunds. If we miss the ` +
  `${LEAD_TIME_DAYS}-day window you can take a full refund instead of waiting.`;

/** Hero stats. `value` is numeric so it can be counted up; `suffix` is rendered after.
    `accent` drives the glow color each stat card lights up with on scroll.

    Every `note` carries the word "target" on purpose. These are the most
    prominent numbers on the site and the ones a reader is most likely to
    treat as specs, so the qualifier travels with the number rather than
    living in a footnote further down the page. */
export const HERO_STATS = [
  {
    value: 25,
    prefix: "",
    suffix: "°F",
    label: "Target: feels 25°F cooler",
    note: "Perceived drop at the panel surface. A design target, not a measurement",
    accent: "blue",
  },
  {
    /* Was 9–12 hrs. Cut to 4–6 on 2026-08-04 when the design moved to TWO
       blower fans — two blowers draw far more than the single axial fan
       the old figure was calculated against. If the fan count changes
       again, this number moves with it. */
    value: 6,
    prefix: "4-",
    suffix: " hrs",
    label: "Target runtime per set of AA cells",
    note: "Calculated from cell capacity and fan draw. Not yet bench-tested",
    accent: "red",
  },
  {
    value: 26,
    prefix: "",
    suffix: " dB",
    label: "Target noise at the shoulder",
    note: "The design goal the fan is selected against. Not measured",
    accent: "cyan",
  },
] as const;

/* Rewritten 2026-08-04: two blower fans replace the single axial fan, and
   the TPU tension rails are gone — the frame is PETG throughout. Part 03
   used to be "Twin tension rails / TPU rails spread load…". There is no
   TPU in the design any more, so that part was replaced rather than
   reworded. Do not reintroduce TPU anywhere on the site without changing
   it back here first; SPECS below and /preorder both read from this file,
   but app/about/page.tsx tells the design story in prose and has to be
   edited by hand whenever this list changes. */
export const PARTS = [
  {
    num: "01",
    title: "Two blower fans",
    body: "A pair of PWM-controlled blowers sit on a rigid mount behind the distributor. They push air along the channel instead of straight at your back.",
  },
  {
    num: "02",
    title: "Open mesh window",
    body: "The lumbar zone has no rigid backing. Tensioned 3D spacer mesh with a 5mm loft flexes with your spine instead.",
  },
  {
    num: "03",
    title: "One-piece PETG frame",
    body: "A single rigid perimeter carries the load and keeps the mesh under tension. There is no separate rail material and no bonded joint that can fail.",
  },
  {
    num: "04",
    title: "Runs on AA batteries",
    body: "An empty compartment takes standard AA cells, which you supply. No rechargeable pack, no charging cable, and nothing that can vent or catch fire against your back. Swap the batteries and keep walking.",
  },
] as const;

/** Design targets, NOT a spec sheet. The dedicated /specs route was deleted on
    2026-07-29 precisely because publishing a full spec table for a product with
    no battery selected reads as a finished product.

    "Water resistance" is intentionally absent. It previously read "IPX4" — a
    formal IEC 60529 rating that was never tested. Splash resistance is now
    described in prose as a goal, with no rating attached. Do not reintroduce a
    rating here without a test report to point at. */
export const SPECS = [
  ["Frame material", "PETG throughout (target)"],
  ["Panel material", "3D spacer mesh, 5mm loft (target)"],
  ["Fan", "Two blowers, PWM speed control (target)"],
  /* ============================================================
     NO LITHIUM CELL. Changed 2026-08-04. This entry used to read
     "Not yet selected. Approx. 2000mAh Li-ion, USB-C".

     The design now ships an EMPTY battery compartment that takes
     standard AA cells, which the customer supplies. This is the
     single largest risk reduction in the whole project and it should
     not be quietly reversed:

       - No UN38.3 transport testing, no IEC 62133 cell certification.
       - No lithium air-freight or ground-shipping restrictions.
       - No thermal runaway. Alkaline AA cells do not vent or ignite
         the way a Li-ion pouch does, and this product is worn
         against a person's back.
       - Shipping an empty compartment means no battery ships at all,
         which removes the remaining transport questions entirely.

     "BATTERIES NOT INCLUDED" MUST STAY CONSPICUOUS at the point of
     sale, not just here. Failing to disclose that a required
     component is absent is a straightforward FTC deception problem,
     and it is also just how you generate angry email on day one.

     If a rechargeable cell is ever reintroduced, every item in the
     bullet list above comes back with it, plus /terms §6 has to be
     rewritten and product liability insurance stops being optional.
     ============================================================ */
  ["Battery", "Takes AA cells, not included, you supply them"],
  /* ⚠ THIS NUMBER NEEDS RECALCULATING. 4-6 hrs was derived against a
     2000mAh Li-ion pack, not against AA cells driving two blowers.
     It is carried over unchanged and is labelled a target, which
     keeps it honest, but it is now the least-grounded figure on the
     site. Work it out from the actual cell chemistry and fan draw
     before this is ever presented as anything firmer than a goal. */
  ["Runtime", "4-6 hrs per set of batteries (target)"],
  /* 26 dB is retained but is the least defensible figure on this list: it
     was set against ONE axial fan and two blowers are materially louder at
     equal airflow. It stays only because everything here is labelled a
     target and nothing has been measured. Measure it before it is ever
     presented as anything firmer. */
  ["Noise", "26 dB (target)"],
  ["Weight added", "168 g (target)"],
  ["Shipping", "Free, United States only"],
  ["Fits", "Intended for packs 15-45L with a suspended back panel"],
] as const;

/* Answers here are load-bearing legal disclosure, not just copy. The first
   two exist to defeat any reading of this site as a shop, and they must stay
   word-consistent with /terms and with NOT_AN_OFFER_NOTICE above. */
export const FAQ = [
  {
    q: "Can I buy this today?",
    a: `You can preorder it today for ${formatPrice()}, shipping included. Be clear about what that means: ${BRAND} is still a design. No unit exists, nothing has been bench-tested, and nothing is certified. It takes AA batteries, which are not included. You are funding the build, not buying from stock.`,
  },
  {
    q: "What exactly am I paying for, and when does it ship?",
    a: `${formatPrice()} charged today, free shipping, and we aim to ship in about ${LEAD_TIME_DAYS} days. If we can't make that window we'll email you a revised date, and you can accept it or take a full refund. That's your right under the FTC Mail Order Rule, and we'd honour it regardless.`,
  },
  {
    q: "Can I cancel and get my money back?",
    a: `Not for a change of mind — preorders are final once placed, because the money goes straight into building the thing. There are three exceptions, and they are the ones that matter: if we miss the ${LEAD_TIME_DAYS}-day window you can take a full refund instead of waiting; if we abandon the project you are refunded in full; and if your order arrives damaged or never arrives, we replace or refund it. Read the refund policy before you order rather than after.`,
  },
  {
    q: "What if you never build it?",
    a: "Then you get your money back in full. We're students and this is our first hardware project, so it might not work out. Keeping money for something we have decided will never ship is not a policy we get to choose — every order would be refunded.",
  },
  {
    q: "Who am I actually buying from?",
    a: `${BRAND} is a student project, not a company. No business entity has been formed, and preorders are taken by the students named on this site personally. That is unusual and you should know it before paying. Your card details go to Stripe directly and are never stored by us.`,
  },
  {
    q: "Are the numbers on this site measured?",
    a: `No. ${TARGETS_DISCLAIMER} We would rather publish a target and label it than publish a measurement we have not taken.`,
  },
  {
    q: "Will this fit my existing backpack?",
    a: `${BRAND} is designed to retrofit into packs with a suspended mesh back panel, roughly 15–45L. Fit has not been validated against a single real backpack yet, so treat that as design intent, not a compatibility claim.`,
  },
  {
    q: "What happens if it rains?",
    a: "The design goal is to shrug off rain and sweat: splash resistance, not immersion. We are deliberately not publishing an IP rating, because the product has never been through IP testing, and quoting a rating we have not earned would be a claim we cannot back up.",
  },
  {
    q: "Isn't someone already doing this?",
    a: "Passive versions, yes. One of them, Vaucluse, is a well-made retrofit ventilation frame you can buy today. It has no fan, so it holds a gap open and waits for you to move. We are trying to build the version that moves air on a still day, when a passive gap does nothing.",
  },
  {
    q: "Where would you ship?",
    a: `${SHIPS_TO.charAt(0).toUpperCase() + SHIPS_TO.slice(1)}, if it ever ships. Shipping abroad brings customs, per-country product rules and returns logistics we are not equipped to handle at this size.`,
  },
] as const;

export const NAV = [
  { href: "/#problem", label: "Why active cooling" },
  { href: "/#build", label: "Build" },
  { href: "/about", label: "About" },
] as const;

/* /investors was removed on 2026-07-29. Its thesis rested on "retrofit
   sidesteps the incumbents entirely", which a competitor selling a patented
   retrofit ventilation frame refutes on the first page of search results, and
   on a defensibility argument that cannot honestly be made before a
   freedom-to-operate opinion exists. Rebuild it after that opinion, naming
   the competitor rather than omitting them.

   /refunds was removed because there is nothing to refund. */

/** Footer-only. Kept out of NAV so legal links don't compete with the product
    nav, but they must stay reachable from every page. */
export const LEGAL_NAV = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  /* /refunds came back on 2026-08-03. The note above says it "was removed
     because there is nothing to refund" — there is now. A site that takes
     payment and hides its cancellation terms is the single most common
     way a preorder turns into a chargeback. */
  { href: "/refunds", label: "Refunds" },
] as const;

/* ---------------- team ---------------- */

/** The people who build ErgoFlo.

    NO ROLES, NO TITLES, NO OWNERSHIP — deliberate, 2026-07-29.
    Both are minors and no business entity exists, so the site names who
    builds it and asserts nothing about who owns it. Titles like
    "co-founder", "partner", "owner" or "sole proprietor" all imply a
    structure that either does not exist or would create an implied
    general partnership (Cal. Corp. Code §16202) making both personally
    liable. Names only.

    NO_PARTNERSHIP_NOTICE renders wherever this list renders. Never show
    one without the other. Only people who actually contribute go here. */
export const TEAM = ["Lucas Nam", "Edison Hsu"] as const;


/* "named on this site", NOT "listed above" — this string renders on /terms,
   where no team list precedes it, and a dangling cross-reference in a legal
   notice is exactly the kind of sloppiness that undermines the clause it is
   trying to make. Keep it position-independent. */
export const NO_PARTNERSHIP_NOTICE = `${BRAND} is a student project, not a company, and no business entity has been formed. The people named on this site are students working on a design together. Nothing on this site creates a partnership, joint venture, agency relationship, or any ownership interest, and no one named here has authority to enter into obligations on anyone else's behalf.`;

/* ---------------- third-party marks ---------------- */

/** Competitors are named in the FAQ and on /about. Naming them is nominative
    fair use and is fine; the risk is comparative claims stated as absolutes,
    which a named competitor has standing to sue over under Lanham Act §43(a).
    Every claim about their products is attributed to their own published
    materials, and this notice disclaims affiliation.

    Vaucluse is listed because they are a direct competitor with a granted
    patent — see the commerce note at the top of this file. Say only what
    their own product page says: that their frame is passive. */
/* Interpolates BRAND rather than hardcoding it — this string used to spell the
   brand name out, which meant the 2026-07-30 rename could have left the
   trademark disclaimer disclaiming affiliation on behalf of a name the site no
   longer uses. Keep it a template literal. */
export const TRADEMARK_NOTICE =
  `Osprey, AntiGravity, Deuter, Aircomfort, Gregory, FreeFloat, Vaucluse and Kuchofuku are trademarks of their respective owners. ${BRAND} is not affiliated with, endorsed by, or sponsored by any of them. They are named only to describe the current state of the category, and all statements about their products reflect those companies' own published descriptions.`;
