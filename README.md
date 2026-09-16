# Gustvane

[![CI](https://github.com/Lucassnam/ergoflo/actions/workflows/ci.yml/badge.svg)](https://github.com/Lucassnam/ergoflo/actions/workflows/ci.yml)

Marketing site for Gustvane, an active cooling back panel that retrofits into a
backpack you already own. Two blower fans and a tensioned spacer mesh panel, so
air moves across your back instead of sitting against it.

**[gustvane.com](https://gustvane.com)**

![The Gustvane landing page](docs/screenshot.png)

## Commerce state, read this before changing anything

The buy controls on this site are driven by one constant. Check it rather than
assuming:

```ts
// lib/site.ts
export const STRIPE_LINK: string = "https://buy.stripe.com/..."
export const PREORDERS_ENABLED = STRIPE_LINK !== ""
export const PRICE_CENTS = 4999
```

`PREORDERS_ENABLED` derives from `STRIPE_LINK` automatically. While
`STRIPE_LINK` is non empty, preorders are live and the site takes real money at
the price in `PRICE_CENTS`. Emptying `STRIPE_LINK` turns every buy control back
into a waitlist CTA and makes `/api/checkout` refuse to create a session.

There are two independent payment paths in this repo. The Stripe payment link
above is the one that is wired up. The checkout API plus Supabase path exists
but sits behind its own disabled flag. The webhook serves both.

`lib/site.ts` carries long comment blocks explaining each of these decisions.
Read them before editing; they are there because these switches move real money.

## Product disclosure

The design targets published on the site, 168 g, four to six hours of runtime
and 26 dB, are targets. They are not measured results, no cell has been chosen
and there is no test report. The About page states this plainly and the
preorder terms spell out what a buyer is actually agreeing to. Keep that
disclosure intact in any copy change.

## Stack

Next.js 16 with the App Router and `output: export`, React, TypeScript,
Tailwind CSS v4, Motion for the scroll animations, Supabase for the waitlist,
Resend for transactional email, and Cloudflare Pages for hosting.

Because the site is a static export, `next start` will not serve it. Build and
serve the `out/` directory instead.

## Running it locally

```bash
nvm use            # .nvmrc pins Node 22
npm ci
npm run dev
```

To check the production output:

```bash
npm run build
npx serve out
```

Copy `.env.local.example` to `.env.local` and fill in the Supabase, Stripe and
Resend values. The Stripe webhook needs `STRIPE_WEBHOOK_SECRET` set, or order
confirmation email will not fire and orders have to be backfilled by hand.

## Checks

```bash
npm run lint
npm run build
```

Both run on every push through GitHub Actions.
