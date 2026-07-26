import Link from "next/link";
import { BRAND, CONTACT_EMAIL, NAV } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="hairline h-px w-full" />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold tracking-tight">{BRAND}</span>
          <span className="text-[12.5px] text-fg-faint">
            Active cooling for the pack you already own.
          </span>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[12.5px] text-fg-faint transition-colors hover:text-fg-dim"
            >
              {n.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[12.5px] text-fg-faint transition-colors hover:text-fg-dim"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="text-[11.5px] text-fg-faint/70">
          © {new Date().getFullYear()} {BRAND}. Preorder figures are targets from
          bench testing, not guarantees. Deposits are refunded only if production
          does not move forward.
        </p>
      </div>
    </footer>
  );
}
