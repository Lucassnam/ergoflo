/* ============================================================
   Day 0 — order confirmation.

   The only email in the sequence that must never be delayed, and the one
   that carries the most legal weight. Read
   docs/plans/2026-08-06-transactional-email.md §3.1 before editing the
   content: every block below is there for a stated reason and several of
   them are obligations, not copy.

   WHAT THIS EMAIL IS FOR, IN ORDER OF IMPORTANCE:
     1. Putting a CONCRETE SHIP DATE in the buyer's hands. Everything else
        here exists on the website too; this does not. It is what a buyer
        checks against in four months and it is the document Stripe asks
        for when a "goods not received" dispute is filed. On a 120-day
        lead time it is the single most valuable line in the sequence.
     2. Restating the refund terms THIS buyer bought under.
     3. Echoing the shipping address early enough for a typo to be fixed
        on day 0 rather than discovered on day 120.

   IT IS NOT A RECEIPT. Stripe's own receipt covers the charge descriptor
   and the card. Both are sent; they do different jobs.
   ============================================================ */

import {
  BRAND,
  CONTACT_EMAIL,
  SITE_URL,
  REFUND_POLICY,
  NOT_A_COMPANY_NOTICE,
  SELLER_OF_RECORD,
} from "../../../../lib/site";
import {
  fromDateColumn,
  formatShipEstimate,
  LEAD_TIME_RANGE_PHRASE,
} from "../../../../lib/shipping";
import type { PreorderRow, RenderedEmail, TermsSnapshot } from "../types";
import {
  renderShell,
  detailRow,
  calloutHtml,
  paragraph,
  escapeHtml,
} from "./shell";

/**
 * Terms for this order, snapshot first.
 *
 * The fallback to today's constants exists only for rows written before
 * terms_snapshot existed. It is deliberately NOT the primary path: the
 * whole point of the column is that the site's legal copy changes between
 * the order and the email. If this fallback ever starts firing for new
 * orders, the webhook has stopped writing the snapshot -- fix that rather
 * than relying on this.
 */
function orderTerms(order: PreorderRow): Required<TermsSnapshot> {
  const s = order.terms_snapshot ?? {};
  return {
    refund_policy: s.refund_policy ?? REFUND_POLICY,
    not_a_company_notice: s.not_a_company_notice ?? NOT_A_COMPANY_NOTICE,
    ship_window_phrase:
      s.ship_window_phrase ?? `about ${order.promised_ship_days} days`,
    seller_of_record: s.seller_of_record ?? SELLER_OF_RECORD,
    product_name: s.product_name ?? `${BRAND} FlowPack V1 panel`,
  };
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/** Address as the buyer typed it into Stripe. Echoed so a typo surfaces
    on day 0. Blank lines dropped -- line2 is usually absent and an empty
    line reads as a rendering bug. */
function addressLines(order: PreorderRow): string[] {
  const cityLine = [order.shipping_city, order.shipping_state]
    .filter(Boolean)
    .join(", ");
  return [
    order.shipping_name,
    order.shipping_line1,
    order.shipping_line2,
    [cityLine, order.shipping_postal_code].filter(Boolean).join(" ").trim(),
    order.shipping_country,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

/**
 * Who took the money.
 *
 * SELLER_OF_RECORD is empty while no adult 18+ holds the Stripe account
 * (lib/site.ts) -- both operators are minors whose contracts are voidable
 * under Cal. Family Code §6710. /terms already renders a blocking notice
 * about this next to a working buy button.
 *
 * A confirmation email has to say who a buyer paid. When the constant is
 * empty this renders the same notice rather than quietly omitting the
 * question, because omitting it is the one option that is actually
 * dishonest. Fill SELLER_OF_RECORD in and this swaps itself out.
 * Do NOT silence it by putting a minor's name in the constant.
 */
function sellerLine(sellerOfRecord: string): string {
  return sellerOfRecord ? `This order was taken by ${sellerOfRecord}.` : "";
}

export function renderConfirmation(order: PreorderRow): RenderedEmail {
  const terms = orderTerms(order);
  const ref = order.order_number ?? order.id.slice(0, 8).toUpperCase();
  const money = formatMoney(order.amount_cents, order.currency);
  const address = addressLines(order);

  /* A missing promised_ship_date should be impossible -- the webhook
     computes it on insert. Falling back to the relative window is still
     better than rendering "Invalid Date" into a legal notice. */
  /* The buyer sees the soft form ("Early December 2026"). The exact date
     stays on the order row and is what the delay notice, the day-150
     refund deadline and any dispute response cite. Do not "simplify"
     this by dropping promised_ship_date. */
  const shipBy = order.promised_ship_date
    ? formatShipEstimate(fromDateColumn(order.promised_ship_date))
    : null;
  const shipByText = shipBy ?? `in ${terms.ship_window_phrase}`;

  const greeting = order.shipping_name
    ? `Hi ${order.shipping_name.split(" ")[0]},`
    : "Hi,";

  /* No em dash. House rule from the 2026-08-04 humanizing pass (commit
     df48982, pattern rules from github.com/blader/humanizer): zero em/en
     dashes in rendered copy, verified against output rather than source.
     Subject lines are rendered copy. */
  const subject = `Your ${BRAND} order is confirmed, ${ref}`;

  /* ---- HTML ---- */

  const detailsTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 6px 0;">
${detailRow("Order number", ref)}
${detailRow("Item", terms.product_name)}
${detailRow("Amount charged", `${money}, shipping included`)}
${detailRow("Shipping to", address.join(", ") || "Not provided")}
</table>`;

  const bodyHtml = [
    `<p style="margin:0 0 13px 0;font-size:17px;font-weight:600;">${escapeHtml(
      greeting
    )}</p>`,
    /* The unbuilt-product disclosure is folded into this sentence rather
       than standing alone. As a separate line it read as a warning label;
       attached to the ship date it reads as an explanation, which is what
       it actually is. The fact itself stays: a buyer must not be able to
       finish this email thinking a finished product is in a box
       somewhere. */
    paragraph(
      `Thanks for backing this. Your order is in and we've charged your ` +
        `card ${money}. Our lead time is ${LEAD_TIME_RANGE_PHRASE}, and ` +
        `we'll send you updates as we build.`
    ),
    detailsTable,
    /* THE CALLOUT. This is the reason the email exists; it gets the only
       piece of visual emphasis in the message. Do not add a second
       callout -- two emphasised things is zero emphasised things. */
    calloutHtml("Estimated ship date", shipByText),
    /* Rewritten 2026-08-06. The explicit refund offer is GONE at the
       owner's instruction, after the trade-off was put to them twice.

       WHAT REPLACED IT AND WHY IT IS NOT NOTHING: the promise to notify
       before the date passes survives, because that is the half doing
       the protective work. If the date slips, 16 CFR 435.2 obliges the
       revised-date notice anyway, and a buyer who was told up front
       reads it as the seller keeping their word rather than as bad news
       from nowhere. Paired with the concrete date above it is also the
       evidence Stripe asks for in a "goods not received" dispute, which
       matters more than usual while SELLER_OF_RECORD is empty.

       What is gone is only the volunteered refund, which was reading as
       an invitation in the message a buyer sees while they are happiest
       about the purchase. The refund right itself is unchanged and lives
       on /refunds, linked in the footer.

       Do not remove the "you'll hear it from us before it passes" half. */
    /* The updates promise moved up into the opening paragraph, so this
       one carries only the notify-on-slip half. Saying "we'll send you
       updates" twice in a nine-line email reads like a template with a
       merge bug. */
    paragraph(
      `If that date ever moves, you'll hear it from us before it passes.`
    ),
    /* Concrete and specific, not a closing flourish. The humanizer rules
       this repo follows treat manufactured punchlines and aphorism
       formulas as the tell; a plain true detail is what reads as a
       person. Every claim here is already on /about and in the FAQ. */
    paragraph(
      `We're students and this is our first hardware project. Yours is one ` +
        `of the first we're making.`
    ),
    `<p style="margin:16px 0 0 0;">The ${escapeHtml(BRAND)} team</p>`,
  ].join("\n");

  /* Trimmed 2026-08-06 from four blocks to three short lines.
     WHAT WAS REMOVED, so it is a decision on the record rather than a
     silent deletion:
       - REFUND_POLICY reproduced verbatim in the body (~60 words). Now a
         one-line statement of the final-sale rule plus a link. The rule
         itself is a deterrent and is kept; the enumerated exceptions are
         what read as a menu, and they live on /refunds.
       - NOT_A_COMPANY_NOTICE in full (~60 words). Compressed to its
         load-bearing clause. The full text remains on /terms and on
         /privacy, and the buyer accepted it at checkout.
       - The seller-of-record paragraph, which volunteered an immediate
         unconditional refund and directly contradicted "preorders are
         final" two paragraphs above. Gone entirely; sellerLine() now
         renders only when an adult IS named.
     None of these are required to appear in a confirmation email. The
     stated ship window and the terms acceptance both happen at the point
     of sale, which is what 16 CFR 435.2 and the ToS consent turn on. */
  const footerHtml = [
    sellerLine(terms.seller_of_record)
      ? `<p style="margin:0 0 9px 0;">${escapeHtml(
          sellerLine(terms.seller_of_record)
        )}</p>`
      : "",
    `<p style="margin:0 0 9px 0;">Preorders are final, with the exceptions set out in our <a href="${SITE_URL}/refunds" style="color:#0891b2;">refund policy</a>. ${escapeHtml(
      BRAND
    )} is a student project, not a company.</p>`,
    `<p style="margin:0 0 9px 0;">Questions, or address wrong? Reply here or write to <a href="mailto:${CONTACT_EMAIL}" style="color:#0891b2;">${CONTACT_EMAIL}</a>.</p>`,
    `<p style="margin:0;"><a href="${SITE_URL}/terms" style="color:#666666;">Terms</a> · <a href="${SITE_URL}/refunds" style="color:#666666;">Refunds</a> · <a href="${SITE_URL}/privacy" style="color:#666666;">Privacy</a></p>`,
    /* No unsubscribe link, deliberately. This is a transactional message
       about a purchase the recipient made, which CAN-SPAM treats
       differently from commercial mail. Adding an unsubscribe implies
       they can opt out of hearing about their own order -- and if they
       did, we would be unable to send the delay notice that 16 CFR 435.2
       requires. The marketing list at /notify is separate and DOES need
       one. */
  ].join("\n");

  /* ---- Plaintext ----
     Not a stripped-tags afterthought. Same facts, same order, readable on
     its own -- this is what a watch notification and a screen reader get. */

  const text = [
    greeting,
    ``,
    `Thanks for backing this. Your order is in and we've charged your card`,
    `${money}. Our lead time is ${LEAD_TIME_RANGE_PHRASE}, and we'll send you`,
    `updates as we build.`,
    ``,
    `Order number:   ${ref}`,
    `Item:           ${terms.product_name}`,
    `Amount charged: ${money} (shipping included)`,
    `Shipping to:    ${address.join(", ") || "Not provided"}`,
    ``,
    `ESTIMATED SHIP DATE: ${shipByText.toUpperCase()}`,
    ``,
    `If that date ever moves, you'll hear it from us before it passes.`,
    ``,
    `We're students and this is our first hardware project. Yours is one of`,
    `the first we're making.`,
    ``,
    `The ${BRAND} team`,
    ``,
    `---`,
    /* Filter drops the empty string when no seller is named, so the
       plaintext does not ship a stray blank line. */
    ...[sellerLine(terms.seller_of_record)].filter(Boolean),
    `Preorders are final, with the exceptions set out at ${SITE_URL}/refunds.`,
    `${BRAND} is a student project, not a company.`,
    ``,
    `Questions, or address wrong? Reply here or write to ${CONTACT_EMAIL}.`,
    ``,
    `${SITE_URL}/terms · ${SITE_URL}/refunds · ${SITE_URL}/privacy`,
  ].join("\n");

  return {
    subject,
    html: renderShell({
      /* Preheader carries the ship date, so the buyer sees the one fact
         that matters from the inbox list without opening. */
      preheader: shipBy
        ? `${ref}. Estimated ship ${shipBy}.`
        : `${ref}. Confirmed.`,
      bodyHtml,
      footerHtml,
    }),
    text,
  };
}
