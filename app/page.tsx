import AirflowCanvas from "@/components/AirflowCanvas";
import ComparisonSlider from "@/components/ComparisonSlider";
import CountUp from "@/components/CountUp";
import ExplodedDiagram from "@/components/ExplodedDiagram";
import FanModes from "@/components/FanModes";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import ReserveButton from "@/components/ReserveButton";
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
      <section className="bloom relative overflow-hidden">
        <AirflowCanvas className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 pt-20 pb-16 text-center sm:px-8 sm:pt-28 sm:pb-24">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] tracking-[0.16em] text-fg-dim uppercase">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-cyan"
                style={{ boxShadow: "0 0 8px 2px rgba(34,211,238,0.8)" }}
              />
              Preorders open · {SHIP_WINDOW}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-[clamp(2.6rem,7.5vw,5.25rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
              Your back stops
              <br />
              <span className="accent-text">sweating.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-fg-dim sm:text-[20px]">
              {TAGLINE} Two brushless fans and a tensioned mesh panel replace the
              foam pad every backpack has shipped with since the 90s.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ReserveButton size="lg">
                Reserve yours — ${PRICING.deposit} deposit
              </ReserveButton>
              <a
                href="#build"
                className="rounded-full px-5 py-4 text-[15px] text-fg-dim transition-colors hover:text-cyan"
              >
                See how it&rsquo;s built →
              </a>
            </div>
            <p className="mt-5 font-mono text-[11.5px] tracking-[0.08em] text-fg-faint">
              ${PRICING.deposit} today · ${PRICING.total} total · $
              {PRICING.atShipping} charged at shipping
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ PROOF / SLIDER ============ */}
      <section className="relative px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <ComparisonSlider />
          </Reveal>
        </div>
      </section>

      {/* ============ PROBLEM + STATS ============ */}
      <section id="problem" className="relative scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              The problem
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-center text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              Foam panels don&rsquo;t move air. They just sit there.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-[17px] leading-relaxed text-fg-dim">
              Every &ldquo;breathable&rdquo; back panel on the market is passive —
              a shaped pad hoping convection does the work while you walk.{" "}
              {BRAND} moves air on purpose.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/[0.07] sm:grid-cols-3">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="flex h-full flex-col items-center gap-2 bg-surface px-6 py-11 text-center">
                  <CountUp
                    to={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    className="font-mono text-[clamp(2.4rem,5vw,3.4rem)] leading-none font-semibold tracking-[-0.03em] accent-text"
                  />
                  <span className="mt-2 text-[15px] font-medium text-fg">
                    {s.label}
                  </span>
                  <span className="text-[13px] text-fg-faint">{s.note}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPLODED VIEW ============ */}
      <ExplodedDiagram />

      {/* ============ BUILD ============ */}
      <section id="build" className="relative scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              How it&rsquo;s built
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-center text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              Four parts. Each one earns its place.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-[17px] leading-relaxed text-fg-dim">
              No part on {BRAND} is decorative. The frame is the vent. The rails
              are the suspension.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PARTS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.07}>
                <div className="rim h-full rounded-2xl bg-surface-2 p-7 transition-transform duration-200 hover:-translate-y-1">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-cyan">
                    {p.num}
                  </p>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-fg-dim">
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
      <section id="specs" className="relative scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              Spec sheet
            </p>
            <h2 className="mt-4 text-center text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              Everything, on the record.
            </h2>
          </Reveal>

          <div className="mt-12">
            {SPECS.map(([k, v], i) => (
              <Reveal key={k} delay={Math.min(i * 0.04, 0.24)}>
                <div>
                  <div className="hairline h-px w-full" />
                  <div className="flex items-baseline justify-between gap-6 py-4.5">
                    <span className="text-[14.5px] text-fg-dim">{k}</span>
                    <span className="text-right font-mono text-[14px] text-fg">
                      {v}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="hairline h-px w-full" />
          </div>
        </div>
      </section>

      {/* ============ PREORDER ============ */}
      <section
        id="reserve"
        className="bloom relative scroll-mt-24 overflow-hidden px-5 py-24 sm:px-8"
      >
        <div className="relative z-10 mx-auto max-w-xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              Preorder
            </p>
            <h2 className="mt-4 text-center text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              Reserve now, pay later.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-center text-[16px] leading-relaxed text-fg-dim">
              A small deposit holds your spot. The balance isn&rsquo;t charged
              until your unit is ready to ship.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rim relative mt-12 rounded-3xl bg-surface-2 p-8 sm:p-10">
              <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-cyan to-blue px-3.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-black uppercase">
                Early bird
              </span>

              <p className="font-mono text-[11px] tracking-[0.16em] text-fg-faint uppercase">
                General preorder
              </p>
              <p className="mt-4 flex items-baseline gap-2.5">
                <span className="font-mono text-[54px] leading-none font-semibold tracking-[-0.03em]">
                  ${PRICING.deposit}
                </span>
                <span className="text-[15px] text-fg-dim">deposit</span>
              </p>
              <p className="mt-3 text-[13.5px] text-fg-faint">
                ${PRICING.total} total · ${PRICING.atShipping} due at shipping
              </p>

              <ul className="mt-8 mb-8 list-none space-y-0 p-0">
                {[
                  SHIP_WINDOW,
                  "Production starts as soon as preorders come in",
                  "Refunded only if production doesn’t move forward",
                ].map((line) => (
                  <li key={line} className="py-3.5 text-[14.5px] text-fg-dim">
                    <div className="hairline mb-3.5 h-px w-full" />
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
      <section className="relative px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              FAQ
            </p>
            <h2 className="mt-4 mb-12 text-center text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              Before you reserve.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bloom relative overflow-hidden px-5 py-28 text-center sm:px-8">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
              Walk in. Still dry.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[17px] text-fg-dim">
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
