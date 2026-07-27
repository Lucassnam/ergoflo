import Link from "next/link";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import { BRAND, CONTACT_EMAIL, NAV } from "@/lib/site";

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
            <span className="text-[15px] font-semibold tracking-tight text-black">
              {BRAND}
            </span>
            <span className="text-[12.5px] text-neutral-500">
              Active cooling for the pack you already own.
            </span>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {NAV.map((n) => (
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

        <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
          <p className="text-[11.5px] text-neutral-400">
            © {new Date().getFullYear()} {BRAND}. Preorder figures are targets
            from bench testing, not guarantees. Deposits are refunded only if
            production does not move forward.
          </p>
        </div>
      </div>
    </footer>
  );
}
