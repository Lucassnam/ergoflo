import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import {
  BRAND,
  CONTACT_EMAIL,
  GOVERNING_LAW,
  LEGAL_ENTITY,
  LEGAL_NAME,
  LEAD_TIME_DAYS,
  NOT_A_COMPANY_NOTICE,
  NO_PARTNERSHIP_NOTICE,
  PREORDER_NOTICE,
  REFUND_POLICY,
  SELLER_OF_RECORD,
  SHIPS_TO,
  TARGETS_DISCLAIMER,
  TRADEMARK_NOTICE,
  formatPrice,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `The terms that apply to using the ${BRAND} site and to preordering.`,
};

const LAST_UPDATED = "4 August 2026";

/* ============================================================
   SITE & PREORDER TERMS — rewritten 2026-08-03.

   HISTORY, BECAUSE IT MATTERS. This file was Terms of Sale until
   2026-07-29, when commerce was removed and the sale sections were
   deleted rather than softened. The version standing here yesterday
   opened "Nothing here is for sale" and its §2 was titled "No offer, no
   sale, no reliance". That file carried an explicit instruction:

     "If commerce is ever reinstated, do NOT simply revert this file.
      Sale terms need to be re-drafted against whatever is actually being
      sold, and reviewed by an attorney — the product involves a lithium
      cell."

   Commerce was reinstated on 2026-08-03. The first half was honoured:
   §2 is re-drafted against what is actually sold ($49.99, prepaid, ~120
   day window) rather than reverted from git. THE SECOND HALF HAS NOT
   BEEN. No attorney has reviewed this page. That is the single largest
   unmitigated risk on the site and it should not be papered over.

   NOT LEGAL ADVICE.

   What does risk work here, in order of value:
     1. §2 — terms of sale: price, ship window, cancellation. Now the
        load-bearing section, and the one an attorney must see first.
     2. §5 and §7 — warranty disclaimer and liability cap, which matter
        far MORE now than they did as a waitlist, because money has
        changed hands and no entity exists to absorb a claim.
     3. §8 — arbitration + class waiver.
     4. §1 — no-entity / no-partnership clause. Both people building this
        are minors, which is a live problem for a site taking payment:
        a minor's contracts are voidable under Cal. Family Code §6710, so
        the buyer's counterparty may not be bound by any of this.
     5. §3 — pre-production disclosure, which is what makes the target
        figures defensible instead of deceptive.
   ============================================================ */

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <strong className="font-semibold text-black">
            You can preorder this, and it does not exist yet.
          </strong>{" "}
          {BRAND} is a design in development. No finished unit exists, nothing
          has been tested or certified, and it takes AA batteries that are
          not included. A preorder is {formatPrice()} charged today, shipping
          included, for delivery in about {LEAD_TIME_DAYS} days.{" "}
          <strong className="font-semibold text-black">
            Preorders are final, and there are no change-of-mind refunds.
          </strong>{" "}
          If we miss that window you can take a full refund instead of waiting.
        </>
      }
    >
      <LegalSection heading="1. Who you are dealing with">
        <p>
          {NOT_A_COMPANY_NOTICE} There is no company, corporation, or limited
          liability company behind {BRAND}, and nothing on this site should be
          read as claiming otherwise.
        </p>
        <p>{NO_PARTNERSHIP_NOTICE}</p>
        {/* Renders only once an adult 18+ is named in SELLER_OF_RECORD.
            While it is empty the blocking notice below renders instead —
            deliberately, because a sale with no party of full capacity on
            the seller's side is the thing a buyer most needs told. */}
        {SELLER_OF_RECORD ? (
          <p>
            Orders placed through this site are accepted by{" "}
            {SELLER_OF_RECORD}, who is the seller of record for every
            preorder and the party responsible for fulfilling or refunding it.
          </p>
        ) : (
          <p>
            <strong className="font-semibold text-black">
              Read this before you pay us anything.
            </strong>{" "}
            No adult is currently named as the seller of record, and the people
            who run {BRAND} are under 18. Under California law a minor&rsquo;s
            contract is voidable, which means these terms may not bind us in
            the way you would expect them to bind an ordinary seller. We are
            telling you this rather than hiding it. If that is not a risk you
            want to take, do not preorder. Join the notify list
            instead, and we will write to you when an adult is named here.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="2. Terms of sale">
        <p>{PREORDER_NOTICE}</p>
        <p>
          <strong className="font-semibold text-black">Price.</strong>{" "}
          {formatPrice()} in US dollars, charged in full when you order.
          Shipping is included and there are no other fees. Any sales tax, if
          applicable, is shown at checkout before you pay.
        </p>
        <p>
          <strong className="font-semibold text-black">Shipping window.</strong>{" "}
          We aim to ship within about {LEAD_TIME_DAYS} days of your order, to{" "}
          {SHIPS_TO}. That is a target on a product that has not been built. If
          we cannot meet it, we will email you before the window closes with a
          revised date, and you may either accept it or cancel for a full
          refund. You do not have to give a reason, and we will not treat your
          silence as agreement to a delay.
        </p>
        <p>
          <strong className="font-semibold text-black">Cancellation.</strong>{" "}
          {REFUND_POLICY} The full policy is at{" "}
          <Link href="/refunds" className="text-black underline underline-offset-4">
            Refunds
          </Link>
          , and it forms part of these terms.
        </p>
        <p>
          <strong className="font-semibold text-black">Payment.</strong>{" "}
          Payments are processed by Stripe. Card details are entered on
          Stripe&rsquo;s checkout and never reach our servers; we cannot see or
          store your card number. Placing an order forms a contract for the
          sale of one unit on these terms and no others. It does not
          entitle you to any particular production slot, revision, or feature
          described on this site.
        </p>
        {/* ADDED 2026-08-04. There was no eligibility clause at all, which is
            a real gap for this product specifically: it is aimed at students,
            a large share of whom are under 18. A minor's purchase is voidable
            (Cal. Family Code §6710), meaning they can disaffirm and demand
            their money back regardless of what any policy says, and a card
            used without the holder's permission produces an unauthorised-use
            chargeback, which is the most expensive kind to lose.

            This clause does not make either problem go away. What it does is
            put the buyer on notice, give a documented basis for cancelling an
            order placed on someone else's card, and evidence that the seller
            asked. Do not delete it to reduce friction at checkout. */}
        <p>
          <strong className="font-semibold text-black">Who may order.</strong>{" "}
          You must be at least 18 to place an order yourself. If you are under
          18, ask a parent or guardian to place it, using their own payment
          card and with their permission. We would rather have one
          order fewer than a card used without its owner&rsquo;s knowledge. We
          may cancel and refund any order we believe was placed by a minor
          without a parent or guardian&rsquo;s consent, or on a card the buyer
          was not authorised to use.
        </p>
        <p>
          Everything on this site is a description of work in progress. It may
          change entirely, and the product may never be built. If we conclude it
          cannot be, we will refund every order in full rather than substitute a
          different product or issue credit.
        </p>
      </LegalSection>

      <LegalSection heading="3. Stage of development, and what the numbers mean">
        <p>
          {TARGETS_DISCLAIMER} Every figure published on this site, including
          cooling effect, runtime, noise level, weight, and fit range, is an
          engineering target derived from component specifications. None of them
          is a measured result, a promise, or a warranted specification.
        </p>
        <p>
          {BRAND} holds no product certifications. We make no claim of FCC, CE,
          UN38.3, IEC 62133, or IP-rating compliance, and we publish no
          ingress-protection rating because the product has never been through
          ingress testing.
        </p>
        <p>
          Final units may differ from any image, render, or diagram on this
          site, and from the targets above.
        </p>
      </LegalSection>

      <LegalSection heading="4. The notify list">
        <p>
          If you give us your email address, we store it so we can write to you
          if {BRAND} becomes something you can actually buy. What we collect,
          who processes it, how long we keep it and how to have it deleted are
          set out in the{" "}
          <Link href="/privacy" className="text-black underline underline-offset-4">
            Privacy Policy
          </Link>
          , which forms part of these terms.
        </p>
        <p>
          Please use your own email address. Do not submit anyone else&rsquo;s,
          and do not use automated means to submit addresses in bulk.
        </p>
      </LegalSection>

      <LegalSection heading="5. No warranty">
        <p className="uppercase">
          To the maximum extent permitted by law, this site and everything on it
          is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
          without warranty of any kind. We disclaim all implied
          warranties, including the implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
        <p>
          No warranty is offered on any future product, and no statement on this
          site should be read as creating one. Some jurisdictions do not allow
          the exclusion of implied warranties, so this exclusion may not apply
          to you in full.
        </p>
      </LegalSection>

      <LegalSection heading="6. Safety, if this ever becomes a product">
        {/* REWRITTEN 2026-08-04 when the design dropped the rechargeable
            lithium cell for a user-filled AA compartment. The previous text
            warned at length about lithium venting, swelling and thermal
            runaway — hazards this product no longer has, and warning about
            absent hazards while omitting the real ones is worse than useless.

            KEEP THE BATTERY SECTION EVEN THOUGH AA IS SAFER. Alkaline cells
            still leak, and mixing old with new or different chemistries can
            still overheat a pack. If a rechargeable cell is ever reintroduced,
            restore the lithium warnings from git — and note that product
            liability insurance stops being optional at the same moment. */}
        <p>
          {BRAND} takes standard AA batteries, which you supply and install
          yourself. It does not contain a rechargeable lithium cell and does
          not ship with batteries of any kind. Use cells of the same type,
          brand and charge level together, do not mix old with new, do not
          attempt to recharge non-rechargeable cells, and remove the batteries
          if you are not going to use the product for a while. Alkaline
          cells can leak and damage the compartment.
        </p>
        <p>
          Stop using the product and remove the batteries if it becomes hot,
          rattles, produces an odour, or is physically damaged.
        </p>
        <p>
          <strong className="font-semibold text-black">
            Keep batteries away from small children.
          </strong>{" "}
          Swallowed batteries cause serious internal injury. If a battery is
          swallowed, seek immediate medical attention.
        </p>
        <p>
          {BRAND} is not a medical device. It is not intended to diagnose,
          treat, cure, or prevent any condition, and it is not a treatment for
          heat illness, hyperhidrosis, or any other medical condition. It is not
          intended for use by children, or for anyone who cannot recognise and
          respond to overheating.
        </p>
        <p>
          Do not rely on this product in any situation where a cooling failure
          could cause harm. Do not modify it or open it beyond the battery
          compartment.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limits on our liability">
        {/* THE LAST SENTENCE USED TO READ: "You have not paid us anything,
            because nothing here is for sale." That went false the moment the
            Stripe link went live, and it was sitting inside the liability cap
            — the one clause you least want a court reading as sloppy or
            inaccurate, because an unconscionability argument starts exactly
            there. Rewritten 2026-08-04. If commerce is ever removed, this
            sentence has to change back with it. */}
        <p className="uppercase">
          To the maximum extent permitted by law, our total liability to you, for all claims arising out of or relating to{" "}
          {BRAND}, this site, or these terms, will not exceed one hundred US
          dollars ($100) or the total amount you have actually paid us,
          whichever is greater.
        </p>
        <p>
          If you have preordered, that means the cap is at least the{" "}
          {formatPrice()} you paid. Nothing in this section limits your right
          to a refund under our{" "}
          <Link href="/refunds" className="text-black underline underline-offset-4">
            Refund Policy
          </Link>
          , which is a separate promise and is not capped by this clause.
        </p>
        <p className="uppercase">
          Neither we nor any contributor will be liable for indirect,
          incidental, special, consequential, exemplary, or punitive damages, or
          for lost profits, lost data, or loss of use, even if advised of the
          possibility.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited by law.
          In particular, under California Civil Code §1668 a business cannot
          contract away liability for fraud, wilful injury, or violation of law,
          and we do not attempt to. This section does not exclude liability for
          death or personal injury caused by negligence.
        </p>
      </LegalSection>

      <LegalSection heading="8. Disputes, arbitration, and class action waiver">
        <p>
          <strong className="font-semibold text-black">
            Please read this section carefully. It affects how disputes get
            resolved and limits your options.
          </strong>
        </p>
        <p>
          If something goes wrong, email {CONTACT_EMAIL} first. Most problems
          are faster to fix directly than through any formal process, and we ask
          for 30 days to try.
        </p>
        <p>
          If we cannot resolve it, you and we agree that any dispute
          arising out of or relating to {BRAND} or these terms will be resolved
          by binding individual arbitration, administered under the consumer
          rules of a recognised arbitration provider, rather than in court. You
          may instead bring an individual claim in small claims court if it
          qualifies, and nothing here stops you from reporting a concern to a
          government agency.
        </p>
        <p className="uppercase">
          You and we each waive the right to a jury trial and the
          right to participate in a class action, class arbitration, or
          representative proceeding. Claims may be brought only in an individual
          capacity.
        </p>
        <p>
          If the class action waiver above is found unenforceable as to a
          particular claim, that claim proceeds in court and the rest of this
          section still applies to all other claims.
        </p>
      </LegalSection>

      <LegalSection heading="9. Governing law">
        <p>
          These terms are governed by the laws of {GOVERNING_LAW}, without
          regard to conflict of law rules. Where arbitration does not apply, the
          courts located in California have exclusive jurisdiction.
        </p>
      </LegalSection>

      <LegalSection heading="10. Third-party names">
        <p>{TRADEMARK_NOTICE}</p>
      </LegalSection>

      <LegalSection heading="11. Changes to these terms">
        <p>
          We may update these terms. The version that applies to your
          reservation is the version published on the date you placed it, and we
          will email you if a change materially affects an order you have
          already placed. The &ldquo;last updated&rdquo; date at the top of this
          page always reflects the current version.
        </p>
        <p>
          If any provision of these terms is found unenforceable, the rest
          remains in effect.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
