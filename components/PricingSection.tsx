'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { NOT_AN_OFFER_NOTICE, TARGETS_DISCLAIMER } from "@/lib/site"
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

const CONCEPTS = [
  {
    name: "Passive Panel",
    stage: "Concept",
    notifySlug: "passive-panel",
    description: "A static spacer panel — no fan, no battery.",
    features: [
      "3D spacer mesh, 5mm loft",
      "Tensioned TPU rails",
      "PETG frame",
      "Intended for packs 15–45L",
    ],
  },
  {
    name: "Active Fan",
    stage: "What we're building first",
    focus: true,
    notifySlug: null,
    description:
      "One brushless fan moving air through the gap, instead of waiting for you to walk fast enough.",
    features: [
      "Everything in Passive, plus:",
      "One brushless PWM fan",
      "9–12 hours runtime per charge (target)",
      "USB-C charging",
      "26 dB (target)",
      "Splash-resistant design goal — no IP rating claimed",
    ],
  },
  {
    name: "Complete Backpack",
    stage: "Idea only",
    notifySlug: "complete-backpack",
    description: "A whole pack built around the cooling system.",
    features: [
      "Everything in Active Fan, plus:",
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
            Three ideas. One of them is real work.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            None of these is for sale, and we&rsquo;re not quoting a price on
            something we haven&rsquo;t built. Here&rsquo;s what each one is.
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

                  {/* Stage, where the price used to be. */}
                  <div className="mb-6">
                    <span
                      className={`text-sm font-semibold ${
                        concept.focus ? "text-neutral-900" : "text-neutral-400"
                      }`}
                    >
                      {concept.stage}
                    </span>
                    <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-neutral-400 uppercase">
                      Not for sale · no price set
                    </p>
                  </div>

                  <Link
                    href={
                      concept.notifySlug
                        ? `/notify?product=${concept.notifySlug}`
                        : "/notify"
                    }
                    className={`mb-2 block w-full rounded-full px-4 py-3.5 text-center text-[15px] font-medium transition-colors ${
                      concept.focus
                        ? "bg-neutral-900 text-white hover:bg-neutral-700"
                        : "border border-neutral-900 text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    Join the waitlist
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
          targets disclosure and real links to the legal pages. */}
      <div className="max-w-4xl mx-auto text-center mt-16">
        <Reveal delay={0.4}>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-500">
            {NOT_AN_OFFER_NOTICE} {TARGETS_DISCLAIMER}
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
