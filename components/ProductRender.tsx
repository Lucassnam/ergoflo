import Image from "next/image";
import Reveal from "@/components/Reveal";
import { BRAND, SPECS } from "@/lib/site";

/** The handful of design targets that answer "what is this thing". The /specs
    route was deleted on 2026-07-29 — a full spec table for a product with no
    battery selected reads as a finished product. Do not reintroduce a link to
    it, and keep the "(target)" qualifiers that SPECS carries. */
const HEADLINE_SPECS = SPECS.filter(([k]) =>
  ["Fan", "Battery", "Runtime", "Weight added", "Fits"].includes(k)
);

/**
 * "What it is" section. The render ships on a white background, so it sits
 * directly on the white page with no card or frame around it — any border
 * would only draw a box around empty space.
 *
 * The rendering disclaimer is deliberately stated twice: a badge pinned to
 * the image (unmissable at a glance) and a full sentence under it (says what
 * actually may change). The product does not exist yet, so a viewer
 * must never be able to read the render as a photo of a finished unit.
 */
export default function ProductRender() {
  return (
    <section id="build" className="relative scroll-mt-24 bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ---------- render ---------- */}
        <Reveal className="order-1">
          <figure className="m-0">
            <div className="relative">
              {/* 1024x1024, replacing the previous 968x1624 asset on
                  2026-08-04. The aspect ratio changed from tall-portrait to
                  square — if you swap this image again, update BOTH numbers.
                  Next uses them to reserve layout space, and a stale pair
                  causes a visible reflow on load. */}
              <Image
                src="/product-render.webp"
                alt={`${BRAND} cooling panel, shown at an angle: a curved black ventilated frame with a grid of rectangular cutouts, strap loops along the top edge and an open air channel down the side`}
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) 90vw, 520px"
                priority
                /* The plate behind the part is off-white, which shows as a
                   faint grey rectangle against the page's #FFF. A 2%
                   brightness lift clips it to pure white so it blends into
                   the section; the part itself is near-black and unaffected. */
                className="mx-auto h-auto w-full max-w-[420px] select-none brightness-[1.02] lg:max-w-[520px]"
              />
              <span className="absolute top-0 left-0 rounded-full border border-neutral-300 bg-white/90 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-neutral-600 uppercase backdrop-blur-sm">
                Concept image
              </span>
            </div>

            {/* Badge says "Concept image", NOT "Rendering" — 2026-08-04.
                The asset supplied is an AI-generated visualisation, not
                output from the CAD model and not a photo of a part. On a page
                that now takes $49.99, the label has to be true at the
                strictest reading: "rendering" implies a render OF something
                modelled, and there is no model behind this picture. If a real
                CAD render or a photo of a printed part ever replaces it,
                change this label with the image. */}
            <figcaption className="mx-auto mt-6 max-w-md border-t border-neutral-200 pt-4 text-[13px] leading-relaxed text-neutral-500">
              <strong className="font-semibold text-neutral-700">
                This is a concept image, not a photo.
              </strong>{" "}
              No unit has been built, so nothing like this has been
              photographed. It illustrates the shape we are working toward.
              Colour, finish, hardware and proportions are all still changing,
              and the product you receive will not look exactly like this.
            </figcaption>
          </figure>
        </Reveal>

        {/* ---------- explanation ---------- */}
        <div className="order-2">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              What it is
            </p>
            <h2 className="mt-4 headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              A cooling panel, not another backpack.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-5 text-[17px] leading-relaxed text-neutral-600">
              {/* Explicit {" "}: the JSX transform swallows the space after a
                  leading expression here and renders "ErgoFlois". */}
              {BRAND}{" "}
              is a single part that goes between your back and the pack
              you already own. A rigid PETG frame holds a sheet of 3D spacer
              mesh under tension, so instead of your shirt pressing flat
              against the pack, there is a 5&nbsp;mm channel of open air the
              whole way down your spine.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
              Two PWM-controlled blower fans sit behind the lumbar mount and
              push air through that channel, running off standard AA cells you
              supply yourself. The straps thread through the PETG frame itself,
              which spreads the load across the panel rather than down a
              single line. The targets are 168&nbsp;g added, 4-6 hours per
              charge, and a fit across most 15-45&nbsp;L packs with a
              suspended back panel. None of that has been measured against a
              real pack yet.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <dl className="mt-10 grid grid-cols-1 gap-0 border-t border-neutral-200 sm:grid-cols-2">
              {HEADLINE_SPECS.map(([label, value], i) => (
                <div
                  key={label}
                  className={`border-b border-neutral-200 py-3.5 sm:odd:pr-6 sm:even:pl-6 ${
                    /* An odd count leaves the last row half-width with a
                       stub rule under it — let it span instead. */
                    i === HEADLINE_SPECS.length - 1 && HEADLINE_SPECS.length % 2
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <dt className="font-mono text-[10.5px] tracking-[0.14em] text-neutral-400 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 m-0 text-[14.5px] text-neutral-700">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
