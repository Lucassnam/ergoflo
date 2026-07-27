/* ============================================================
   SITE CONFIG — single source of truth.

   THINGS TO SWAP BEFORE LAUNCH (all in this block):
     1. STRIPE_LINK  — paste the real Stripe Payment Link URL.
     2. CONTACT_EMAIL— point at a real inbox.
   Nothing else in the codebase hardcodes these.

   BRAND is settled: one word, capital E, capital F — "ErgoFlow".
   ============================================================ */

export const BRAND = "ErgoFlow";

export const STRIPE_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_PAYMENT_LINK";

export const CONTACT_EMAIL = "hello@ergoflow.com";

export const isStripeLive = !STRIPE_LINK.includes("REPLACE_WITH");

/* ---------------- product ---------------- */

export const TAGLINE = "Active cooling for the pack you already own.";

export const SHIP_WINDOW = "Shipping before August 8";

export const PRICING = {
  deposit: 15,
  total: 40,
  atShipping: 25,
} as const;

/** Hard cap on the first production run. Stated as a limit, never as a
    live "N left" counter — there is no backend to make that number true. */
export const PREORDER_LIMIT = 100;

/** Hero stats. `value` is numeric so it can be counted up; `suffix` is rendered after. */
export const HERO_STATS = [
  {
    value: 25,
    prefix: "",
    suffix: "°F",
    label: "Cooler against your back",
    note: "Perceived temperature drop at the panel",
  },
  {
    value: 46,
    prefix: "",
    suffix: " hrs",
    label: "Runtime per charge",
    note: "A full commute week and then some",
  },
  {
    value: 26,
    prefix: "",
    suffix: " dB",
    label: "Noise at the shoulder",
    note: "Quieter than a library",
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

export const SPECS = [
  ["Frame material", "PETG perimeter, TPU rails"],
  ["Panel material", "3D spacer mesh, 5mm loft"],
  ["Fan", "Single brushless, PWM speed control"],
  ["Battery", "2000mAh Li-ion, USB-C"],
  ["Runtime", "Up to 46 hrs per charge"],
  ["Noise", "26 dB, near silent"],
  ["Weight added", "168 g"],
  ["Water resistance", "IPX4, splash resistant"],
  ["Fits", "Most packs 15–45L with a suspended back panel"],
] as const;

export const FAQ = [
  {
    q: "What does the deposit actually pay for?",
    a: `It reserves your unit in the production queue at today’s price and covers early tooling costs. It’s non-refundable once production is underway. We’ll only refund it if we’re unable to get the product off the ground.`,
  },
  {
    q: "When does the rest of the payment happen?",
    a: `We email you when your batch is ready to ship. The remaining $${PRICING.atShipping} is charged then, not before, with advance notice, not a surprise.`,
  },
  {
    q: "Does this fit my existing backpack?",
    a: `${BRAND} retrofits into packs with a suspended mesh back panel, 15–45L. If your pack has a solid, non-suspended back, check the compatibility guide before ordering.`,
  },
  {
    q: "How loud is it, really?",
    a: "26 dB at the shoulder. That’s below the ambient noise of most offices and well under a moving train or a busy street. In practice you stop noticing it within a block.",
  },
  {
    q: "Can I charge it while wearing it?",
    a: "Yes. USB-C in, and it runs off the cable directly, so a power bank in your pack turns 46 hours into as long as you like.",
  },
  {
    q: "What happens if it rains?",
    a: "IPX4 means splash resistant from any direction: rain, sweat, a dropped water bottle. It is not rated for submersion, so don’t take it swimming.",
  },
] as const;

export const NAV = [
  { href: "/#problem", label: "Why active cooling" },
  { href: "/#build", label: "Build" },
  { href: "/#specs", label: "Specs" },
  { href: "/about", label: "About" },
  { href: "/investors", label: "Investors" },
] as const;
