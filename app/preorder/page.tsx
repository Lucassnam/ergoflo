import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreorderCheckout from "@/components/PreorderCheckout";
import EarlyBirdBadge from "@/components/EarlyBirdBadge";
import {
  BRAND,
  LEAD_TIME_DAYS,
  SELLER_OF_RECORD,
  SHIPS_TO,
  SPECS,
  TARGETS_DISCLAIMER,
  formatPrice,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Preorder",
  description: `Preorder the ${BRAND} FlowPack V1 panel for ${formatPrice()}, shipping included. A product that has not been built yet. Ships in about ${LEAD_TIME_DAYS} days, and preorders are final.`,
};

/* ============================================================
   THE PAGE THAT TAKES MONEY.

   STATIC, AND IT TAKES NO searchParams. `?cancelled=1` is set by the
   Stripe cancel_url, but reading it server-side would make this a dynamic
   route, which `output: "export"` cannot emit — the same trap documented
   at length in app/notify/page.tsx. Nothing on this page branches on it;
   a buyer who backs out of Stripe simply lands here again with the form
   ready. That is the correct behaviour anyway.

   ORDER OF THE PAGE IS A LEGAL DECISION, NOT A DESIGN ONE. What the
   product is not comes BEFORE the price, and the price comes before the
   payment field. A reasonable-consumer reading of this page has to reach
   "no unit exists" before it reaches "$49.99". Do not move the checkout
   above the disclosure block to lift conversion — that reordering is the
   whole difference between a disclosed preorder and a deceptive one.
   ============================================================ */
export default function Preorder() {
  return (
    <section className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Preorder
          </p>
          <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
            Fund the first run.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
            {formatPrice()}, shipping included, {SHIPS_TO}. You are paying for
            something that does not exist yet. Here is what that means.
          </p>
        </Reveal>

        {/* The disclosure block. Deliberately the most prominent thing on the
            page after the headline, and deliberately above the price. */}
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-2xl border border-neutral-900 bg-neutral-50 p-6 sm:p-7">
            <h2 className="headline text-[18px] text-black">
              Read this before you pay
            </h2>
            <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-neutral-700">
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                {/* "Nothing has been bench-tested or certified" was removed
                    from this bullet on 2026-08-06 — TARGETS_DISCLAIMER in the
                    very next bullet states it verbatim, so the reader met the
                    same clause twice in consecutive sentences.

                    The batteries clause STAYS. It is a point-of-sale
                    disclosure (lib/site.ts:507-510): failing to disclose that
                    a required component is absent is an FTC deception
                    problem, and this block is what a buyer reads before
                    reaching the button. */}
                <span>
                  <strong className="font-medium text-black">
                    No unit exists.
                  </strong>{" "}
                  The design is not finished, so there is no prototype to buy a
                  copy of. It takes AA batteries, which are not included.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  <strong className="font-medium text-black">
                    Every number on this site is a target.
                  </strong>{" "}
                  {TARGETS_DISCLAIMER}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  <strong className="font-medium text-black">
                    It might never ship.
                  </strong>{" "}
                  We are students and this is our first hardware project. If we
                  conclude it cannot be built, you get every cent back.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  <strong className="font-medium text-black">
                    About {LEAD_TIME_DAYS} days to ship.
                  </strong>{" "}
                  If we cannot make that, we email you a revised date and you
                  can accept it or take a full refund. No conditions.
                </span>
              </li>
              {/* THE FINAL-SALE BULLET. Added 2026-08-04 with the policy
                  change, and placed inside the disclosure block that sits
                  ABOVE the price and the payment control — a no-refund term
                  is only enforceable if the buyer could see it before paying.
                  Do not relocate it further down the page. */}
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  <strong className="font-medium text-black">
                    Preorders are final.
                  </strong>{" "}
                  There are no change-of-mind refunds once you order. You are
                  refunded in full only if we miss the {LEAD_TIME_DAYS}-day
                  window, abandon the project, or your order arrives damaged.
                  Be sure before you pay. The{" "}
                  <Link href="/notify" className="underline underline-offset-4">
                    notify list
                  </Link>{" "}
                  costs nothing and stays open.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  <strong className="font-medium text-black">
                    {BRAND} is not a company.
                  </strong>{" "}
                  No business entity has been formed
                  {SELLER_OF_RECORD ? `; orders are taken by ${SELLER_OF_RECORD}` : ""}
                  . Read the{" "}
                  <Link href="/terms" className="underline underline-offset-4">
                    Terms
                  </Link>{" "}
                  before paying.
                </span>
              </li>
            </ul>
          </div>
        </Reveal>

        {/* Price, then payment. */}
        <Reveal delay={0.2}>
          <div className="mt-10 rim rounded-2xl bg-white px-7 py-8">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="headline text-[19px] text-black">
                  FlowPack V1 panel
                </p>
                <p className="mt-1 text-[14px] text-neutral-500">
                  Preorder · ships in about {LEAD_TIME_DAYS} days
                </p>
              </div>
              <div className="text-right">
                <p className="headline text-[28px] text-black">
                  {formatPrice()}
                </p>
                {/* "Free US shipping", not "Free shipping" — SHIPS_TO is
                    deliberately US-only (it keeps GDPR, EU GPSR and
                    per-destination lithium freight rules out of scope), and
                    the limit belongs next to the price rather than only in
                    the spec table further down. */}
                <p className="text-[13px] text-neutral-500">Free US shipping</p>
              </div>
            </div>

            {/* Increase framing only — never a struck-through regular price.
                Sits BELOW the price and ABOVE the checkout, so it cannot
                push the disclosure block further from the buy control. */}
            <EarlyBirdBadge className="mt-4" />

            <div className="mt-6 border-t border-neutral-200 pt-6">
              <PreorderCheckout />
            </div>
          </div>
        </Reveal>

        {/* Targets, labelled as targets. Reusing SPECS rather than restating
            them keeps this page from drifting out of step with the rest of
            the site — a spec that differs between two pages is the kind of
            inconsistency a chargeback dispute is won on. */}
        <Reveal delay={0.3}>
          <div className="mt-14">
            <h2 className="headline text-[18px] text-black">
              What we are aiming for
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500">
              Design targets, not measurements. Nothing here has been tested.
            </p>
            <dl className="mt-5 divide-y divide-neutral-200 border-t border-neutral-200">
              {SPECS.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-[14.5px] text-neutral-500">{k}</dt>
                  <dd className="text-right text-[14.5px] text-neutral-900">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-10 text-[13.5px] text-neutral-500">
            <Link href="/refunds" className="text-neutral-900 underline underline-offset-4">
              Refund policy
            </Link>
            {" · "}
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
  );
}
