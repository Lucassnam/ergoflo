"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CONTACT_EMAIL,
  LEAD_TIME_DAYS,
  PREORDERS_ENABLED,
  STRIPE_LINK,
  formatPrice,
} from "@/lib/site";

type Status = "idle" | "loading" | "error";

/* ============================================================
   The only control on the site that takes money.

   IT COLLECTS AN EMAIL AND NOTHING ELSE. No card field, no name, no
   address. All of that is entered on checkout.stripe.com after the
   redirect, which is what keeps this project in PCI SAQ-A — the lightest
   compliance tier, a self-assessment questionnaire rather than an audit.
   The moment a card number is typed into an input served from this
   origin, that changes to SAQ-D. Do not add a card field, and do not
   embed Stripe Elements here to make it "feel more integrated".

   THE AMOUNT IS NOT SENT TO THE SERVER. functions/api/checkout.ts
   hardcodes it. If you ever find yourself adding `amount` to the body
   below, stop: it would let anyone buy this for one cent by editing the
   request in devtools.
   ============================================================ */
export default function PreorderCheckout() {
  const [email, setEmail] = useState("");
  /* Honeypot, same pattern as NotifyForm. Off-screen rather than
     display:none because some bots skip display:none fields. */
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "We couldn't start checkout. Try again.");
        setStatus("error");
        return;
      }

      /* A honeypot hit returns ok:true with url:null. Leave the button in
         its loading state and do nothing — a bot must not be able to tell
         acceptance from rejection by watching the UI either. */
      if (!data.url) return;

      /* Full navigation, not router.push: this leaves the origin entirely.
         Assigning href rather than using <form action> is also why the CSP
         in public/_headers needs no `form-action` entry for Stripe. */
      window.location.href = data.url;
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("error");
    }
  };

  /* Rendered while PREORDERS_ENABLED is false. Deliberately NOT a
     disabled-looking buy button: showing a price with a dead button reads
     as a broken shop. This says plainly that ordering is not open and
     routes to the thing that does work. */
  if (!PREORDERS_ENABLED) {
    return (
      <div className="rim rounded-2xl bg-neutral-50 px-7 py-8">
        <p className="headline text-[19px] text-black">Preorders aren&rsquo;t open yet.</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-neutral-600">
          The checkout is built and tested, but we&rsquo;re not taking money
          until the people behind it can lawfully take it. Leave your email and
          we&rsquo;ll write to you the day that changes.
        </p>
        <Link
          href="/notify"
          className="glow-btn mt-5 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium tracking-tight"
        >
          Notify me instead
        </Link>
      </div>
    );
  }

  /* ROUTE A — a Stripe Payment Link is configured, so there is nothing
     for us to do but send the buyer to it. No email field: Stripe
     collects the email, the name and the shipping address on its own
     page, and asking for the email twice is friction that buys nothing.
     The disclosure paragraph below still renders, because it has to be
     read BEFORE the click, not after it on Stripe's page. */
  if (STRIPE_LINK) {
    return (
      <div>
        <a
          href={STRIPE_LINK}
          className="glow-btn inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium tracking-tight whitespace-nowrap"
        >
          Preorder · {formatPrice()}
        </a>
        <Disclosure />
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="preorder-website">Leave this field empty</label>
          <input
            id="preorder-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <label htmlFor="preorder-email" className="sr-only">
          Email address
        </label>
        <input
          id="preorder-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full border border-neutral-200 bg-white px-5 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="glow-btn inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium tracking-tight whitespace-nowrap disabled:opacity-60"
        >
          {status === "loading"
            ? "Opening checkout…"
            : `Preorder · ${formatPrice()}`}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3 text-[13.5px] text-red-600">{errorMsg}</p>
      )}

      <Disclosure />
    </div>
  );
}

/* ============================================================
   Point-of-sale disclosure. ONE copy, rendered by BOTH checkout routes
   — that is the entire reason it is a component rather than inline JSX.
   When this lived inside the form only, adding the Stripe Payment Link
   path silently produced a buy button with no disclosure next to it.

   Every clause is doing a job:

     - "has not been built yet" defeats the reasonable-consumer
       expectation that a priced buy button implies stock on a shelf.
       This is the single most important sentence on the page.
     - The charge amount and the ship window appear at the point of
       payment, not only in Terms — the FTC Mail Order Rule cares about
       what the buyer was told when they paid.
     - The assent sentence must stay adjacent to the button. Notice plus
       an act of assent is what makes /terms clickwrap rather than
       browsewrap; browsewrap is routinely unenforceable, and it would
       take the arbitration clause and class-action waiver down with it.

   Do not render a buy control anywhere without this underneath it.
   ============================================================ */
function Disclosure() {
  return (
    <p className="mt-4 text-left text-[12.5px] leading-relaxed text-neutral-500">
      This is a preorder for a product that has not been built yet. You will
      be charged {formatPrice()} today, shipping included, and we aim to ship
      in about {LEAD_TIME_DAYS} days.{" "}
      {/* "Batteries not included" is a POINT-OF-SALE disclosure, not a spec
          footnote. Failing to disclose that a required component is absent is
          a straightforward FTC deception problem, and it is also how you
          generate angry email on day one. Keep it above the fold, next to the
          price, in the same paragraph the buyer must read to reach the
          button. */}
      <strong className="font-semibold text-neutral-700">
        Batteries are not included: it takes AA cells you supply.
      </strong>{" "}
      <strong className="font-semibold text-neutral-700">
        Preorders are final, with no change-of-mind refunds.
      </strong>{" "}
      If we miss the {LEAD_TIME_DAYS}-day window you can take a full refund
      instead of waiting, and you are refunded in full if we abandon the
      project or your order arrives damaged. Questions before you buy go to{" "}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="underline underline-offset-4 hover:text-black"
      >
        {CONTACT_EMAIL}
      </a>
      . Card details go straight to Stripe and never reach our servers. By
      preordering you agree to our{" "}
      <Link href="/terms" className="underline underline-offset-4 hover:text-black">
        Terms
      </Link>
      ,{" "}
      <Link href="/refunds" className="underline underline-offset-4 hover:text-black">
        Refund Policy
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline underline-offset-4 hover:text-black">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
