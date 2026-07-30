# ErgoFlo — Custom Asset Shot List

**Date:** 2026-07-24
**For:** white-product / white-site redesign + scroll-driven exploded view
**Status:** spec only — nothing built yet, pending approval

---

## 0. The one rule that governs everything

Every layer of the exploded view must be produced from a **single, locked
camera position** — same lens, same distance, same angle, same lighting,
nothing moved between captures.

Why: the scroll animation works by stacking transparent layers on top of each
other and sliding them apart. At scroll progress `0` the layers must land
back on top of each other and read as one assembled product. If each part is
shot separately and centred in its own frame, they will never line up, and no
amount of CSS can fix it.

This is the mistake that kills 90% of DIY exploded-view attempts. Everything
in section 2 exists to prevent it.

---

## 1. Which production path

Two ways to make the explode layers. Pick one — do not mix.

### Path A — CAD renders (recommended)

You are building a PETG perimeter, TPU rails and a printed fan deck, so a CAD
model almost certainly exists. If it does, render the layers. This is
strictly better than photography:

- Camera position is exact and repeatable by definition
- Transparent background comes free — no cutout work
- White-on-white is a lighting choice, not a fight
- Re-rendering after a design revision costs minutes, not a reshoot
- You can render the *intended production finish*, not the 3D-print layer
  lines on the current prototype

**Deliverable per layer:** PNG with alpha, orthographic or long-lens
perspective, identical canvas dimensions across all layers.

### Path B — Photography (only if there is no CAD)

Shoot a **progressive disassembly**, not individual parts:

1. Mount the fully assembled panel. Lock the tripod. Tape the tripod feet to
   the floor. Do not touch focus, zoom, aperture or lights again.
2. Frame 1: complete assembly.
3. Remove the top layer (spacer mesh). Shoot frame 2. **Camera does not move.**
4. Remove the next layer. Shoot frame 3. Repeat down to the bare backing plate.
5. In post, cut each part out of the frame in which it is the topmost visible
   element. Because the camera never moved, the cutouts align perfectly when
   restacked.

Shoot tethered so you can confirm alignment on a big screen before you break
the set down. Breaking the set and discovering a misalignment means starting
over.

---

## 2. Explode layers — the core asset

Five layers, back of the pack to your spine. Adjust the count only if the real
build differs; the list below must match the physical product.

| # | Layer | What must be visible | Notes |
|---|---|---|---|
| 1 | Pack-side backing plate | Full outer face, mounting points | Sits furthest from the viewer at rest |
| 2 | Rigid PETG perimeter | Full frame outline, corner radii | The structural ring |
| 3 | Fan deck | **Both** fans, battery, USB-C port, controller | The hero layer — do not let the perimeter crop it |
| 4 | Twin TPU tension rails | Both rails, full length | Confirm where these actually sit in the stack |
| 5 | 3D spacer mesh | Weave texture readable, 5mm loft edge visible | Touches your back; frontmost at rest |

**Specs — identical for all five:**

| Property | Value |
|---|---|
| Format | PNG with alpha (source), delivered as WebP/AVIF with alpha |
| Canvas | 2400 × 1800 px, 4:3 — same for every layer, no exceptions |
| Background | Fully transparent. Not white. Transparent. |
| Angle | Shallow 3/4 from above, ~20–25° tilt. Enough to read as a solid object, flat enough that layers stay legible when spread |
| Lighting | One large soft key from upper-left, subtle fill. Consistent across all five |
| Shadow | **Bake no shadow into the layer PNGs.** One separate contact-shadow asset (section 3) |
| Colour | Product white ~#F4F4F2. Keep it slightly off pure white so it separates from the page |
| Target weight | ≤ 250 KB each after conversion |

**White-on-white warning:** a white product on a white page disappears
without form shading. Do not solve this by adding a background gradient — you
asked for none, and it would look cheap. Solve it in the lighting: a soft
directional key gives the product self-shading, so its own form does the
separating. Get this wrong at capture time and it cannot be fixed in CSS.

---

## 3. Supporting assets

Ordered by how much each one does for the page.

### 3.1 Contact shadow — 1 asset · required
Soft elliptical shadow under the assembled product, transparent PNG, same
2400 × 1800 canvas. Kept separate so it can stay put while the layers spread —
a shadow that flies apart with the parts looks broken.

### 3.2 Hero product — 1 asset · required
The assembled panel, 3/4 view, same locked setup. Can simply be layers 1–5
composited, which costs nothing extra and guarantees it matches the explode.

### 3.3 In-context on a real pack — 2 assets · required
This is the single highest-value shot on the site, because the whole product
claim is "retrofits the pack you already own." Without it, the claim is words.

- **3.3a** Panel installed in an ordinary backpack, back panel facing camera,
  pack standing upright. Neutral pack, no visible competitor branding.
- **3.3b** Same pack, same angle, panel removed. Gives you a genuine
  before/after — far stronger than the current shirt grid alone.

Plain white or light grey sweep. Same lighting family as the product shots.

### 3.4 Worn, back view — 1 asset · required
A person wearing the pack, shot from behind, panel visible against their back.
Establishes scale and that it is a real wearable object. Plain background,
neutral shirt. This is the shot that makes the product feel real rather than
rendered.

### 3.5 Detail macros — 4 assets · recommended
Close, shallow depth of field, one per part card:

- Fan hub and blade edge
- Spacer mesh weave, raking light to show the 5mm loft
- TPU rail flexing
- USB-C port

### 3.6 Fans running — 1 video · recommended
3–5 seconds, locked off, tight on the fan deck, fans spinning at speed.
Silent, autoplay, loop, muted, `playsInline`. 1920 × 1080, H.264 + WebM,
under 2 MB.

This is your proof-of-life asset. A still cannot show that it moves air; five
seconds of spinning fans does. Worth more than any of the macros.

### 3.7 Airflow demonstration — 1 video · optional but the strongest possible proof
Panel running, with visible airflow — a light ribbon, tell-tale, or theatrical
haze lifting off the mesh. Shot against a dark background so the airflow
reads, then placed in the one dark section of the page if the design keeps one.

Hard to shoot well. Skip it rather than ship a weak version.

---

## 4. What you already have

| Asset | Verdict |
|---|---|
| `public/demo/dry.png` | Keep the concept — but re-encode, see below |
| `public/demo/sweaty.png` | Keep the concept — but re-encode, see below |
| `sweatyback.png` (repo root) | Byte-identical duplicate of `sweaty.png` (sha256 `61270d31…`), 1.6 MB, referenced by no code. Delete |
| `ChatGPT Image Jul 24 …png` (repo root) | Byte-identical duplicate of `dry.png` (sha256 `af14364b…`), 1.9 MB, referenced by no code. Delete |
| `truss-preorder_1.html` (repo root) | Stray file, referenced by no code. Delete |

**Re-encode the two demo images.** They are 1.9 MB and 1.6 MB PNGs of
photographic content, and both are marked `priority` in `ComparisonSlider`,
so 3.5 MB blocks the first meaningful paint. As WebP at quality 82 they
should land near 200 KB each. This is the largest single performance problem
on the site today and it is unrelated to the redesign — worth fixing either
way.

The shirt grid stays, but it stops being the site's only real imagery — right
now it is carrying the entire page alone, which is why it feels thin.

---

## 5. Total count

| Category | Photos / renders | Videos |
|---|---|---|
| Explode layers | 5 | — |
| Contact shadow | 1 | — |
| Hero (composite) | 1 | — |
| In-context on pack | 2 | — |
| Worn, back view | 1 | — |
| Detail macros | 4 | — |
| Fans running | — | 1 |
| Airflow demo (optional) | — | 1 |
| **Total** | **14** | **1–2** |

**Minimum viable set to build the redesign:** the 5 explode layers + contact
shadow + the 2 in-context shots = **8 assets.** Everything else improves the
page; those 8 are the ones that block it.

---

## 6. Delivery

Drop files into `public/product/` using these exact names, so the code can be
written before the assets land:

```
public/product/
  layer-1-backing.png
  layer-2-perimeter.png
  layer-3-fandeck.png
  layer-4-rails.png
  layer-5-mesh.png
  shadow.png
  hero.png
  pack-installed.jpg
  pack-bare.jpg
  worn-back.jpg
  detail-fan.jpg
  detail-mesh.jpg
  detail-rail.jpg
  detail-usbc.jpg
  fans-running.mp4
  fans-running.webm
```

I can build the explode component against numbered placeholder layers first,
so the scroll choreography is finished and tuned by the time real assets
arrive. Dropping the finals in then becomes a filename swap.

---

## 7. Open questions

1. **Does a CAD model exist?** Decides Path A vs Path B, and it is the single
   biggest cost difference in this document.
2. **Does a working physical prototype exist?** Required for 3.3, 3.4 and 3.6.
   If not, those four assets cannot be produced yet and the page ships without
   its strongest proof.
3. **Where do the TPU rails actually sit** in the stack — inside the perimeter,
   or spanning across the mesh? Determines layer order and spread direction.
