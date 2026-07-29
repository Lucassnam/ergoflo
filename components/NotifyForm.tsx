"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

export default function NotifyForm({ product }: { product: string | null }) {
  const [email, setEmail] = useState("");
  /* Honeypot. Never shown to a human, so a non-empty value means a bot.
     The server returns an ordinary success for these — see the route. */
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rim rounded-2xl bg-neutral-50 px-8 py-10">
        <p className="headline text-xl text-black">You&rsquo;re on the list.</p>
        <p className="mt-2 text-[14.5px] text-neutral-600">
          We&rsquo;ll email you the moment it&rsquo;s ready. One email, nothing
          else. Reply to it any time to be removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        {/* Honeypot. aria-hidden + tabIndex -1 keeps it away from screen
            readers and keyboard users; a real person can never fill it. It is
            positioned off-screen rather than display:none, because some bots
            skip fields that are display:none. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="notify-website">Leave this field empty</label>
          <input
            id="notify-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <label htmlFor="notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          required
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
          {status === "loading" ? "Submitting…" : "Notify me"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-3 text-[13.5px] text-red-600">{errorMsg}</p>
      )}

      {/* Consent disclosure, at the point of collection rather than buried in
          the privacy policy. States the scope (one email), the exit (reply to
          be removed), and that this is not an order. */}
      <p className="mt-4 text-left text-[12.5px] leading-relaxed text-neutral-500">
        We store your email address and nothing else, and we&rsquo;ll use it to
        send you one message if this becomes a real product. Reply to be
        removed at any time. This is a waitlist, not an order &mdash; nothing
        is for sale. See our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-black">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
