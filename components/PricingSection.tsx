'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PREORDER_LIMIT, PRICING } from "@/lib/site"
import { motion } from "framer-motion"
import Reveal from "./Reveal"

const PRICING_TIERS = [
  {
    name: "Passive Panel",
    price: 20,
    status: "Coming Spring 2027",
    statusType: "coming-soon",
    description: "Static cooling mesh panel without active fans",
    features: [
      "3D spacer mesh, 5mm loft",
      "Tensioned TPU rails",
      "PETG frame",
      "Fits most packs 15-45L",
    ],
  },
  {
    name: "Active Fan",
    price: 39.99,
    status: "Available Now",
    statusType: "available",
    description: "A single brushless fan for active cooling",
    popular: true,
    features: [
      "Everything in Passive, plus:",
      "One brushless PWM fan",
      "46 hours runtime per charge",
      "USB-C charging",
      "26 dB near-silent operation",
      "IPX4 water resistant",
    ],
  },
  {
    name: "Complete Backpack",
    price: 120,
    status: "Coming Spring 2027",
    statusType: "coming-soon",
    description: "Full backpack with integrated cooling system",
    features: [
      "Everything in Active Fan, plus:",
      "Premium travel backpack",
      "Integrated cable management",
      "Laptop compartment",
      "Weather-resistant exterior",
      "Lifetime warranty",
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
            Pricing
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="headline mb-6 text-4xl text-black sm:text-5xl">
            Three ways in.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            A mesh panel, the fan unit, or the whole pack.
          </p>
        </Reveal>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {PRICING_TIERS.map((tier, index) => (
          <Reveal key={tier.name} delay={0.1 + index * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              className={`relative group h-full ${
                tier.popular ? "md:scale-105" : ""
              }`}
            >
              <Card
                className={`h-full rounded-2xl transition-colors ${
                  tier.popular
                    ? "border-neutral-900 bg-white shadow-xl"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-neutral-900 px-4 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase">
                      Shipping now
                    </span>
                  </div>
                )}

                <CardHeader className="p-8 sm:p-10">
                  <div className="mb-4">
                    <h3 className="headline mb-2 text-2xl text-black">
                      {tier.name}
                    </h3>
                    <p className="mb-4 text-sm text-neutral-600">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="mb-6">
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="headline text-5xl text-black">
                        ${tier.price}
                      </span>
                      {tier.statusType === "available" && (
                        <span className="text-neutral-500">USD</span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        tier.statusType === "available"
                          ? "text-neutral-900"
                          : "text-neutral-400"
                      }`}
                    >
                      {tier.status}
                    </span>
                    {tier.statusType === "available" && (
                      <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-neutral-400 uppercase">
                        First run · {PREORDER_LIMIT} units
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    disabled={tier.statusType === "coming-soon"}
                    className={`mb-2 w-full rounded-full px-4 py-3.5 text-[15px] font-medium transition-colors ${
                      tier.statusType === "coming-soon"
                        ? "cursor-not-allowed border border-neutral-200 text-neutral-400"
                        : tier.popular
                          ? "bg-neutral-900 text-white hover:bg-neutral-700"
                          : "border border-neutral-900 text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {tier.statusType === "coming-soon"
                      ? "Notify me"
                      : `Reserve · $${PRICING.deposit} deposit`}
                  </button>
                </CardHeader>

                <CardContent className="px-8 pb-10 sm:px-10">
                  <div className="border-t border-neutral-200 pt-6">
                    <p className="mb-4 text-sm font-medium text-neutral-900">
                      {tier.features[0]}
                    </p>
                    <ul className="space-y-3">
                      {tier.features.slice(1).map((feature, i) => (
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

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto text-center mt-16">
        <Reveal delay={0.4}>
          <p className="text-sm text-neutral-500">
            All prices in USD. Shipping and taxes calculated at checkout.{" "}
            <a href="#" className="text-neutral-900 underline underline-offset-4">
              View warranty details
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
