# ErgoFlow — landing page

Marketing site and preorder page for ErgoFlow, an active-cooling back panel
that retrofits into a backpack you already own.

Next.js 16 · React 19 · Tailwind CSS v4 · Motion

---

## Read this first

**This is Next.js 16.** APIs, conventions and file structure differ from
earlier versions and from most tutorials online. Before writing code, read
the relevant guide in `node_modules/next/dist/docs/`. See `AGENTS.md`.

**Tailwind v4 has no `tailwind.config.js`.** Theme tokens are declared with
`@theme` directly in `app/globals.css`. Custom utilities use `@utility`.
Don't create a config file — it won't be read.

---

## Setup

Requires **Node 20.9 or newer** (`node -v` to check).

```bash
git clone https://github.com/Lucassnam/ergoflow-landing.git
cd ergoflow-landing
npm install
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build — run before pushing anything non-trivial |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |

---

## Where things live

```
app/
  page.tsx          Home — every section, in order
  about/page.tsx
  investors/page.tsx
  layout.tsx        Fonts, metadata, Header + Footer
  globals.css       Theme tokens (@theme) and custom utilities (@utility)
components/         One file per section or widget
lib/site.ts         ALL copy, pricing, specs, FAQ, nav
docs/               PRD, design spec, asset shot list
public/demo/        Before/after comparison images
```

### `lib/site.ts` is the single source of truth

Copy, pricing, spec-sheet rows, FAQ entries and nav links all live there —
not in the components. **To change wording or numbers, edit `lib/site.ts`,
not the JSX.** Prices in particular appear in six places on the page and are
all derived from the `PRICING` object.

### Components

| File | Role |
|---|---|
| `Header.tsx` | Sticky nav, mobile sheet |
| `ComparisonSlider.tsx` | Drag-to-reveal before/after. Pointer math on the wrapper, hidden `<input type="range">` for keyboard and screen readers |
| `ExplodedDiagram.tsx` | Scroll-driven exploded view. Currently SVG wireframe — **being replaced**, see below |
| `AirflowCanvas.tsx` | Ambient particle field behind the hero — **likely being cut**, see below |
| `FanModes.tsx` | Fan speed mode selector |
| `CountUp.tsx` | Number count-up on scroll into view |
| `Reveal.tsx` | Fade-and-rise wrapper used across sections |
| `ReserveButton.tsx` | CTA — links to `STRIPE_LINK` |
| `Faq.tsx`, `Footer.tsx` | As named |

---

## Conventions

- **Motion respects `prefers-reduced-motion`.** Handled globally in
  `globals.css` and again in JS inside animated components. Keep both when
  adding animation.
- **Animated components need `"use client"`.** Everything else stays a server
  component.
- **No hardcoded copy or prices in JSX.** Import from `lib/site.ts`.
- Run `npm run build` before pushing — type errors surface at build time, not
  in dev.

---

## Current state

Built and working. Two values must be replaced before launch, both at the top
of `lib/site.ts` and flagged in a comment there:

1. `STRIPE_LINK` — still the `REPLACE_WITH_YOUR_PAYMENT_LINK` placeholder, so
   the reserve buttons don't take money yet
2. `CONTACT_EMAIL` — points at a placeholder inbox

### In-flight redesign — read before styling anything

A design direction change is underway. The site is moving from its current
**pitch-black, cyan-glow, gradient** look to a **clean white** one:

- No gradients (`accent-text`, `glow-btn`, `bloom`, `hairline` all go)
- No thin outlined boxes (the `rim` utility goes)
- Flat solid fills; separation from space and tone, not borders
- The wireframe `ExplodedDiagram` gets replaced by a scroll-driven explode
  built from real product layers

`docs/asset-shot-list.md` specifies the photography and video this needs — 14
stills and 1–2 videos, of which 8 block the work. **If you're picking up
styling work, read that doc first**, otherwise you'll polish surfaces that are
about to be deleted.

---

## Workflow

Branch, don't commit to `main`:

```bash
git checkout -b your-name/what-youre-doing
# work
npm run build
git push -u origin your-name/what-youre-doing
```

Then open a pull request on GitHub.
