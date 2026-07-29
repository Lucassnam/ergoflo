/* ============================================================
   SITE CONFIG — single source of truth.

   THINGS TO SWAP BEFORE LAUNCH (all in this block):
     1. CONTACT_EMAIL — point at a real inbox.
     2. SITE_URL      — the real launch domain (used by metadataBase,
                        sitemap, robots and OG tags; share cards break
                        without it).
     3. LEGAL_ADDRESS — required in Terms. The site refuses to render it
                        until it is real.
     4. TEAM roles    — the /about team block is gated on these.
   Nothing else in the codebase hardcodes these.

   There is deliberately NO STRIPE_LINK. It was removed on 2026-07-29 —
   see the commerce note below before adding one back.

   BRAND is settled: one word, capital E, capital F — "ErgoFlow".

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

export const BRAND = "ErgoFlow";

export const CONTACT_EMAIL = "hello@ergoflow.com";

/** No trailing slash. Swap before launch — OG/Twitter cards and sitemap depend on it. */
export const SITE_URL = "https://ergoflow.com";

/* ---------------- legal identity ---------------- */

/** Seller of record. ErgoFlow is operated by one person as a sole
    proprietorship — there is no LLC, no corporation, and deliberately no
    claim of one anywhere on the site. */
export const LEGAL_NAME = "Lucas Nam";
export const LEGAL_ENTITY = `${LEGAL_NAME}, sole proprietor, doing business as ${BRAND}`;

/** Physical mailing address. Legally required in Terms and in the footer of
    any marketing email. Left as a placeholder on purpose: `hasLegalAddress`
    is false until it is filled, and the legal pages render a visible gate
    instead of a fake address. */
export const LEGAL_ADDRESS = "REPLACE_WITH_MAILING_ADDRESS";

export const GOVERNING_LAW = "the State of California, United States";

/** Where units ship. Chosen deliberately narrow: US-only keeps GDPR, UK GDPR,
    EU GPSR (which would require a named EU Responsible Person for a battery
    product) and per-destination lithium air-freight rules entirely out of scope. */
export const SHIPS_TO = "the United States only";

export const hasLegalAddress = !LEGAL_ADDRESS.includes("REPLACE_WITH");
export const isSiteUrlLive = !SITE_URL.includes("REPLACE_WITH");

/* ---------------- product ---------------- */

export const TAGLINE = "Active cooling for the pack you already own.";

/* ============================================================
   WAITLIST ONLY — NO COMMERCE. Changed 2026-07-29.

   This site previously took a $15 deposit against a $40 product with a
   Q4 2026 ship window. All of it was removed. Two independent reasons,
   and the second is the one that must not be undone casually:

   1. Consumer law. No payment means no FTC Mail Order Rule ship
      obligation, no refund policy, no chargebacks, and no consumer
      contract for a product that does not exist.

   2. Patent law. 35 U.S.C. §271(a) makes "offers to sell" an act of
      infringement on its own — nothing has to ship. Vaucluse Gear holds
      US 11,779,097 (granted 2023, expires ~2042) covering a modular
      spacer device that creates airflow between a user and a wearable
      bag, attaching via extension loops that a strap passes through.
      ErgoFlow has NOT had a freedom-to-operate opinion. Until it does,
      publishing a definite product at a definite price is itself the
      risky act.

   Note for whoever revisits this: adding a fan is NOT a design-around.
   Under the all-elements rule, practising every element of a claim
   infringes regardless of what else you add. The likely distinction is
   that claim 1 requires the panel gap to be ADJUSTABLE via modular
   supports, and ErgoFlow's 5mm spacer-mesh loft is fixed. That is a
   question for a patent attorney, not for this file.

   DO NOT reintroduce STRIPE_LINK, a price, a deposit, a unit cap, or a
   ship date without that opinion in hand.
   ============================================================ */

/** Deliberately vague. A definite date is a promise; this is a status. */
export const DEV_STAGE = "In development — no unit exists yet";

/** One sentence, used verbatim wherever a target figure is displayed.
    Single constant so the disclosure can never drift between pages. */
export const TARGETS_DISCLAIMER =
  "Figures are engineering targets for a design that has not been built, not measured results. Nothing has been bench-tested or certified, and the final product may differ or may never ship.";

/** Rendered near every waitlist CTA. Both halves are load-bearing: the
    first defeats the consumer expectation of a purchase, the second is
    the §271(a) "offer to sell" disclaimer. */
export const NOT_AN_OFFER_NOTICE =
  "This is a waitlist, not a shop. Nothing here is for sale, no price is being quoted, and joining does not create an order or any obligation on either side. Nothing on this site is an offer to sell.";

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
    note: "Perceived drop at the panel surface — design target, not measured",
    accent: "blue",
  },
  {
    value: 12,
    prefix: "9–",
    suffix: " hrs",
    label: "Target runtime per charge",
    note: "Calculated from cell capacity and fan draw — not yet bench-tested",
    accent: "red",
  },
  {
    value: 26,
    prefix: "",
    suffix: " dB",
    label: "Target noise at the shoulder",
    note: "The design goal the fan is selected against — not measured",
    accent: "cyan",
  },
] as const;

export const PARTS = [
  {
    num: "01",
    title: "Single brushless fan",
    body: "One PWM-controlled fan sits on a rigid mount behind the distributor, so vibration never reaches you.",
  },
  {
    num: "02",
    title: "Open mesh window",
    body: "No rigid backing in the lumbar zone, just tensioned 3D spacer mesh, 5mm loft, that flexes with your spine.",
  },
  {
    num: "03",
    title: "Twin tension rails",
    body: "TPU rails spread load across the panel instead of concentrating it down a single line. The straps become the suspension.",
  },
  {
    num: "04",
    title: "Rigid PETG perimeter",
    body: "A structural frame around the outside holds shape and keeps the mesh under consistent tension, charge after charge.",
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
  ["Frame material", "PETG perimeter, TPU rails (target)"],
  ["Panel material", "3D spacer mesh, 5mm loft (target)"],
  ["Fan", "Single brushless, PWM speed control (target)"],
  ["Battery", "Not yet selected — approx. 2000mAh Li-ion, USB-C"],
  ["Runtime", "9–12 hrs per charge (target)"],
  ["Noise", "26 dB (target)"],
  ["Weight added", "168 g (target)"],
  ["Fits", "Intended for packs 15–45L with a suspended back panel"],
] as const;

/* Answers here are load-bearing legal disclosure, not just copy. The first
   two exist to defeat any reading of this site as a shop, and they must stay
   word-consistent with /terms and with NOT_AN_OFFER_NOTICE above. */
export const FAQ = [
  {
    q: "Can I buy this today?",
    a: `No. ${BRAND} is a design, not a product. No unit exists, no battery cell has been selected, nothing has been tested or certified, and nothing is for sale. This site collects email addresses from people who want to hear about it — that is all it does.`,
  },
  {
    q: "What happens when I join the waitlist?",
    a: "We store your email address and nothing else. If the product reaches a point where it can actually be sold, we email you once to say so. There is no queue position, no reservation, no price held, and no obligation on either side. Reply to that email to be removed at any time.",
  },
  {
    q: "When will it be available? What will it cost?",
    a: "We genuinely don't know, and we would rather say that than invent a date. There is engineering left to finish, a battery cell to select and certify, and open questions about whether we can build it at a price worth paying. Publishing a date and a price we cannot stand behind is how pre-orders turn into disappointed people.",
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
    a: "The design goal is to shrug off rain and sweat — splash resistance, not immersion. We are deliberately not publishing an IP rating, because the product has never been through IP testing, and quoting a rating we have not earned would be a claim we cannot back up.",
  },
  {
    q: "Isn't someone already doing this?",
    a: "Passive versions, yes — and one of them, Vaucluse, is a well-made retrofit ventilation frame you can buy today. It has no fan: it holds a gap open and waits for you to move. That gap is the whole difference. We are trying to build the version that moves air on a still day, when a passive gap does nothing.",
  },
  {
    q: "Where would you ship?",
    a: `${SHIPS_TO.charAt(0).toUpperCase() + SHIPS_TO.slice(1)}, if it ever ships. A lithium cell crossing a border brings transport certification and per-country rules we are not equipped to handle at this size.`,
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
] as const;

/* ---------------- team ---------------- */

/** The people who actually build ErgoFlow.

    LIABILITY NOTE — read before adding anyone here.
    ErgoFlow is a sole proprietorship owned by one person. Publicly presenting
    several people as a "team" on a commercial venture is evidence of an
    implied general partnership (Cal. Corp. Code §16202 — one forms by conduct,
    with no filing). Partners are jointly and severally liable, personally, for
    the whole business, which would spread Lucas's exposure — a lithium-battery
    product and a live patent question — onto people who do not control either.

    The list was cut from four to two on 2026-07-29, because only two people
    do the work. Listing non-contributors was both inaccurate and the strongest
    partnership evidence the site could publish. It cuts the other way too: on
    an implied partnership with no written agreement, partners share profits
    EQUALLY regardless of contribution, so listing someone who does nothing
    hands them an argument for a quarter of the business.

    Three rules, all load-bearing:
      1. NO_PARTNERSHIP_NOTICE renders wherever this list renders. Never show
         one without the other.
      2. Roles describe contribution, never ownership, authority, or an
         officer title. Do not write "co-founder", "partner", "CTO", or
         anything implying a stake or the power to bind the business.
      3. Only people who actually contribute go here. */
export const TEAM = [
  { name: "Lucas Nam", role: "Founder and sole proprietor" },
  { name: "Edison Hsu", role: "REPLACE_WITH_ROLE" },
] as const;

/** False until every contributor role is filled in. The team block refuses to
    render while this is false, so the site cannot ship "REPLACE_WITH_ROLE". */
export const hasTeamRoles = !TEAM.some((m) => m.role.includes("REPLACE_WITH"));

/* "named on this site", NOT "listed above" — this string renders on /terms,
   where no team list precedes it, and a dangling cross-reference in a legal
   notice is exactly the kind of sloppiness that undermines the clause it is
   trying to make. Keep it position-independent. */
export const NO_PARTNERSHIP_NOTICE = `${BRAND} is owned and operated solely by ${LEGAL_NAME} as a sole proprietorship. Any other contributors named on this site are not owners, partners, employees, or agents of the business, hold no stake in it, and have no authority to enter into obligations on its behalf. Nothing on this site creates a partnership, joint venture, or agency relationship between them.`;

/* ---------------- third-party marks ---------------- */

/** Competitors are named in the FAQ and on /about. Naming them is nominative
    fair use and is fine; the risk is comparative claims stated as absolutes,
    which a named competitor has standing to sue over under Lanham Act §43(a).
    Every claim about their products is attributed to their own published
    materials, and this notice disclaims affiliation.

    Vaucluse is listed because they are a direct competitor with a granted
    patent — see the commerce note at the top of this file. Say only what
    their own product page says: that their frame is passive. */
export const TRADEMARK_NOTICE =
  "Osprey, AntiGravity, Deuter, Aircomfort, Gregory, FreeFloat, Vaucluse and Kuchofuku are trademarks of their respective owners. ErgoFlow is not affiliated with, endorsed by, or sponsored by any of them. They are named only to describe the current state of the category, and all statements about their products reflect those companies' own published descriptions.";
