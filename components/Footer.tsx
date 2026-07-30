import Image from "next/image";
import Link from "next/link";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import {
  BRAND,
  CONTACT_EMAIL,
  LEGAL_ENTITY,
  LEGAL_NAV,
  NAV,
  NOT_AN_OFFER_NOTICE,
  TARGETS_DISCLAIMER,
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
            contradicted two other pages. Both sentences now come from
            lib/site.ts so the footer, the FAQ and /terms cannot drift apart
            again. The "not an offer" sentence is legally load-bearing —
            see the commerce note in lib/site.ts before removing it. */}
        <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
          <p className="max-w-3xl text-[11.5px] leading-relaxed text-neutral-400">
            © {new Date().getFullYear()} {LEGAL_ENTITY}. {BRAND} is a design in
            development — no finished unit exists, and nothing has been tested
            or certified. {TARGETS_DISCLAIMER} {NOT_AN_OFFER_NOTICE}
          </p>
        </div>
      </div>
    </footer>
  );
}
