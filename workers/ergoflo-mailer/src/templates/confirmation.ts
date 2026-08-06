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
import { fromDateColumn, formatShipDate } from "../../../../lib/shipping";
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
  return sellerOfRecord
    ? `This order was taken by ${sellerOfRecord}.`
    : `No adult is currently named as the seller of record for ${BRAND}. ` +
        `We are telling you this because you have paid money and you are ` +
        `entitled to know who holds it. If that is not acceptable, reply to ` +
        `this email and we will refund you in full immediately, no questions asked.`;
}

export function renderConfirmation(order: PreorderRow): RenderedEmail {
  const terms = orderTerms(order);
  const ref = order.order_number ?? order.id.slice(0, 8).toUpperCase();
  const money = formatMoney(order.amount_cents, order.currency);
  const address = addressLines(order);

  /* A missing promised_ship_date should be impossible -- the webhook
     computes it on insert. Falling back to the relative window is still
     better than rendering "Invalid Date" into a legal notice. */
  const shipBy = order.promised_ship_date
    ? formatShipDate(fromDateColumn(order.promised_ship_date))
    : null;
  const shipByText = shipBy ?? `in ${terms.ship_window_phrase}`;

  const greeting = order.shipping_name
    ? `Hi ${order.shipping_name.split(" ")[0]},`
    : "Hi,";

  const subject = `Your ${BRAND} preorder is confirmed — ${ref}`;

  /* ---- HTML ---- */

  const detailsTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 6px 0;">
${detailRow("Order number", ref)}
${detailRow("Item", terms.product_name)}
${detailRow("Amount charged", `${money} — shipping included`)}
${detailRow("Shipping to", address.join(", ") || "—")}
</table>`;

  const bodyHtml = [
    `<p style="margin:0 0 13px 0;font-size:17px;font-weight:600;">${escapeHtml(
      greeting
    )}</p>`,
    paragraph(
      `Your preorder is confirmed and your card has been charged ${money}. ` +
        `You are funding a build, not buying from stock — the ${BRAND} panel ` +
        `has not been manufactured yet.`
    ),
    detailsTable,
    /* THE CALLOUT. This is the reason the email exists; it gets the only
       piece of visual emphasis in the message. Do not add a second
       callout -- two emphasised things is zero emphasised things. */
    shipBy
      ? calloutHtml("We will ship your order by", shipBy)
      : calloutHtml("Expected to ship", shipByText),
    paragraph(
      `That date is a commitment, not an estimate. If we cannot meet it we ` +
        `will email you a revised date before it passes, and you can either ` +
        `accept the new date or take a full refund. That choice is yours ` +
        `alone and nothing is required of you to exercise it.`
    ),
    `<p style="margin:18px 0 6px 0;font-weight:600;">Your refund terms</p>`,
    paragraph(terms.refund_policy),
    paragraph(
      `Check the shipping address above now. It is far easier to correct ` +
        `today than in four months — just reply to this email.`
    ),
    paragraph(`Thank you for backing this. It genuinely matters to us.`),
    `<p style="margin:16px 0 0 0;">— The ${escapeHtml(BRAND)} team</p>`,
  ].join("\n");

  const footerHtml = [
    `<p style="margin:0 0 9px 0;">${escapeHtml(
      sellerLine(terms.seller_of_record)
    )}</p>`,
    `<p style="margin:0 0 9px 0;">${escapeHtml(terms.not_a_company_notice)}</p>`,
    `<p style="margin:0 0 9px 0;">Questions, address changes, or a refund request: reply to this email or write to <a href="mailto:${CONTACT_EMAIL}" style="color:#0891b2;">${CONTACT_EMAIL}</a>.</p>`,
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
    `Your preorder is confirmed and your card has been charged ${money}.`,
    `You are funding a build, not buying from stock - the ${BRAND} panel has`,
    `not been manufactured yet.`,
    ``,
    `Order number:   ${ref}`,
    `Item:           ${terms.product_name}`,
    `Amount charged: ${money} (shipping included)`,
    `Shipping to:    ${address.join(", ") || "-"}`,
    ``,
    `WE WILL SHIP YOUR ORDER BY: ${shipByText.toUpperCase()}`,
    ``,
    `That date is a commitment, not an estimate. If we cannot meet it we will`,
    `email you a revised date before it passes, and you can either accept the`,
    `new date or take a full refund. That choice is yours alone and nothing is`,
    `required of you to exercise it.`,
    ``,
    `YOUR REFUND TERMS`,
    terms.refund_policy,
    ``,
    `Check the shipping address above now. It is far easier to correct today`,
    `than in four months - just reply to this email.`,
    ``,
    `Thank you for backing this. It genuinely matters to us.`,
    ``,
    `- The ${BRAND} team`,
    ``,
    `---`,
    sellerLine(terms.seller_of_record),
    ``,
    terms.not_a_company_notice,
    ``,
    `Questions, address changes, or a refund request: reply to this email`,
    `or write to ${CONTACT_EMAIL}.`,
    ``,
    `${SITE_URL}/terms · ${SITE_URL}/refunds · ${SITE_URL}/privacy`,
  ].join("\n");

  return {
    subject,
    html: renderShell({
      /* Preheader carries the ship date, so the buyer sees the one fact
         that matters from the inbox list without opening. */
      preheader: shipBy
        ? `${ref} — we will ship by ${shipBy}.`
        : `${ref} — confirmed.`,
      bodyHtml,
      footerHtml,
    }),
    text,
  };
}
