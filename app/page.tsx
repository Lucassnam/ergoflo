import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import StatCard from "@/components/StatCard";
import ExplodedDiagram from "@/components/ExplodedDiagram";
import ProductRender from "@/components/ProductRender";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import WaitlistButton from "@/components/WaitlistButton";
import PricingSection from "@/components/PricingSection";
import { DEV_STAGE, FAQ, HERO_STATS, NOT_AN_OFFER_NOTICE } from "@/lib/site";

/* JSON-LD so the FAQ is machine-readable.

   THE PRODUCT + OFFER NODE WAS DELETED — 2026-07-29. It published
   `schema.org/Offer` with `price: 40` and `availability: PreOrder`: a
   machine-readable, search-indexed offer to sell, for a product that does not
   exist. Under 35 U.S.C. §271(a) an "offer to sell" is an act of patent
   infringement in its own right, and a competitor holds a granted patent in
   this category (see the commerce note in lib/site.ts). Structured data is the
   most quotable possible form of an offer.

   Do not re-add an Offer, an AggregateOffer, a price, or an availability
   value. FAQPage carries no offer semantics and is safe. */
function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
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
              {/* Deliberately not a swipe at passive panels — a competitor
                  sells a good one, and the FAQ says so. States what the active
                  design is meant to do, full stop. */}
              One PWM-controlled brushless fan and a 2000&nbsp;mAh cell, meant
              to move air across your back for the whole commute.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <StatCard stat={s} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPLODED VIEW ============ */}
      <section className="bg-white">
        <ExplodedDiagram />
      </section>

      {/* ============ WHAT IT IS ============ */}
      <ProductRender />

      {/* ============ WHAT WE'RE BUILDING ============ */}
      <PricingSection />

      {/* ============ WAITLIST ============
          Was the preorder block: a $15 deposit, a $40 total, a 100-unit cap
          and a "refunded only if production doesn't move forward" line that
          contradicted the refund policy on two other pages. All of it went on
          2026-07-29 when the site stopped taking money. See lib/site.ts. */}
      <section
        id="waitlist"
        className="relative scroll-mt-24 overflow-hidden px-5 py-24 sm:px-8 bg-white"
      >
        <div className="relative z-10 mx-auto max-w-xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              Waitlist
            </p>
            <h2 className="mt-4 text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              No money. Just tell us you want one.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-center text-[16px] leading-relaxed text-neutral-600">
              {DEV_STAGE}. Leave an email and we&rsquo;ll write to you once
              &mdash; if and when there&rsquo;s something real to sell.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-12 rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm">
              <span className="absolute -top-3 left-8 rounded-full bg-black px-3.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                Not for sale yet
              </span>

              <p className="font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                What joining actually does
              </p>

              <ul className="mt-6 mb-8 list-none space-y-0 p-0">
                {[
                  "We store your email address. Nothing else.",
                  "One email if it becomes a real product.",
                  "No price, no queue position, no obligation either way.",
                  "Reply to that email to be removed at any time.",
                ].map((line) => (
                  <li key={line} className="py-3.5 text-[14.5px] text-neutral-600">
                    <div className="mb-3.5 h-px w-full bg-neutral-200" />
                    {line}
                  </li>
                ))}
              </ul>

              <WaitlistButton size="lg" className="w-full">
                Join the waitlist
              </WaitlistButton>

              <p className="mt-5 text-[12.5px] leading-relaxed text-neutral-400">
                {NOT_AN_OFFER_NOTICE}
              </p>
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
              Before you sign up.
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
              {DEV_STAGE}. If we get there, you&rsquo;ll be the first to know.
            </p>
            <div className="mt-9 flex justify-center">
              <WaitlistButton size="lg">Join the waitlist</WaitlistButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
