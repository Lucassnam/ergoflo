import Link from "next/link";
import WaitlistButton from "@/components/WaitlistButton";

/* /specs, /investors and /refunds were removed on 2026-07-29. Anyone holding
   an old link lands here, so this page points somewhere useful rather than
   dead-ending. */
export default function NotFound() {
  return (
    <section className="px-5 py-32 text-center sm:px-8">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
          404
        </p>
        <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
          That page isn&rsquo;t here.
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
          It may have been removed. The spec sheet and investor pages came down
          while the product is still in development.
        </p>
        <div className="mt-9 flex flex-col items-center gap-4">
          <WaitlistButton size="lg" />
          <Link
            href="/"
            className="text-[14px] text-neutral-500 underline underline-offset-4 transition-colors hover:text-black"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
