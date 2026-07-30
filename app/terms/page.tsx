import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import {
  BRAND,
  CONTACT_EMAIL,
  GOVERNING_LAW,
  LEGAL_ENTITY,
  LEGAL_NAME,
  NOT_AN_OFFER_NOTICE,
  NOT_A_COMPANY_NOTICE,
  NO_PARTNERSHIP_NOTICE,
  TARGETS_DISCLAIMER,
  TRADEMARK_NOTICE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `The terms that apply to using the ${BRAND} site and joining the waitlist.`,
};

const LAST_UPDATED = "29 July 2026";

/* ============================================================
   SITE & WAITLIST TERMS — rewritten 2026-07-29.

   This was Terms of Sale. It is no longer, because the site no longer
   sells anything: no deposit, no price, no ship window. Sections on
   payment, refunds, shipping and delivery were deleted rather than
   softened — a terms page that describes a sale on a site with no sale
   is worse than none, because it re-creates the expectation the pivot
   was meant to remove.

   NOT LEGAL ADVICE.

   What still does risk work here, in order of value:
     1. §2 — no offer, no sale, no reliance. The load-bearing section.
        Backs the §271(a) position that nothing here is an offer to sell.
     2. §5 and §7 — warranty disclaimer and liability cap, which matter
        because no entity exists to absorb a claim.
     3. §8 — arbitration + class waiver.
     4. §1 — no-entity / no-partnership clause. Both people building this
        are minors; the site asserts no business structure at all.
     5. §3 — pre-production disclosure, which is what makes the target
        figures defensible instead of deceptive.

   If commerce is ever reinstated, do NOT simply revert this file. Sale
   terms need to be re-drafted against whatever is actually being sold,
   and reviewed by an attorney — the product involves a lithium cell.
   ============================================================ */

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <strong className="font-semibold text-black">
            Nothing here is for sale.
          </strong>{" "}
          {BRAND} is a design in development. No finished unit exists, no
          battery cell has been selected, and nothing has been tested or
          certified. This site describes what we are trying to build and lets
          you leave an email address. It does not take orders, quote prices, or
          accept payment.
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
      </LegalSection>

      <LegalSection heading="2. No offer, no sale, no reliance">
        <p>{NOT_AN_OFFER_NOTICE}</p>
        <p>
          Joining the waitlist creates no contract, no reservation, no queue
          position, and no right to buy anything. It does not hold a price,
          because no price has been set. Neither you nor we owe the
          other anything as a result of it, and either side can walk away at any
          time without notice.
        </p>
        <p>
          Everything on this site is a description of work in progress. It may
          change entirely, and the product may never be built or sold. Please do
          not make any decision, purchase, or commitment in reliance on it.
        </p>
      </LegalSection>

      <LegalSection heading="3. Stage of development, and what the numbers mean">
        <p>
          {TARGETS_DISCLAIMER} Every figure published on this site — including
          cooling effect, runtime, noise level, weight, and fit range — is an
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

      <LegalSection heading="4. The waitlist">
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
        <p>
          {BRAND} is intended to contain a rechargeable lithium-ion cell.
          Lithium cells can overheat, vent, or catch fire if damaged, punctured,
          crushed, short-circuited, exposed to high heat, submerged, or charged
          with an unapproved charger. Stop using the product immediately and
          disconnect it if it becomes hot, swells, deforms, produces an odour,
          or is damaged.
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
          could cause harm. Do not modify it, open it, or replace its cell.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limits on our liability">
        <p className="uppercase">
          To the maximum extent permitted by law, our total liability to you, for all claims arising out of or relating to{" "}
          {BRAND}, this site, or these terms, will not exceed one hundred US
          dollars ($100) or the total amount you have actually paid us,
          whichever is greater. You have not paid us anything, because nothing
          here is for sale.
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
            Please read this section carefully — it affects how disputes get
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
