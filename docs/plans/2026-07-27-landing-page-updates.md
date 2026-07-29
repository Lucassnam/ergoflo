# Plan: ErgoFlow landing page — batch of small changes

Date: 2026-07-27
Status: awaiting approval

## 1. Restated request

1. Add a small arrow under "Scroll to explore" in the hero.
2. Temp stat: keep the number at 25°F, reword the label to explicitly say
   "Feels 25°F cooler" (confirmed with user — no number change).
3. Battery stat: change from **46 hrs** to **9–12 hrs** everywhere it appears
   on the site (this is a real, larger content change — 8 files reference
   "46 hours").
4. Noise stat stays 26 dB.
5. Make the three hero stat cards "light up" (glow) as they scroll into
   view, each in a distinct color: temperature → blue, battery/endurance →
   red, noise → the site's existing cyan accent.
6. Numbers should count up on scroll — **already implemented** via
   `components/CountUp.tsx`, already wired to all three hero stats. No work
   needed here beyond keeping it working with the new battery range.
7. Remove the "Spec sheet" section from the homepage; move it to a new
   `/specs` page. Update nav to point there.
8. Pricing section content is good, leave the three tiers as-is. Make the
   "Notify me" button on the two "coming soon" tiers actually work: link to
   a new `/notify` page with a real email form.
9. Build a Supabase backend (via Supabase CLI) solely to store `/notify`
   signups — no other data.
10. Reserve/ship promise: change from "Shipping before August 8" to Q4 2026.
11. New persona section: full-bleed cinematic photo that crossfades between
    three audiences as you scroll — Hikers, Students, Commuters — each
    labeled, using three Unsplash photos (URLs resolved and confirmed
    below).
12. Liquid-glass effects and smooth transitions on the new/touched UI
    (site already has a `glass` utility in `globals.css` — extend/reuse it
    rather than inventing a parallel system).

## 2. Resolved ambiguities (confirmed with user)

- **Temp stat**: number stays 25, wording changes only.
- **Persona photos** (Unsplash page URLs → resolved direct CDN URLs via
  fetch of each page's `og:image`):
  - Hikers — `https://images.unsplash.com/photo-1501555088652-021faa106b9b` (replaced
    the original Moro Rock link after it turned out to be an Unsplash+ photo that
    renders with a tiled watermark when hotlinked — confirmed via screenshot; user
    supplied this replacement)
  - Students — `https://images.unsplash.com/photo-1663162551013-8bb8ab151e11`
  - Commuters — `https://images.unsplash.com/photo-1487432197009-7b4c905fb127`
- **Supabase**: user has an existing project. Waiting on the project URL +
  anon/public key (safe to share — protected by RLS insert-only policy) to
  drop into `.env.local`. CLI (`npx supabase`, v2.110.0, confirmed working,
  not logged in) will be used to scaffold the migration; applying it to the
  live project happens either via `supabase login && supabase link && supabase
  db push` (user completes the interactive login step) or by the user
  pasting the generated SQL into the Supabase dashboard's SQL editor —
  whichever is faster for them.

## 3. Current architecture (relevant files)

- `lib/site.ts` — single source of truth for copy/numbers (`HERO_STATS`,
  `SPECS`, `FAQ`, `SHIP_WINDOW`, `NAV`, `PRICING`). This is where the
  46→9-12 hr and ship-window edits are centralized.
- `app/page.tsx` — homepage sections in order, server component. Imports
  `CountUp`, `Reveal`, `ExplodedDiagram`, `Faq`, `PricingSection`.
- `components/CountUp.tsx` — client component, counts 0→`to` once in view.
  Already used for all three hero stats.
- `components/ui/scroll-morph-hero.tsx` — hero. Owns the "Scroll to
  explore" text (line ~333).
- `components/PricingSection.tsx` — "Notify me" button currently
  `disabled`, does nothing (line ~141-154).
- `components/ReserveButton.tsx` — pattern to follow for the Stripe-style
  "not wired up yet" guard; `STRIPE_LINK`/`CONTACT_EMAIL` in `lib/site.ts`
  are the existing "swap before launch" precedent I'll follow for Supabase
  env vars.
- `app/globals.css` — `@theme` tokens + `@utility glass` already defines a
  frosted-glass surface (used on header). Will extend, not replace.
- `app/{about,investors}/page.tsx`, `app/layout.tsx`,
  `components/ExplodedDiagram.tsx` — each has an independent "46 hour(s)"
  string to update for consistency.

### Files confirmed NOT currently rendered anywhere (dead code)

`components/ComparisonSlider.tsx`, `components/FanModes.tsx`,
`components/HorizonHero.tsx` are not imported by any `app/**/page.tsx`
(grep-confirmed). They also say "46 hours" but since they're unused and out
of scope for this request, **leaving them untouched** rather than editing
dead code the user didn't ask about.

## 4. Proposed changes

### Copy / data (`lib/site.ts`)
- `HERO_STATS[0]` (temp): reword label/note to lead with "Feels 25°F
  cooler"; add an `accent: "blue"` field.
- `HERO_STATS[1]` (battery): `value: 46` → represent as a range. CountUp
  takes one number, so: `value: 12, prefix: "9–", suffix: " hrs"` — counts
  0→12 while the "9–" prefix sits static, ending on "9–12 hrs". Add
  `accent: "red"`.
- `HERO_STATS[2]` (noise): add `accent: "cyan"` (matches existing brand
  accent, no new color invented).
- `SPECS` "Runtime" row → "9–12 hrs per charge".
- `SHIP_WINDOW` → "Reserve now — ships Q4 2026".
- `FAQ`: "Can I charge it while wearing it?" answer's "46 hours" → "9–12
  hours".
- `NAV`: "Specs" entry `/#specs` → `/specs`.

### New Supabase-backed notify flow
- `lib/supabase.ts` — thin client using `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env, following the existing
  "swap before launch" pattern (guarded, not silently broken if unset).
- `supabase/migrations/<timestamp>_notify_signups.sql` — creates
  `notify_signups (id uuid pk default gen_random_uuid(), email text not
  null, product text, created_at timestamptz default now())`, RLS enabled,
  one policy: anon role may `INSERT` only (no select/update/delete from the
  client). Generated via `npx supabase migration new`.
- `app/notify/page.tsx` — email capture form (client component), success/
  error states, glass-styled card matching site aesthetic.
- `app/api/notify/route.ts` — POST handler, validates email server-side,
  inserts via the Supabase client using the anon key (RLS-safe since insert-
  only).
- `.env.local` — real project URL + anon key (from user) so it's testable
  in dev; `.env.local.example` committed with blank placeholders.
- `components/PricingSection.tsx` — "Notify me" buttons on the two
  "coming-soon" tiers become real links to `/notify?product=<tier>`,
  no longer `disabled`.
- `package.json` — add `@supabase/supabase-js`.

### Specs page split
- `app/specs/page.tsx` — new page rendering the `SPECS` table (moved out
  of `app/page.tsx`), same visual treatment as today.
- `app/page.tsx` — remove the `id="specs"` section (~lines 109-138).

### Hero stat "light up" + arrow
- `components/StatCard.tsx` (new, client) — wraps `CountUp`, adds
  `useInView`, and transitions in a colored glow (border + text color) keyed
  off `accent`, once, on first scroll into view. Reuses the `glass` /
  `rim` utility conventions already in `globals.css`; no new animation
  library.
- `app/page.tsx` — swap the inline stat card markup for `<StatCard stat={s}
  />`.
- `components/ui/scroll-morph-hero.tsx` — add a small bouncing chevron SVG
  under the existing "Scroll to explore" text, respecting
  `useReducedMotion` (already imported in this file's motion usage
  patterns elsewhere on site).

### Persona showcase (new section)
- `components/PersonaShowcase.tsx` (new, client) — sticky full-bleed image
  section, same scroll-progress mechanic as `ExplodedDiagram.tsx`
  (`useScroll` + `useTransform` over a tall wrapper), crossfading between
  the 3 resolved Unsplash images with a glass-panel label ("Hikers" /
  "Students" / "Commuters") that fades per segment.
- `app/page.tsx` — insert the new section (proposed placement: after the
  "Exploded view" section, before "Specs" removal / before Pricing —
  final call at execution time, cosmetic).

### Liquid glass / transitions
- No new CSS system. Reuse `@utility glass` from `globals.css` on: the
  persona label panel, the `/notify` form card, and (if it reads better)
  the lit stat cards. Add `transition-colors`/`transition-shadow` utility
  classes consistently on anything newly interactive.

## 5. Do-not-touch list

- `ReserveButton.tsx` / Stripe checkout flow — untouched.
- Auth — none exists on this site; not introducing any for `/notify` (public
  insert-only form, rate-limiting/spam handling explicitly out of scope
  unless asked).
- `ComparisonSlider.tsx`, `FanModes.tsx`, `HorizonHero.tsx` — dead code,
  left as-is (see §3).
- `PricingSection.tsx` tier prices/features/"Spring 2027" dates — untouched,
  only the "Notify me" button becomes functional.
- `.env.local` — will contain a real (but RLS-scoped, insert-only) anon key;
  confirmed already gitignored via `.env*` in `.gitignore`.

## 6. Risks / unknowns

- Battery range "9–12 hrs" as `prefix: "9–", value: 12` will visually count
  "9–0 → 9–12" during the animation — reads fine mid-count, confirmed
  intent is cosmetic only, no functional risk.
- Supabase requires the user's real project URL + anon key before the
  `/notify` flow can be verified end-to-end; until provided, `.env.local`
  ships with a "not configured" guard (mirrors the existing `isStripeLive`
  pattern) so the build doesn't break, and the API route returns a clear
  error rather than crashing.
- Applying the SQL migration to the live Supabase project needs either the
  user's CLI login or a manual dashboard paste — cannot be fully automated
  from here without their credentials.

## 7. Verification plan

- `npm run build` — real output, check for `BUILD SUCCEEDED`/errors, not a
  piped/truncated log.
- `npm run lint`.
- Manual dev-server check (`npm run dev`) of: hero arrow + count-up + glow
  colors, `/specs` page renders full spec table and homepage no longer
  does, `/notify` form submits and a row appears in `notify_signups`
  (only if Supabase creds are supplied), pricing "Notify me" buttons
  navigate correctly, persona section crossfades on scroll, nav "Specs"
  link goes to `/specs`.
- Grep sweep for stray "46 hour" strings after edits to confirm none were
  missed in the files listed in §3/§4.
