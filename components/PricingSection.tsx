'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  LEAD_TIME_DAYS,
  PREORDERS_ENABLED,
  PREORDER_NOTICE,
  formatPrice,
} from "@/lib/site"
import { motion } from "motion/react"
import Reveal from "./Reveal"

/* ============================================================
   WAS THE PRICING TABLE. Now "what we're building" — no prices,
   no tiers, no CTA that implies a purchase. Rewritten 2026-07-29.

   Five things were removed, and none of them may come back
   without a lawyer signing off:

     1. status "Available Now" + a "Shipping now" badge, for a
        product with no battery selected and no unit built. An
        availability claim is specific and checkable — the easiest
        kind of FTC deception claim to prove.
     2. "Lifetime warranty" — a federal commitment under the
        Magnuson-Moss Warranty Act, unbounded, on an unbuilt
        product, from students with no entity behind them.
     3. "IPX4 water resistant" — a formal IEC 60529 rating never
        tested.
     4. Prices (39.99 / 20 / 120) that contradicted lib/site.ts.
     5. ALL prices and the deposit CTA — because under 35 U.S.C.
        §271(a) an "offer to sell" is itself patent infringement,
        and a competitor holds a granted patent in this exact
        category. See the commerce note in lib/site.ts.

   A definite product at a definite price is the thing to avoid
   here. Concepts described without price or availability are not.
   ============================================================ */

/* `price` is set on exactly ONE concept, deliberately. Passive Panel and
   Complete Backpack are still ideas with no design behind them, and
   pricing an idea is how you end up owing someone a product you never
   started. Only the thing being actively built is for sale. */
const CONCEPTS = [
  {
    name: "Passive Panel",
    /* "Launching Q2 2027" per the owner, 2026-08-04. Note what this is:
       a DATE on a product with no design work started. It is softer than
       a ship promise (nothing is for sale, so no Mail Order Rule clock
       runs against it) but it is still a public availability claim, and
       an availability claim is the easiest kind of FTC deception case to
       prove because it is specific and checkable. If Q2 2027 arrives and
       this has not launched, change the date or remove it — do not let it
       sit stale. Same for the Complete Backpack below. */
    stage: "Launching Q2 2027",
    notifySlug: "passive-panel",
    price: null,
    description: "A static spacer panel with no fan and no battery.",
    features: [
      "3D spacer mesh, 5mm loft",
      "One-piece PETG frame",
      "No battery, no charging",
      "Intended for packs 15-45L",
    ],
  },
  {
    name: "FlowPack V1",
    stage: "What we're building first",
    focus: true,
    notifySlug: null,
    price: formatPrice(),
    description:
      "Two blowers move air through the gap, instead of waiting for you to walk fast enough.",
    features: [
      "Everything in Passive, plus:",
      "Two PWM blower fans",
      "4-6 hours per set of AA batteries (target)",
      "Batteries NOT included: you supply AA cells",
      "26 dB (target)",
      "Free shipping, United States only",
      "Splash-resistant design goal, no IP rating claimed",
    ],
  },
  {
    name: "Complete Backpack",
    stage: "Launching Q2 2027",
    notifySlug: "complete-backpack",
    price: null,
    description: "A whole pack built around the cooling system.",
    features: [
      "Everything in FlowPack V1, plus:",
      "Integrated cable management",
      "Laptop compartment",
      "Weather-resistant exterior",
    ],
  },
]

export default function PricingSection() {
  return (
    <section className="relative w-full min-h-screen bg-white py-20 px-6 sm:px-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Reveal>
          <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            What we&rsquo;re building
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="headline mb-6 text-4xl text-black sm:text-5xl">
            Three ideas, and only one is being built.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            One of these you can preorder. The other two are ideas we
            haven&rsquo;t started, so they carry no price and won&rsquo;t
            until we do.
          </p>
        </Reveal>
      </div>

      {/* Concept cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {CONCEPTS.map((concept, index) => (
          <Reveal key={concept.name} delay={0.1 + index * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              className={`relative group h-full ${
                concept.focus ? "md:scale-105" : ""
              }`}
            >
              <Card
                className={`h-full rounded-2xl transition-colors ${
                  concept.focus
                    ? "border-neutral-900 bg-white shadow-xl"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {concept.focus && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-neutral-900 px-4 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase">
                      In development
                    </span>
                  </div>
                )}

                <CardHeader className="p-8 sm:p-10">
                  <div className="mb-4">
                    <h3 className="headline mb-2 text-2xl text-black">
                      {concept.name}
                    </h3>
                    <p className="mb-4 text-sm text-neutral-600">
                      {concept.description}
                    </p>
                  </div>

                  {/* Price returned here on 2026-08-03, on the ONE concept
                      that is actually for sale. The other two keep the
                      "no price set" line — an unpriced idea sitting beside a
                      priced product is fine; three prices for two things that
                      do not exist is not. */}
                  <div className="mb-6">
                    {concept.price ? (
                      <>
                        <span className="headline text-2xl text-neutral-900">
                          {concept.price}
                        </span>
                        <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-neutral-400 uppercase">
                          Preorder · free shipping · ~{LEAD_TIME_DAYS} days
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-neutral-400">
                          {concept.stage}
                        </span>
                        <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-neutral-400 uppercase">
                          Not for sale · no price set
                        </p>
                      </>
                    )}
                  </div>

                  <Link
                    href={
                      concept.price && PREORDERS_ENABLED
                        ? "/preorder"
                        : concept.notifySlug
                          ? `/notify?product=${concept.notifySlug}`
                          : "/notify"
                    }
                    className={`mb-2 block w-full rounded-full px-4 py-3.5 text-center text-[15px] font-medium transition-colors ${
                      concept.focus
                        ? "bg-neutral-900 text-white hover:bg-neutral-700"
                        : "border border-neutral-900 text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {concept.price && PREORDERS_ENABLED
                      ? `Preorder · ${concept.price}`
                      : "Notify me"}
                  </Link>
                </CardHeader>

                <CardContent className="px-8 pb-10 sm:px-10">
                  <div className="border-t border-neutral-200 pt-6">
                    <p className="mb-4 text-sm font-medium text-neutral-900">
                      {concept.features[0]}
                    </p>
                    <ul className="space-y-3">
                      {concept.features.slice(1).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-300" />
                          <span className="text-sm leading-relaxed text-neutral-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Reveal>
        ))}
      </div>

      {/* Footer Note.
          The old version linked "View warranty details" at href="#" — a dead
          link promising warranty terms that did not exist. Replaced with the
          targets disclosure and real links to the legal pages.

          TARGETS_DISCLAIMER dropped 2026-08-06. It followed PREORDER_NOTICE
          here and repeated "nothing has been bench-tested or certified" from
          the sentence immediately before it. Every figure on this page
          already carries "(target)" inline, which lib/site.ts:409-414 is
          explicit is the placement that does the work. PREORDER_NOTICE
          stays: this section carries the one priced card on the home page,
          so the full preorder disclosure belongs with it. */}
      <div className="max-w-4xl mx-auto text-center mt-16">
        <Reveal delay={0.4}>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-500">
            {PREORDER_NOTICE}
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            <Link href="/terms" className="text-neutral-900 underline underline-offset-4">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="text-neutral-900 underline underline-offset-4">
              Privacy
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
