import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import CountUp from "@/components/CountUp";
import ExplodedDiagram from "@/components/ExplodedDiagram";
import FanModes from "@/components/FanModes";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import ReserveButton from "@/components/ReserveButton";
import PricingSection from "@/components/PricingSection";
import {
  BRAND,
  FAQ,
  HERO_STATS,
  PARTS,
  PRICING,
  SHIP_WINDOW,
  SPECS,
  TAGLINE,
} from "@/lib/site";

/* JSON-LD so the product and FAQ are machine-readable. */
function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: BRAND,
        description: TAGLINE,
        brand: { "@type": "Brand", name: BRAND },
        offers: {
          "@type": "Offer",
          price: PRICING.total,
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />

      {/* ============ HERO ============ */}
      <ScrollMorphHero />

      {/* ============ STATS ============ */}
      <section id="problem" className="relative scroll-mt-24 bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              The performance
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Engineered for active cooling.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-[17px] leading-relaxed text-neutral-600">
              Two brushless fans move air on purpose. Passive panels don&rsquo;t cut it.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="flex h-full flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-10 transition-colors hover:border-neutral-300 sm:p-12">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <CountUp
                    to={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    className="headline text-[clamp(2.75rem,5vw,3.75rem)] text-black"
                  />
                  <p className="mt-1 text-[16px] font-medium text-neutral-900">
                    {s.label}
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-500">
                    {s.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPLODED VIEW ============ */}
      <section className="bg-white">
        <ExplodedDiagram />
      </section>

      {/* ============ BUILD ============ */}
      <section id="build" className="relative scroll-mt-24 px-5 py-24 sm:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              How it&rsquo;s built
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Four parts. Each one earns its place.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-[17px] leading-relaxed text-neutral-600">
              No part on {BRAND} is decorative. The frame is the vent. The rails
              are the suspension.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PARTS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-9 transition-colors hover:border-neutral-300">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-neutral-400">
                    {p.num}
                  </p>
                  <h3 className="headline mt-4 text-[20px] text-black">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-600">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mx-auto mt-16 max-w-2xl">
              <FanModes />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SPECS ============ */}
      <section id="specs" className="relative scroll-mt-24 px-5 py-24 sm:px-8 bg-white">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              Spec sheet
            </p>
            <h2 className="mt-4 text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Everything, on the record.
            </h2>
          </Reveal>

          <div className="mt-12">
            {SPECS.map(([k, v], i) => (
              <Reveal key={k} delay={Math.min(i * 0.04, 0.24)}>
                <div>
                  <div className="h-px w-full bg-neutral-200" />
                  <div className="flex items-baseline justify-between gap-6 py-4">
                    <span className="text-[14.5px] text-neutral-600">{k}</span>
                    <span className="text-right font-mono text-[14px] text-black">
                      {v}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="h-px w-full bg-neutral-200" />
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <PricingSection />

      {/* ============ PREORDER ============ */}
      <section
        id="reserve"
        className="relative scroll-mt-24 overflow-hidden px-5 py-24 sm:px-8 bg-white"
      >
        <div className="relative z-10 mx-auto max-w-xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              Preorder
            </p>
            <h2 className="mt-4 text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Reserve now, pay later.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-center text-[16px] leading-relaxed text-neutral-600">
              A small deposit holds your spot. The balance isn&rsquo;t charged
              until your unit is ready to ship.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-12 rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm">
              <span className="absolute -top-3 left-8 rounded-full bg-black px-3.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                Early bird
              </span>

              <p className="font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                General preorder
              </p>
              <p className="mt-4 flex items-baseline gap-2.5">
                <span className="font-mono text-[54px] leading-none font-semibold tracking-[-0.03em] text-black">
                  ${PRICING.deposit}
                </span>
                <span className="text-[15px] text-neutral-600">deposit</span>
              </p>
              <p className="mt-3 text-[13.5px] text-neutral-500">
                ${PRICING.total} total · ${PRICING.atShipping} due at shipping
              </p>

              <ul className="mt-8 mb-8 list-none space-y-0 p-0">
                {[
                  SHIP_WINDOW,
                  "Production starts as soon as preorders come in",
                  "Refunded only if production doesn’t move forward",
                ].map((line) => (
                  <li key={line} className="py-3.5 text-[14.5px] text-neutral-600">
                    <div className="mb-3.5 h-px w-full bg-neutral-200" />
                    {line}
                  </li>
                ))}
              </ul>

              <ReserveButton size="lg" className="w-full">
                Reserve — ${PRICING.deposit} deposit
              </ReserveButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative px-5 py-24 sm:px-8 bg-white">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              FAQ
            </p>
            <h2 className="mt-4 mb-12 text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Before you reserve.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-white px-5 py-28 text-center sm:px-8">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Reveal>
            <h2 className="headline text-[clamp(2rem,5vw,3.4rem)] text-black">
              Walk in. Still dry.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[17px] text-neutral-500">
              {SHIP_WINDOW}. ${PRICING.deposit} holds your place in the first run.
            </p>
            <div className="mt-9 flex justify-center">
              <ReserveButton size="lg">
                Reserve — ${PRICING.deposit} deposit
              </ReserveButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
