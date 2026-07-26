# ErgoFlow landing — design & implementation spec

**Date:** 2026-07-24
**Applies to:** `/Users/coolio_999/Desktop/ergoflowlanding`
**Stack:** Next.js 16.2.11 (App Router, Turbopack) · React 19.2.4 · Tailwind v4 · Motion 12.42.2

---

## 1. Design direction

**Pitch-black, rim-lit.** The reference point is defence/industrial hardware
marketing (Anduril-style): a near-black page where objects are defined by the
light catching their edges rather than by drawn boxes.

Three rules follow from that, and they are enforced throughout:

1. **No outlined boxes.** Surfaces are solid or glass. Separation comes from a
   1px *gradient* hairline that reads as a machined edge catching light — the
   `rim` utility — never a flat `border`.
2. **One accent, one direction.** Cyan `#22d3ee` → electric blue `#3b82f6`,
   always running left-to-right or top-left-to-bottom-right. No second hue.
3. **One loud element per screen.** The Reserve button glows. Nothing else does.

### Colour tokens (`app/globals.css`, `@theme`)

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#000000` | page background |
| `--color-surface` | `#08090b` | stat cells |
| `--color-surface-2` | `#0e1014` | cards, glass base |
| `--color-surface-3` | `#14171d` | raised detail |
| `--color-fg` | `#f2f5f8` | primary text |
| `--color-fg-dim` | `#98a2ae` | body copy |
| `--color-fg-faint` | `#5c6672` | captions, legal |
| `--color-cyan` | `#22d3ee` | accent start |
| `--color-blue` | `#3b82f6` | accent end |

### Type

- **Geist Sans** — display and body. Headings at `tracking-[-0.02em]` to
  `-0.03em`; sizes use `clamp()` so nothing needs breakpoint overrides.
- **Geist Mono** — every number, spec value, eyebrow, and label. Monospace is
  the signal that a figure is measured, not marketing.

### Custom utilities

Defined with Tailwind v4's `@utility`:

| Utility | What it does |
|---|---|
| `rim` | gradient hairline via masked pseudo-element; brightest top-left, cyan-tinged bottom-right |
| `glass` | translucent surface + backdrop blur/saturate (sticky header, floating cards) |
| `accent-text` | cyan→blue gradient clipped to text |
| `glow-btn` | the one high-emphasis control; layered cyan/blue shadow, lifts 1px on hover |
| `hairline` | horizontal rule that fades in from both ends with a cyan centre |
| `bloom` | ambient radial pools of light behind hero / CTA sections |

---

## 2. Information architecture

```
/                 hero
                  comparison slider          ← the argument
                  problem + count-up stats
                  exploded diagram           ← scroll-scrubbed, sticky
                  parts grid (4)
                  fan modes (Low / High)
                  spec sheet
                  preorder card
                  FAQ
                  final CTA
/about            thesis · principles · timeline · CTA
/investors        thesis · status · unit model · risks · contact
```

Header is sticky, transparent at rest, `glass` once scrolled past 12px, with a
`hairline` that fades in at the same moment. Nav collapses to a sheet below
`lg`; opening it locks body scroll.

---

## 3. Component notes (and the traps in them)

### `ComparisonSlider.tsx`

The centrepiece. Base layer is `dry.png`; `sweaty.png` sits on top clipped with
`clip-path: inset(0 {100-pct}% 0 0)`, so dragging left "turns the fans on".

Three decisions worth keeping:

- **Pointer math lives on the wrapper, not on an `<input type=range>`.** A
  full-bleed range input seems attractive (free drag + keyboard) but its
  value↔pixel mapping is offset by thumb width. The wrapper computes the exact
  percentage from `getBoundingClientRect()`.
- **The range input is `pointer-events: none`.** It exists only for keyboard and
  assistive tech. *This was a real bug:* while it accepted pointer events, the
  most natural gesture — grabbing the visible handle — hit the input's own
  44px-wide native track and made the wipe jump to an arbitrary value.
- **The drag guard is a ref, not state.** React state updates are async; a fast
  flick delivers `pointermove` before the `dragging` re-render lands, and those
  first moves get silently dropped.

The images are white-background product shots, so the slider sits in a
deliberate light "specimen tray" (`#f3f4f6`) rather than fighting the black
page. Labels are dark chips over that tray and fade out as the divider reaches
their side.

On first view (and only if untouched) the handle nudges 62 → 38 → 50 to signal
that it's draggable. Skipped entirely under reduced motion.

### `ExplodedDiagram.tsx`

Four isometric slabs on a `230vh` section with a `sticky` `h-screen` inner,
scrubbed by `useScroll` with `offset: ["start start", "end end"]` so progress
reaches 1 exactly as the sticky releases.

Two geometry constraints that were learned the hard way:

- **Layers must spread symmetrically** about the centre — `-(index - (n-1)/2) *
  GAP` — not all upward. Lifting only the upper layers walks the whole
  composition off the top of the frame mid-scroll.
- **`GAP` must exceed `2 * RY`.** Below that, an exploded slab still overlaps the
  one beneath it and, because it paints later, covers its detail. This hid one
  of the two fans on the deck layer until `RY` was flattened to 76 and `GAP`
  raised to 140.

The sticky inner needs `pt-16` to clear the fixed header, which otherwise cuts
the eyebrow off.

### `AirflowCanvas.tsx`

Decorative particle field. `aria-hidden`, DPR-capped at 2, paused by
`IntersectionObserver` when off-screen, resized by `ResizeObserver`, and not
started at all under reduced motion.

### `CountUp.tsx` / `Reveal.tsx`

`Reveal` is a fade-up on first view only (`viewport={{ once: true }}`) —
re-animating on scroll-back makes a long page twitchy. Under reduced motion both
render a plain element at the final value, so no content is gated behind motion.

### `FanModes.tsx`

Low/High toggle drives blade spin rate (2.4s → 0.6s), the airflow bar count, and
the strength of the radial bloom. Buttons use `aria-pressed` in a labelled
`role="group"` — not a tablist, since there is no tabpanel.

---

## 4. Accessibility

- Skip link to `#main`, visible on focus.
- Exactly one `<h1>` per route; heading order is sequential.
- Every interactive element exposes a name; the slider's range input carries a
  full descriptive `aria-label`.
- FAQ uses `aria-expanded` / `aria-controls` with labelled regions.
- `:focus-visible` is a 2px cyan ring with offset, globally.
- `prefers-reduced-motion` handled in **both** CSS and JS.
- Decorative SVG/canvas is `aria-hidden`; the exploded diagram carries a
  descriptive `role="img"` label instead.

---

## 5. Verification performed (2026-07-24)

| Check | Result |
|---|---|
| `next build` | exit 0, 3 static routes, no warnings |
| `tsc --noEmit` | clean |
| `eslint .` | exit 0 |
| Content audit (glued text, placeholders, straight quotes, alt text, single h1, meta, link/anchor integrity) | 0 issues across all 3 routes |
| Interaction suite (slider drag + keyboard, FAQ, fan toggle, mobile menu + scroll lock, reduced motion) | 21/21 pass |
| Visual review | desktop 1440×900 and mobile 390×844, all sections |

Verification was driven over the Chrome DevTools Protocol; the harness scripts
live in the session scratchpad, not in the repo.

### Defects found and fixed during verification

1. Exploded layers climbed out of the viewport mid-scrub → symmetric spread.
2. One of the two fans was occluded by the layer above → `GAP > 2·RY`.
3. Section eyebrow clipped by the sticky header → `pt-16` on the sticky inner.
4. Dropped space after `{BRAND}` on `/investors` (SSR emitted
   `ErgoFlow<!-- -->is an…`) → explicit `{" "}`.
5. Range input intercepted pointer events, hijacking handle drags.
6. Drag guard held in state dropped the first `pointermove` of a fast flick.
7. Straight apostrophes/quotes throughout copy → typographic.
8. `#reserve` fallback link was page-relative and dead on `/about` and
   `/investors` → `/#reserve`.
9. Turbopack inferred the wrong workspace root (a stray `~/package-lock.json`)
   → pinned via `turbopack.root`.

---

## 6. Environment gotchas on this machine

- `npm run <script>` resolves node **v18** via `/usr/local/bin/node` and Next 16
  refuses to run. Invoke the binary directly with the nvm node 20 that's on
  `PATH`: `node node_modules/next/dist/bin/next build`. Same for eslint.
- Shell is zsh — use `$pipestatus[1]`, not `${PIPESTATUS[0]}`.
- A stray `~/package-lock.json` and `~/node_modules` shadow project resolution.

---

## 7. Deliberately not built

- Light mode. The design is committed to black.
- Any backend, form, or analytics. Checkout is a hosted Stripe link.
- Product photography. The exploded view is a drawn diagram; swap slots for real
  renders live in `public/renders/`.
- An OG share image. Metadata is wired and will pick one up when it exists.
