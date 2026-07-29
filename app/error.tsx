"use client";

import { useEffect } from "react";

/* Root error boundary. Without one, an unhandled render error shows Next's
   default screen — which in production is a blank page. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the digest, not the message: error text can carry request data.
    console.error("[app] render error", error.digest ?? "no digest");
  }, [error]);

  return (
    <section className="px-5 py-32 text-center sm:px-8">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
          Error
        </p>
        <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
          Something broke on our end.
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
          That&rsquo;s our fault, not yours. Try again — and if it keeps
          happening, we&rsquo;d genuinely like to know.
        </p>
        <button
          onClick={reset}
          className="glow-btn mt-9 inline-flex items-center justify-center rounded-full px-8 py-4 text-[16px] font-medium tracking-tight"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
