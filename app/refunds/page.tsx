import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import {
  BRAND,
  CONTACT_EMAIL,
  GOVERNING_LAW,
  LEAD_TIME_DAYS,
  SHIPS_TO,
  formatPrice,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellations & refunds",
  description: `When a ${BRAND} preorder can be refunded. Preorders are final, with three exceptions: late shipment, an abandoned project, or an order that arrives damaged.`,
};

/* ============================================================
   /refunds — REINSTATED 2026-08-03, NARROWED 2026-08-04.

   It was deleted on 2026-07-29 "because there is nothing to refund".
   There is now. This page is not optional decoration:

     - The FTC Mail Order Rule (16 CFR 435) requires that when a stated
       ship window cannot be met, the seller offers a revised date AND an
       unconditional right to cancel for a full refund. The commitment has
       to exist somewhere a buyer can read it.
     - Card networks treat a clearly published, easily found refund policy
       as a factor in chargeback representment. A site that takes money and
       hides its cancellation terms loses those disputes.

   ─── WHAT CHANGED ON 2026-08-04, AND THE ARGUMENT AGAINST IT ───

   This page previously granted cancellation for any reason at any time
   before shipment. The owner narrowed it to final-sale-except-on-delay,
   after the trade-off was put to them and reaffirmed. Recording the
   losing argument because it does not stop being true:

     A generous refund policy on an unbuilt product from an unknown
     seller is not charity, it is chargeback insurance. A buyer who
     cannot get a refund from you goes to their card issuer instead.
     That costs the money AND the dispute fee, and with no adult named
     as seller of record those disputes are lost close to by default.
     The old policy cost nothing while order count was zero.

   ─── WHAT MAKES THE NEW POLICY ENFORCEABLE ───

   CONSPICUOUSNESS. A no-refund term the buyer cannot see before paying
   is routinely unenforceable; Cal. Civ. Code §1723 is the sharpest
   version — a retail seller whose refund policy is not conspicuously
   posted must accept returns for 30 days regardless of the stated
   policy. So "preorders are final" now renders at the point of sale,
   above the buy button, in PREORDER_NOTICE and in the /preorder
   disclosure block. NEVER move it below the fold to lift conversion:
   doing so is what would hand a buyer the very refund right this
   change was meant to remove.

   THE THREE EXCEPTIONS ARE FLOORS, NOT GENEROSITY. Delay is federal
   law and cannot be signed away. Abandonment is not a policy choice —
   keeping money for goods you know will never ship is conversion.
   Damaged/non-delivery is the basic bargain of paying for a thing.
   Do not narrow any of the three.
   ============================================================ */
export default function Refunds() {
  return (
    <LegalPage
      title="Cancellations & refunds"
      lastUpdated="4 August 2026"
      intro={
        <>
          <strong className="font-medium text-black">
            The whole policy in one sentence:
          </strong>{" "}
          preorders are final and there are no change-of-mind refunds,
          but if we miss the {LEAD_TIME_DAYS}-day window, abandon the project,
          or your order arrives damaged, you get the full {formatPrice()} back.
          Everything below is detail.
        </>
      }
    >
      <LegalSection heading="What you paid for">
        <p>
          A {BRAND} preorder is {formatPrice()}, shipping included, for a
          product that has not been built yet. No unit exists, nothing has been
          bench-tested or certified, and it takes AA batteries that are not
          included.
          You are funding a build, not buying from stock.
        </p>
        <p>
          We aim to ship in about {LEAD_TIME_DAYS} days from the date of your
          order. That is a target, and this page exists because targets are
          missed.
        </p>
      </LegalSection>

      <LegalSection heading="Preorders are final">
        <p>
          <strong className="font-semibold text-black">
            We do not offer change-of-mind refunds.
          </strong>{" "}
          Once you place a preorder, the money goes into building the product.
          If you simply decide you no longer want one, we are not able to
          return your {formatPrice()}, and you should not order on the
          assumption that you can change your mind later.
        </p>
        <p>
          Please be sure before you pay. If you are unsure whether this will
          fit your pack, whether the runtime is enough for your day, or whether
          we will pull it off at all. Join the notify list instead and
          wait. That option stays open and costs nothing.
        </p>
        <p>
          The three sections below are the exceptions, and they are not
          discretionary: we honour them whether or not you ask nicely, and
          whether or not it is convenient for us.
        </p>
      </LegalSection>

      <LegalSection heading="Exception 1: if we miss the shipping date">
        <p>
          If we cannot ship within about {LEAD_TIME_DAYS} days, we will email
          you before that window closes with a revised date. You can accept the
          new date or reply asking for a refund, and we will refund you in full.
          We will not ask you to justify the choice and we will not treat
          silence as consent to the delay.
        </p>
        <p>
          This is your right under the FTC Mail Order Rule (16 CFR 435). It is
          federal law, it cannot be signed away, and it is unaffected by the
          final-sale term above. To be completely plain about what that means:{" "}
          <strong className="font-semibold text-black">
            the moment we are late, a full refund becomes yours for the asking.
          </strong>
        </p>
        <p>
          Refunds under this section are issued within 5 business days of your
          email, back to the original card. Your bank then takes its own time to
          post it, typically 5 to 10 business days, which is outside our
          control.
        </p>
      </LegalSection>

      <LegalSection heading="Exception 2: if we never build it">
        <p>
          It is a real possibility and we would rather write it down than let
          you discover it. {BRAND} is a student project, this is our first
          hardware attempt, and there is engineering left that we may not
          solve, including getting two blowers to move enough air through a
          5mm channel to be worth carrying.
        </p>
        <p>
          If we conclude the product cannot be built, or we decide to stop, we
          will email every person who preordered and refund every order in full.
          We will not keep the money, and we will not convert it into store
          credit, a voucher, or a different product.
        </p>
      </LegalSection>

      <LegalSection heading="Exception 3: damaged, or never arrives">
        <p>
          If a unit arrives damaged, or does not arrive at all, email us within
          30 days of delivery (or of the expected delivery date) and we will
          replace it or refund it in full, including any return shipping we ask
          you to pay.
        </p>
        <p>
          We ship to {SHIPS_TO}. We are not offering a warranty beyond this, and
          we are not going to write one for a product that does not exist yet.
          A warranty term published today would be a commitment under the
          Magnuson-Moss Warranty Act made by people who cannot yet tell you what
          they are warranting.
        </p>
      </LegalSection>

      <LegalSection heading="Chargebacks">
        <p>
          You are entitled to dispute a charge with your bank and nothing here
          asks you to give that up. We would simply rather you email us first, because
          a refund from us takes days, while a chargeback takes months and gets
          you the same money.
        </p>
      </LegalSection>

      <LegalSection heading="How payments are handled">
        <p>
          Payments are processed by Stripe. Card details are entered on Stripe&rsquo;s
          own checkout page and never reach our servers, so we cannot see, store
          or charge your card ourselves. Refunds are issued through Stripe back
          to the same card.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          This policy is governed by the laws of {GOVERNING_LAW}. Nothing on
          this page limits any right you have under applicable consumer
          protection law that cannot be waived by agreement.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
