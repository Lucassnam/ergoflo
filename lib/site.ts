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

   There is deliberately NO STRIPE_LINK. It was removed on 2026-07-29 —
   see the commerce note below before adding one back.

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

   Neither is a blocker for a waitlist page that sells nothing. Both
   matter before spending money on packaging, a logo, or a federal
   trademark application. Run a knock-out search at tmsearch.uspto.gov
   in Class 018 and 009 before filing anything.
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

/** Rendered in the legal pages so a reader knows exactly what this is. */
export const NOT_A_COMPANY_NOTICE = `${BRAND} is a student business project, not a company. No business entity has been formed, nothing is sold here, and no money is collected. It is run by students and the only information it collects is an email address.`;

export const GOVERNING_LAW = "the State of California, United States";

/** Where units ship. Chosen deliberately narrow: US-only keeps GDPR, UK GDPR,
    EU GPSR (which would require a named EU Responsible Person for a battery
    product) and per-destination lithium air-freight rules entirely out of scope. */
export const SHIPS_TO = "the United States only";

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
      ErgoFlo has NOT had a freedom-to-operate opinion. Until it does,
      publishing a definite product at a definite price is itself the
      risky act.

   Note for whoever revisits this: adding a fan is NOT a design-around.
   Under the all-elements rule, practising every element of a claim
   infringes regardless of what else you add. The likely distinction is
   that claim 1 requires the panel gap to be ADJUSTABLE via modular
   supports, and ErgoFlo's 5mm spacer-mesh loft is fixed. That is a
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
