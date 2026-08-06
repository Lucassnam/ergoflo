/* ============================================================
   Receipt — proof of payment.

   DELIBERATELY SEPARATE FROM THE CONFIRMATION, and deliberately boring.
   A receipt answers one question: what was I charged, by whom, for what,
   on what date. It is the document a buyer files, forwards to a parent,
   or attaches to a dispute. Every sentence that is not a fact about the
   transaction makes it worse at that job.

   The confirmation answers a different question -- what happens next,
   and when. Mixing the two is why most order emails are bad: the buyer
   who wants the amount has to hunt past the shipping prose, and the
   buyer who wants the date has to hunt past the accounting.

   NO CARD DETAILS, AND NONE CAN BE ADDED. Card data never reaches this
   origin -- checkout is hosted by Stripe, so the PAN is entered on
   checkout.stripe.com. The preorders table stores no card columns by
   design; the migration that created it says card_last4 and card_brand
   are the only card facts that would ever be safe and neither is needed.
   Storing any part of a card number would drag this project from PCI
   SAQ-A (a questionnaire) to SAQ-D (a full audit). "Paid by card via
   Stripe" is the whole truth we hold.

   NO TAX LINE. No tax is configured or collected on the Payment Link, so
   a "Tax $0.00" row would assert something about tax treatment that
   nobody has decided. If tax collection is ever switched on in Stripe,
   add the row here in the same change.
   ============================================================ */

import { BRAND, CONTACT_EMAIL, SITE_URL } from "../../../../lib/site";
import type { PreorderRow, RenderedEmail } from "../types";
import { renderShell, escapeHtml } from "./shell";

const FG = "#111111";
const MUTED = "#666666";
const RULE = "#e5e5e5";

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/** Date the charge was made. Long month for the same reason as the ship
    date -- 04/12/2026 means two different days either side of the
    Atlantic, and a receipt is exactly the document that gets forwarded. */
function formatPaidDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** One row of the money table. `strong` marks the total line. */
function moneyRow(label: string, value: string, strong = false): string {
  const weight = strong ? "700" : "400";
  const border = strong ? `border-top:1px solid ${RULE};` : "";
  return `<tr>
  <td style="padding:8px 0;${border}font-size:14px;color:${
    strong ? FG : MUTED
  };font-weight:${weight};">${escapeHtml(label)}</td>
  <td style="padding:8px 0;${border}font-size:14px;color:${FG};font-weight:${weight};text-align:right;">${escapeHtml(
    value
  )}</td>
</tr>`;
}

export function renderReceipt(order: PreorderRow): RenderedEmail {
  const ref = order.order_number ?? order.id.slice(0, 8).toUpperCase();
  const total = formatMoney(order.amount_cents, order.currency);
  const paidOn = formatPaidDate(order.created_at);
  const productName =
    order.terms_snapshot?.product_name ?? `${BRAND} Flopack V1 panel`;

  /* No em dash, per the house rule from commit df48982. */
  const subject = `Receipt for your ${BRAND} order, ${ref}`;

  const billedTo = [order.shipping_name, order.email]
    .filter(Boolean)
    .join(" · ");

  const bodyHtml = [
    `<p style="margin:0 0 4px 0;font-size:17px;font-weight:600;">Receipt</p>`,
    `<p style="margin:0 0 18px 0;font-size:13px;color:${MUTED};">Order ${escapeHtml(
      ref
    )} · Paid ${escapeHtml(paidOn)}</p>`,

    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
${moneyRow(productName, total)}
${moneyRow("Shipping", "Free")}
${moneyRow("Total paid", total, true)}
</table>`,

    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px 0;">
  <tr>
    <td style="padding:3px 0;font-size:13px;color:${MUTED};width:110px;vertical-align:top;">Billed to</td>
    <td style="padding:3px 0;font-size:13px;color:${FG};vertical-align:top;">${escapeHtml(
      billedTo
    )}</td>
  </tr>
  <tr>
    <td style="padding:3px 0;font-size:13px;color:${MUTED};vertical-align:top;">Payment</td>
    <td style="padding:3px 0;font-size:13px;color:${FG};vertical-align:top;">Card, via Stripe</td>
  </tr>
</table>`,
  ].join("\n");

  const footerHtml = [
    `<p style="margin:0 0 9px 0;">Keep this for your records. Your order confirmation, sent separately, has the estimated ship date.</p>`,
    `<p style="margin:0 0 9px 0;">${escapeHtml(
      BRAND
    )} is a student project, not a company. Questions? Reply here or write to <a href="mailto:${CONTACT_EMAIL}" style="color:#0891b2;">${CONTACT_EMAIL}</a>.</p>`,
    `<p style="margin:0;"><a href="${SITE_URL}/terms" style="color:#666666;">Terms</a> · <a href="${SITE_URL}/refunds" style="color:#666666;">Refunds</a> · <a href="${SITE_URL}/privacy" style="color:#666666;">Privacy</a></p>`,
  ].join("\n");

  const text = [
    `RECEIPT`,
    `Order ${ref} · Paid ${paidOn}`,
    ``,
    `${productName}${" ".repeat(Math.max(1, 34 - productName.length))}${total}`,
    `Shipping                          Free`,
    `------------------------------------------`,
    `Total paid                        ${total}`,
    ``,
    `Billed to: ${billedTo}`,
    `Payment:   Card, via Stripe`,
    ``,
    `---`,
    `Keep this for your records. Your order confirmation, sent separately,`,
    `has the estimated ship date.`,
    ``,
    `${BRAND} is a student project, not a company.`,
    `Questions? Reply here or write to ${CONTACT_EMAIL}.`,
    ``,
    `${SITE_URL}/terms · ${SITE_URL}/refunds · ${SITE_URL}/privacy`,
  ].join("\n");

  return {
    subject,
    html: renderShell({
      preheader: `${total} paid on ${paidOn} · order ${ref}`,
      bodyHtml,
      footerHtml,
    }),
    text,
  };
}
