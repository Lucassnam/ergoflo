"use client";

import { STRIPE_LINK, isStripeLive } from "@/lib/site";

type Props = {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-[13px] px-4 py-2",
  md: "text-[15px] px-6 py-3",
  lg: "text-[16px] px-8 py-4",
} as const;

/**
 * The only high-emphasis control on the site. Until a real Stripe Payment
 * Link is pasted into lib/site.ts, clicking it explains what's missing
 * instead of dumping the user on a broken Stripe page.
 */
export default function ReserveButton({
  children = "Reserve — $15",
  size = "md",
  className = "",
}: Props) {
  return (
    <a
      href={isStripeLive ? STRIPE_LINK : "/#reserve"}
      onClick={(e) => {
        if (!isStripeLive) {
          e.preventDefault();
          window.alert(
            "Checkout isn't wired up yet.\n\nPaste your Stripe Payment Link into STRIPE_LINK in lib/site.ts to go live."
          );
        }
      }}
      className={`glow-btn inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap ${sizes[size]} ${className}`}
    >
      {children}
    </a>
  );
}
