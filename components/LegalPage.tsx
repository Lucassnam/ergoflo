import type { ReactNode } from "react";
import Link from "next/link";
import {
  BRAND,
  CONTACT_EMAIL,
  LEGAL_ADDRESS,
  LEGAL_ENTITY,
  hasLegalAddress,
} from "@/lib/site";

/**
 * Shared chrome for /terms, /privacy and /refunds.
 *
 * These pages are deliberately plain: no Reveal animations, no flow field, no
 * scroll effects. Legal text that fades in on scroll is text a reader can
 * credibly claim they never saw, and "conspicuous disclosure" is a real
 * standard — an animated disclaimer is a weaker one than a static paragraph.
 *
 * `lastUpdated` is required rather than optional. An undated policy is close to
 * useless in a dispute, because you cannot show which version the buyer agreed
 * to on the day they paid.
 */
export default function LegalPage({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
          Legal
        </p>
        <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
          {title}
        </h1>
        <p className="mt-4 text-[13.5px] text-neutral-500">
          Last updated {lastUpdated} · Applies to {BRAND}, operated by{" "}
          {LEGAL_ENTITY}
        </p>

        {intro && (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-[15px] leading-relaxed text-neutral-700">
            {intro}
          </div>
        )}

        <div className="legal-body mt-10">{children}</div>

        <div className="mt-14 border-t border-neutral-200 pt-8">
          <h2 className="headline text-[18px] text-black">Contact</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
            Questions about this page, or about any order, go to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-black underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
            {LEGAL_ENTITY}
            <br />
            {hasLegalAddress ? (
              LEGAL_ADDRESS
            ) : (
              /* Visible on purpose. A missing mailing address is a launch
                 blocker — it is required in these terms and in the footer of
                 any marketing email under CAN-SPAM — so it is surfaced to the
                 reader rather than hidden in a code comment nobody reads. */
              <span className="text-red-600">
                [Mailing address not yet published — set LEGAL_ADDRESS in
                lib/site.ts before launch]
              </span>
            )}
          </p>
          <p className="mt-6 text-[13.5px] text-neutral-500">
            <Link href="/terms" className="underline underline-offset-4">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="underline underline-offset-4">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}

/** Section heading + body, so the three legal pages can't drift apart visually. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="headline text-[19px] text-black">{heading}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-700">
        {children}
      </div>
    </section>
  );
}
