"use client";

import { useSyncExternalStore } from "react";
import {
  EARLY_BIRD_ENDS,
  PRICE_CENTS,
  formatEarlyBirdEnd,
  formatPrice,
} from "@/lib/site";

/* ============================================================
   The early-bird notice, and the only live clock on the site.

   ─── IT ANNOUNCES AN INCREASE, NOT A DISCOUNT. ───
   "Goes up to $70 on Monday, Aug 10." Never "was $70", never a struck-
   through price, never a saving. $70 has never been charged, so a
   former-price comparison against it would be a fabricated reference
   price under 16 CFR 233.1. The full reasoning is in the pricing block
   in lib/site.ts — read it before rewriting a word of this copy.

   ─── WHY useSyncExternalStore AND NOT useState + useEffect. ───
   This is a static export. The HTML is prerendered once by `next build`
   and served unchanged for as long as the CDN holds it, so the server
   has no idea what time it is when a visitor arrives. The first client
   render must therefore match the prerendered markup exactly, or React
   throws a hydration mismatch.

   The obvious shape for that is a `mounted` flag set in an effect. It
   does not survive lint here: React 19's `react-hooks/set-state-in-effect`
   rule rejects a synchronous setState in an effect body, and it is right
   to — that pattern renders twice on every mount.

   useSyncExternalStore is the primitive built for exactly this. Its
   third argument is the SERVER snapshot, which React also uses for the
   hydrating render, so returning null there makes the first client
   render provably identical to the prerendered HTML. After hydration
   React switches to the client snapshot and the countdown appears.

   The snapshot is bucketed to the minute on purpose: getSnapshot must
   return a value that is stable between calls, and a raw Date.now()
   changes every read, which sends React into an infinite re-render.

   ─── WHAT IT DOES WHEN THE DEADLINE PASSES. ───
   It removes itself. It does NOT switch to announcing the regular
   price, because the surrounding page is still prerendered with the
   early-bird price baked in — the site cannot raise its own price
   without a redeploy. Rendering "the price is now $70" next to a $50
   price tag and a Stripe link that charges $50 would be the one thing
   this whole design exists to avoid. Silence is correct: the promo
   simply stops being advertised until someone redeploys.
   ============================================================ */

type Remaining = { days: number; hours: number; minutes: number };

function remainingUntil(deadlineMs: number, nowMs: number): Remaining | null {
  const ms = deadlineMs - nowMs;
  if (ms <= 0) return null;
  const minutes = Math.floor(ms / 60_000);
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

/* "3d 14h" while there is a day or more left, then "14h 09m", then
   "9m". Showing seconds on a four-day promo is pure pressure theatre
   and reads as a scam; showing "0d 0h" on the last afternoon reads as
   broken. */
function formatRemaining({ days, hours, minutes }: Remaining): string {
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m left`;
  return `${minutes}m left`;
}

const MINUTE_MS = 60_000;

/* A minute is the right resolution for a four-day window: it keeps the
   number honest without turning the page into a slot machine. */
function subscribeToMinute(onChange: () => void): () => void {
  const id = setInterval(onChange, MINUTE_MS);
  return () => clearInterval(id);
}

export default function EarlyBirdBadge({ className = "" }: { className?: string }) {
  const deadline = Date.parse(EARLY_BIRD_ENDS);

  /* null while server-rendering and while hydrating; a minute-bucketed
     timestamp once the client takes over. See the header note. */
  const minute = useSyncExternalStore<number | null>(
    subscribeToMinute,
    () => Math.floor(Date.now() / MINUTE_MS),
    () => null,
  );

  const left =
    minute === null ? null : remainingUntil(deadline, minute * MINUTE_MS);

  /* Deadline has passed on the visitor's clock — say nothing at all.
     See the header note on why this is not a switch to the $70 state. */
  if (minute !== null && !left) return null;

  return (
    <p
      className={`text-[13px] leading-relaxed text-neutral-600 ${className}`.trim()}
    >
      <span className="font-medium text-black">Early-bird price.</span>{" "}
      Goes up to {formatPrice(PRICE_CENTS)} on {formatEarlyBirdEnd()}
      {left ? (
        <>
          {" · "}
          <span className="font-mono text-[12.5px] tracking-tight text-neutral-500">
            {formatRemaining(left)}
          </span>
        </>
      ) : null}
      .
    </p>
  );
}
