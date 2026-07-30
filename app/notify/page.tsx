import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import NotifyForm from "@/components/NotifyForm";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notify me",
  description: `Get an email the moment the next ${BRAND} product is ready to order.`,
};

/* The `product` allowlist, mirrored in functions/api/notify.ts. Both must
   agree — the function rejects anything not in its own copy, so adding a
   product here alone silently drops it to null on the server. */
export const PRODUCT_LABELS: Record<string, string> = {
  "passive-panel": "the Passive Panel",
  "complete-backpack": "the Complete Backpack",
};

/* ============================================================
   THIS PAGE IS DELIBERATELY STATIC AND TAKES NO searchParams.

   It used to read `?product=` server-side to personalise one sentence
   ("...the moment THE PASSIVE PANEL is ready"). That made the route
   dynamic, which `output: "export"` cannot emit.

   The obvious fix — a client component using useSearchParams wrapped in
   <Suspense> — was tried and REJECTED. It builds cleanly and ships a page
   whose body is empty: 18 KB instead of 35–43 KB, with the headline, the
   form, the honeypot and the Terms consent line all missing from the HTML
   and only appearing after hydration. Invisible to crawlers, and broken
   for anyone before JS loads.

   So the copy stays generic and NotifyForm reads `?product=` from
   window.location at submit time instead — no render-time dependency, no
   Suspense boundary, full HTML prerendered. If you want the personalised
   sentence back, this is the trade-off you are re-opening.
   ============================================================ */
export default function Notify() {
  return (
    <section className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md text-center">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Notify me
          </p>
          <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
            Be first to know.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
            Leave your email and we&rsquo;ll let you know the moment it&rsquo;s
            ready to order.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <NotifyForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
