import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { BRAND, CONTACT_EMAIL, LEGAL_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What ${BRAND} collects, why, who processes it, and how to have it deleted.`,
};

const LAST_UPDATED = "29 July 2026";

/* ============================================================
   PRIVACY POLICY — drafted 2026-07-29.

   Scope is deliberately tiny, and the policy says so, because the honest
   version of this document is short. The site collects one thing: an
   email address, plus an optional product-interest tag, plus a
   timestamp. There is no analytics, no advertising pixel, no session
   cookie, and no tracking of any kind — so this policy says that plainly
   instead of reserving rights "we may" exercise later. Reserved rights
   you never use are how a short honest policy turns into a long
   suspicious one.

   IF THAT CHANGES — if analytics, a pixel, a chat widget, or any
   third-party script is added — this page must be updated in the same
   commit, and a cookie notice becomes necessary. California's CCPA/CPRA
   applies here because the operator is California-based.
   ============================================================ */

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <strong className="font-semibold text-black">The short version.</strong>{" "}
          If you give us your email, we store it so we can tell you when{" "}
          {BRAND} is ready. That is the only personal information this site
          collects. We do not run analytics, advertising, or tracking of any
          kind, we never sell your data, and you can have it deleted by asking.
        </>
      }
    >
      <LegalSection heading="What we collect">
        <p>
          <strong className="font-semibold text-black">
            If you join the notify list:
          </strong>{" "}
          your email address, which product you expressed interest in if you
          arrived from a specific link, and the date and time you signed up.
          That is all.
        </p>
        <p>
          <strong className="font-semibold text-black">
            There is no checkout:
          </strong>{" "}
          nothing on this site is for sale, so we never collect payment details,
          billing details, or a shipping address. No payment processor is
          involved and no card data touches this site at any point.
        </p>
        <p>
          <strong className="font-semibold text-black">What we do not do:</strong>{" "}
          no analytics, no advertising pixels, no third-party trackers, no
          session or advertising cookies, no fingerprinting, and no profile
          building. This site sets no cookies of its own.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          To email you when {BRAND} is ready to order, and to fulfil and support
          any reservation you place. Nothing else.
        </p>
        <p>
          If you join the notify list, expect one email at launch. We are not
          running a newsletter and will not add you to one without asking you
          first.
        </p>
      </LegalSection>

      <LegalSection heading="Who else processes it">
        <p>
          <strong className="font-semibold text-black">Supabase</strong> hosts
          the database that stores notify-list email addresses, as our
          processor.
        </p>
        <p>
          <strong className="font-semibold text-black">Vercel</strong> hosts this
          site and processes standard server request logs, including IP
          addresses, as part of operating and protecting it.
        </p>
        <p>
          We do not sell, rent, or share your personal information with anyone
          else, and we have never done so.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Waitlist emails are kept until you ask us to remove you, or until the
          launch they were collected for has happened and the list is no longer
          needed — whichever comes first. If the product is abandoned, the list
          is deleted.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          Email {CONTACT_EMAIL} from the address you signed up with and we will
          action any of the following, free of charge:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Tell you exactly what we hold about you.</li>
          <li>Delete it.</li>
          <li>Correct it.</li>
          <li>Send you a copy of it.</li>
          <li>Remove you from the notify list.</li>
        </ul>
        <p>
          We aim to respond within 5 business days, and will not treat you
          differently for exercising any of these rights.
        </p>
        <p>
          If you are a California resident, the California Consumer Privacy Act
          as amended by the CPRA gives you rights to know, delete, correct, and
          opt out of the sale or sharing of your personal information, and the
          right not to be discriminated against for exercising them. We do not
          sell or share personal information as those terms are defined, so
          there is no opt-out to offer — but the other rights are exercised the
          same way, by emailing the address above.
        </p>
      </LegalSection>

      <LegalSection heading="Security, stated honestly">
        <p>
          Email addresses are stored in a database that is not readable from the
          browser, writes are rate-limited, and credentials are held as
          server-side secrets that are never exposed to the page.
        </p>
        <p>
          No system is perfectly secure, and {BRAND} is a small operation run by
          one person. We are not going to claim a level of protection we cannot
          guarantee. Please do not send us information you would not want
          disclosed, and never send payment details by email — we will never ask
          for them that way.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          This site is not directed to children under 13, and we do not
          knowingly collect their personal information. If you believe a child
          has given us their email address, email {CONTACT_EMAIL} and we will
          delete it.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If this policy changes, the date at the top of the page changes with
          it. If we ever start collecting something new — analytics included —
          this page will say so before it happens. {LEGAL_NAME} is responsible
          for this policy.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
