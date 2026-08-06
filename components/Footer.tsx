import Image from "next/image";
import Link from "next/link";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import {
  BRAND,
  CONTACT_EMAIL,
  LEGAL_ENTITY,
  LEGAL_NAV,
  NAV,
} from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-white">
      {/* Light-grey flow field drifting behind the legal block. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <FlowFieldBackground
          color="#d4d4d8"
          scale={1}
          trailOpacity={0.06}
          speed={0.8}
          backdrop="255,255,255"
        />
      </div>
      {/* Fades the field out at the top so it doesn't collide with the CTA. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-white to-transparent" />

      <div className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-black">
              <Image src="/logo.png" alt="" width={20} height={20} />
              {BRAND}
            </span>
            <span className="text-[12.5px] text-neutral-500">
              Active cooling for the pack you already own.
            </span>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {[...NAV, ...LEGAL_NAV].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[12.5px] text-neutral-500 transition-colors hover:text-black"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[12.5px] text-neutral-500 transition-colors hover:text-black"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* This block previously claimed figures came "from bench testing"
            (nothing was ever bench-tested) and stated a refund rule that
            contradicted two other pages. The remaining sentence comes from
            lib/site.ts so the footer, the FAQ and /terms cannot drift apart
            again.

            NOT_AN_OFFER_NOTICE used to close this paragraph. It was deleted
            site-wide on 2026-08-03 when checkout shipped — it read "nothing
            here is for sale", which a footer cannot say on a page carrying a
            priced buy button.

            SHORTENED 2026-08-06. It carried TARGETS_DISCLAIMER *and* the
            full PREORDER_NOTICE on top of the sentence below, which meant
            every page ended with three overlapping legal sentences and said
            "no unit exists" twice inside one paragraph — on /privacy and
            /terms as much as on the pages that sell anything.

            What was dropped and why it is safe:
              - PREORDER_NOTICE is a POINT-OF-SALE notice. It still renders
                in full where a buyer can actually pay: Disclosure() in
                PreorderCheckout.tsx, beneath the buy control on /preorder,
                and in /terms §2. A site-wide footer is not the point of
                sale and nothing requires it there.
              - TARGETS_DISCLAIMER is redundant with the sentence kept
                below, and every individual figure already carries "(target)"
                inline — which lib/site.ts:409-414 is explicit is the
                placement that matters, the qualifier travelling with the
                number rather than living in a footnote.

            The sentence that remains is the one genuinely site-wide fact:
            this is a design, not a finished product. Do not drop that. */}
        <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
          <p className="max-w-3xl text-[11.5px] leading-relaxed text-neutral-400">
            © {new Date().getFullYear()} {LEGAL_ENTITY}. {BRAND} is a design in
            development: no finished unit exists, and nothing has been tested
            or certified.
          </p>
        </div>
      </div>
    </footer>
  );
}
