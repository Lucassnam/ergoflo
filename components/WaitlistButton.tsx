import Link from "next/link";

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
 * The only high-emphasis control on the site. Replaces ReserveButton, which
 * pointed at a Stripe Payment Link.
 *
 * WHY THERE IS NO CHECKOUT HERE — 2026-07-29:
 * ErgoFlo collects interest, not money. Two reasons, and both matter.
 *
 *   1. Consumer law. No payment means no FTC Mail Order Rule ship-window
 *      obligation, no refund policy to honour, no chargeback exposure, and
 *      no consumer contract for a product that does not exist yet.
 *
 *   2. Patent law. 35 U.S.C. §271(a) makes "offers to sell" an act of
 *      infringement in its own right — you do not have to ship anything.
 *      A competitor (Vaucluse Gear, US 11,779,097) holds a granted patent
 *      on a retrofit backpack ventilation spacer, and ErgoFlo has not yet
 *      had a freedom-to-operate opinion. Until it does, the site must not
 *      make a definite offer at a definite price.
 *
 * Do not reintroduce a price, a deposit, or a checkout link here without
 * that opinion in hand.
 */
export default function WaitlistButton({
  children = "Join the waitlist",
  size = "md",
  className = "",
}: Props) {
  return (
    <Link
      href="/notify"
      className={`glow-btn inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
