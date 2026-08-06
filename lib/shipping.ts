/* ============================================================
   SHIPPING WINDOW — one place that turns LEAD_TIME_DAYS into a date.

   WHY THIS FILE EXISTS. Before it, the lead time appeared three ways:
   as `LEAD_TIME_DAYS` interpolated into a dozen strings, as a hardcoded
   "120" in app/layout.tsx and in DEV_STAGE, and nowhere at all as an
   actual date. A relative window is fine on a marketing page and useless
   on an order: "about 120 days" written on 6 August and read on 2
   December tells the buyer nothing about whether the seller is late.

   THE RULE THIS FILE ENFORCES:
     - Before an order exists, quote the WINDOW (SHIP_WINDOW_PHRASE).
     - Once an order exists, quote the DATE (shipByDate at order time,
       stored on the row, formatted with formatShipDate).

   That split is not cosmetic. 16 CFR 435.2 gives the buyer a right to a
   revised date and an unconditional refund when the stated window is
   missed. A right that triggers on a date nobody wrote down is a right
   the buyer cannot exercise and the seller cannot prove it honoured.

   THE DATE IS COMPUTED ONCE AND STORED, NEVER RECOMPUTED. See
   `promised_ship_date` in supabase/migrations/20260806110123_*.sql.
   Recomputing at render time from today's LEAD_TIME_DAYS would silently
   move a date a customer already holds in writing the moment that
   constant changes — the exact failure `promised_ship_days` was added to
   prevent.
   ============================================================ */

import { LEAD_TIME_DAYS } from "./site";

/* ============================================================
   UNRESOLVED WORDING INCONSISTENCY — flagged 2026-08-06, NOT decided here.

   The site currently promises two different things:
     - Marketing surfaces say "ships in ABOUT 120 days"
       (DEV_STAGE, PREORDER_NOTICE, app/preorder/page.tsx, the FAQ).
     - REFUND_POLICY triggers the refund right on "if we cannot ship
       WITHIN 120 days".

   "About" is a hedge; "within" is a deadline. As written, the refund
   right fires on a stricter test than the promise that was made, which
   is the wrong way round for the seller and confusing for the buyer.

   Resolving it means either tightening every marketing surface to
   "within" (stricter promise, more refund exposure, cleanest legally) or
   loosening REFUND_POLICY to "about" (weaker buyer right, and "about" is
   a poor stated window under 16 CFR 435.2 precisely because it is
   unfalsifiable).

   This is a legal-content decision and is deliberately left to the
   disclaimer standardisation pass rather than settled by a helper
   module. SHIP_WINDOW_PHRASE below reproduces the existing "about"
   wording verbatim so this file changes no promise. When the decision is
   made, change it here and it propagates.
   ============================================================ */

/** The canonical pre-order phrasing. Reproduces existing site wording —
    see the block above before changing it. */
export const SHIP_WINDOW_PHRASE = `about ${LEAD_TIME_DAYS} days`;

/* ============================================================
   THE RANGE, added 2026-08-06 at the owner's instruction for the
   confirmation email ("our lead time is 90-120 days").

   LEAD_TIME_DAYS REMAINS THE ONLY PROMISE. The lower bound is an
   expectation, not a commitment: 16 CFR 435.2 turns on the shipping time
   stated at the point of sale, and that is the upper bound. Shipping on
   day 118 is on time; there is no obligation attached to the 90.

   Derived rather than written as a literal pair so the two numbers
   cannot drift apart. If LEAD_TIME_DAYS moves, the range moves with it
   and the site and the email keep saying the same thing.

   DO NOT ADVERTISE THE LOWER BOUND ALONE. "Ships in 90 days" on a
   marketing surface is a stated time of 90 days, and then day 91 owes a
   revised-date notice. The range belongs next to the upper bound or not
   at all.
   ============================================================ */
export const LEAD_TIME_MIN_DAYS = LEAD_TIME_DAYS - 30;

/** "90 to 120 days". Spelled "to" rather than an en dash: rendered copy
    in this project carries zero em/en dashes (commit df48982). */
export const LEAD_TIME_RANGE_PHRASE = `${LEAD_TIME_MIN_DAYS} to ${LEAD_TIME_DAYS} days`;

/** Milliseconds in a day. Named because `86400000` in an expression is
    how off-by-one date bugs get past review. */
const DAY_MS = 86_400_000;

/**
 * The concrete date an order placed at `orderedAt` is promised by.
 *
 * `leadDays` is passed in rather than read from LEAD_TIME_DAYS so callers
 * working with an existing order supply that order's OWN
 * `promised_ship_days` — the promise it was actually sold under. Only
 * quote-a-window callers should take the default.
 */
export function shipByDate(
  orderedAt: Date,
  leadDays: number = LEAD_TIME_DAYS
): Date {
  return new Date(orderedAt.getTime() + leadDays * DAY_MS);
}

/**
 * Format a promised ship date for a customer.
 *
 * Long month, no abbreviation: "4 December 2026" cannot be misread,
 * whereas 04/12/2026 means two different days either side of the
 * Atlantic. We ship to the US only (SHIPS_TO), but a buyer forwarding an
 * order to someone abroad is normal and costs nothing to be safe about.
 *
 * FIXED to en-GB and UTC deliberately. The default locale of whatever
 * runtime renders this — a Worker, a build machine, a browser — is not a
 * fact about the customer, and a date that renders differently in the
 * email and on the site is a support ticket. UTC because the stored value
 * is a DATE column with no time zone; parsing it in a local zone west of
 * UTC lands on the previous day.
 */
export function formatShipDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Soft form of a promised date: "Early December 2026".
 *
 * Chosen by the owner 2026-08-06 over the exact date, to feel less like
 * a hard commitment in the confirmation email.
 *
 * WHAT THIS COSTS, recorded so it is not re-litigated from scratch: a
 * month-part is a vaguer stated shipping time than a date, and vaguer
 * evidence in a "goods not received" dispute. It does NOT reduce the
 * obligation under 16 CFR 435.2 -- a stated window is still a stated
 * window, and the exact `promised_ship_date` remains on the order row.
 * So the seller keeps the duty and gives up some of the proof.
 *
 * THE PRECISE DATE MUST STILL BE USED where it does work: internal
 * queries, the day-150 refund deadline, and the delay notice, which has
 * to name the original date it is revising.
 *
 * Thirds of the month, not "beginning/middle/end" by week, because week
 * boundaries move against the calendar and readers do not think in them.
 */
export function formatShipEstimate(date: Date): string {
  const day = date.getUTCDate();
  const part = day <= 10 ? "Early" : day <= 20 ? "Mid" : "Late";
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return `${part} ${monthYear}`;
}

/**
 * `YYYY-MM-DD`, for the `promised_ship_date` DATE column.
 *
 * Hand-built from UTC parts rather than `toISOString().slice(0, 10)` —
 * that works today but silently depends on the value being UTC-midnight,
 * which is not guaranteed for a Date built by adding milliseconds to an
 * arbitrary order timestamp.
 */
export function toDateColumn(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parse a `YYYY-MM-DD` column value back to a Date at UTC midnight.
 *
 * `new Date("2026-12-04")` already parses as UTC midnight per spec, but
 * `new Date("2026-12-04T00:00:00")` does not, and the two are easy to
 * confuse. Explicit is cheaper than remembering which is which.
 */
export function fromDateColumn(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Whole days remaining until a promised date, from `now`. Negative once
 * the promise is missed — callers should treat `< 0` as "the 16 CFR
 * 435.2 revised-date notice is now owed", not as a display value.
 */
export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}
