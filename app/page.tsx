import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import StatCard from "@/components/StatCard";
import ExplodedDiagram from "@/components/ExplodedDiagram";
import ProductRender from "@/components/ProductRender";
import StudentCarry from "@/components/StudentCarry";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import PreorderButton from "@/components/PreorderButton";
import PricingSection from "@/components/PricingSection";
import EarlyBirdBadge from "@/components/EarlyBirdBadge";
import Link from "next/link";
import {
  DEV_STAGE,
  FAQ,
  HERO_STATS,
  LEAD_TIME_DAYS,
  formatPrice,
} from "@/lib/site";

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
              The targets
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              Three numbers we design against.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-[17px] leading-relaxed text-neutral-600">
              {/* Deliberately not a swipe at passive panels — a competitor
                  sells a good one, and the FAQ says so. States what the active
                  design is meant to do, full stop. */}
              Two PWM-controlled blower fans running on AA batteries, meant
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

      {/* ============ WHO IT'S FOR ============
          Sits AFTER ProductRender deliberately. The reader meets the actual
          part, and its "no unit has been built" disclosure, before they meet
          a photorealistic person on a campus — which is the image most
          likely to be read as proof the product ships today. */}
      <StudentCarry />

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
              Preorder
            </p>
            <h2 className="mt-4 text-center headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
              {formatPrice()}. Fund the first run.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-center text-[16px] leading-relaxed text-neutral-600">
              {DEV_STAGE}. Shipping included. Preorders are final, and
              refundable in full only if we miss the window.
            </p>
            {/* Increase framing only — see components/EarlyBirdBadge.tsx. */}
            <EarlyBirdBadge className="mx-auto mt-4 max-w-md text-center" />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-12 rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm">
              {/* The badge says what the product IS, not what the offer is.
                  "Not for sale yet" was true of a waitlist and is now false —
                  a stale badge contradicting a live price is exactly the kind
                  of internal inconsistency a deception claim is built on. */}
              <span className="absolute -top-3 left-8 rounded-full bg-black px-3.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                Not built yet
              </span>

              <p className="font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                What preordering actually does
              </p>

              <ul className="mt-6 mb-8 list-none space-y-0 p-0">
                {[
                  `You are charged ${formatPrice()} today, shipping included.`,
                  `We aim to ship in about ${LEAD_TIME_DAYS} days.`,
                  "No unit exists yet. You are funding the build.",
                  /* This bullet used to promise cancellation any time before
                     shipment. Narrowed 2026-08-04 with the policy. It sits
                     ABOVE the buy button on purpose: a final-sale term the
                     buyer cannot see before paying is the kind a court
                     declines to enforce. Do not move it below the CTA. */
                  "Preorders are final, with no change-of-mind refunds.",
                  `Full refund if we miss the ${LEAD_TIME_DAYS}-day window.`,
                ].map((line) => (
                  <li key={line} className="py-3.5 text-[14.5px] text-neutral-600">
                    <div className="mb-3.5 h-px w-full bg-neutral-200" />
                    {line}
                  </li>
                ))}
              </ul>

              <PreorderButton size="lg" className="w-full" />

              {/* This used to render PREORDER_NOTICE in full, which restated
                  all five bullets directly above it in smaller grey type —
                  the single worst piece of duplication on the site. The
                  bullets are the conspicuous disclosure here, and they sit
                  ABOVE the button where they belong.

                  Nothing legally load-bearing was lost. This button is a
                  LINK to /preorder, not a payment control (see
                  PreorderButton.tsx:51-60) — no money can move from this
                  page. The point-of-sale disclosure that Cal. Civ. Code
                  §1723 and the FTC Mail Order Rule actually attach to is
                  Disclosure() in PreorderCheckout.tsx, rendered on
                  /preorder beneath the real buy control, and it is intact.
                  If this button is ever pointed at Stripe directly, the
                  full notice has to come back here first. */}
              <p className="mt-5 text-[12.5px] leading-relaxed text-neutral-400">
                Every figure on this site is a design target, not a
                measurement. The{" "}
                <Link href="/preorder" className="underline underline-offset-4 hover:text-black">
                  full terms
                </Link>{" "}
                are on the preorder page, and you should read them before
                you pay.
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
              Before you pay.
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
              Preorder, or wait and see.
            </h2>
            {/* CORRECTED 2026-08-06. This read "Refundable in full until the
                day it ships" — the pre-2026-08-04 policy, left behind when
                REFUND_POLICY narrowed to all-sales-final-except-on-delay.
                It was live on the home page, and it promised something more
                generous than the policy it sat next to, which is the version
                of a contradiction a buyer would reasonably rely on. Keep
                this line in step with REFUND_POLICY in lib/site.ts. */}
            <p className="mx-auto mt-5 max-w-md text-[17px] text-neutral-500">
              {DEV_STAGE}. Preorders are final, with a full refund if we miss
              the window.
            </p>
            <div className="mt-9 flex justify-center">
              <PreorderButton size="lg" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
