import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { CONTACT_EMAIL, LEAD_TIME_DAYS, formatPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Preorder confirmed",
  /* noindex: this URL carries a session_id in the query string and has no
     value in search results. Cloudflare also sends X-Robots-Tag for /api/*,
     but not for this path, so it has to be declared here. */
  robots: { index: false, follow: false },
};

/* ============================================================
   POST-PAYMENT LANDING PAGE. IT PROVES NOTHING.

   This page is reached by a redirect from Stripe with
   ?session_id=cs_..., and it deliberately does NOT read it. Two reasons:

     1. Reading searchParams server-side makes the route dynamic, which
        `output: "export"` cannot emit. Same trap as app/notify/page.tsx.
     2. More importantly, this page is not evidence of anything. Anyone
        can navigate here directly. The order is recorded by
        functions/api/stripe-webhook.ts against a verified Stripe
        signature, which is the only trustworthy signal in the flow.

   So the copy is careful: it says what Stripe will send, not "your order
   is confirmed" as a statement of fact about our records. If the webhook
   failed, Stripe still retries, and the buyer's receipt from Stripe is
   real regardless of what this page says.
   ============================================================ */
export default function PreorderSuccess() {
  return (
    <section className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md text-center">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Preorder
          </p>
          <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
            Thank you.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
            Stripe is emailing you a receipt for {formatPrice()}. Keep it. That
            receipt is your proof of purchase, and it comes from Stripe rather
            than from us.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 rim rounded-2xl bg-neutral-50 px-7 py-8 text-left">
            <h2 className="headline text-[18px] text-black">What happens now</h2>
            <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-neutral-700">
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  We aim to ship in about {LEAD_TIME_DAYS} days. If that slips,
                  you get an email with a new date and the option of a full
                  refund. You do not have to ask, and you do not have to give a
                  reason.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  Your preorder is final. We do not refund a change of
                  mind. You get the full {formatPrice()} back if we miss the
                  window, abandon the project, or your order arrives damaged.
                  Anything else, email{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="underline underline-offset-4 hover:text-black"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  and we will tell you honestly where you stand.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
                <span>
                  We&rsquo;ll write occasionally with real progress, including
                  the parts that go wrong.
                </span>
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-8 text-[13.5px] text-neutral-500">
            Didn&rsquo;t get a receipt within a few minutes? Check spam, then
            email us. Do not preorder twice.
          </p>
          <p className="mt-6 text-[13.5px] text-neutral-500">
            <Link href="/refunds" className="text-neutral-900 underline underline-offset-4">
              Refund policy
            </Link>
            {" · "}
            <Link href="/terms" className="text-neutral-900 underline underline-offset-4">
              Terms
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
