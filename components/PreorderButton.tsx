import Link from "next/link";
import { PREORDERS_ENABLED, formatPrice } from "@/lib/site";

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
 * The only high-emphasis control on the site. Replaces WaitlistButton,
 * which replaced an earlier ReserveButton — this is the third swing at the
 * same question and the history is worth knowing before the fourth.
 *
 * WHAT THIS BUTTON DOES NOT DO: it does not start a charge. It links to
 * /preorder, where the price, the ship window and the refund right are all
 * stated before anyone reaches a payment field. That indirection is
 * deliberate. A one-click buy button in a sticky header, for an unbuilt
 * product, is how you end up arguing about whether the disclosures were
 * conspicuous.
 *
 * THE RISK THIS BUTTON CARRIES — 2026-08-03. Reinstating a price was an
 * owner decision that overrode, rather than resolved, the 2026-07-29
 * removal. 35 U.S.C. §271(a) makes an "offer to sell" an act of patent
 * infringement on its own, nothing has to ship, and a competitor (Vaucluse
 * Gear, US 11,779,097) holds a granted patent on a retrofit backpack
 * ventilation spacer. No freedom-to-operate opinion exists. A definite
 * product at a definite price is exactly the act the statute reaches.
 * See the commerce block in lib/site.ts and
 * docs/plans/2026-08-03-preorder-commerce.md.
 */
export default function PreorderButton({
  children,
  size = "md",
  className = "",
}: Props) {
  /* Never advertise a price on a control that cannot complete a purchase.
     While preorders are closed this reads as a waitlist CTA and points at
     /notify, which works. A "$49.99" button leading to a dead end is worse
     than no button. */
  const label =
    children ??
    (PREORDERS_ENABLED ? `Preorder · ${formatPrice()}` : "Join the waitlist");

  /* DELIBERATELY /preorder AND NOT STRIPE_LINK, even when a payment link
     is configured. This button appears in the header, the hero and the
     final CTA — places with no disclosure text near them. Sending someone
     from a hero button straight to a Stripe payment page means they can
     complete a $49.99 purchase without ever passing the "no unit exists"
     block, and that block is the whole basis for calling this a disclosed
     preorder rather than a deceptive one.

     /preorder is where the disclosure lives, and it is one extra click.
     Do not "optimise" this into a direct Stripe link. */
  return (
    <Link
      href={PREORDERS_ENABLED ? "/preorder" : "/notify"}
      className={`glow-btn inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap ${sizes[size]} ${className}`}
    >
      {label}
    </Link>
  );
}
