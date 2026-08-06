/* ============================================================
   Email layout shell.

   TABLES AND INLINE STYLES, DELIBERATELY. This is not 2010 nostalgia:
   Outlook desktop renders through Word's HTML engine, which has no
   flexbox, no grid, and drops <style> blocks in some configurations.
   Gmail strips <head> entirely on the web client. A layout that renders
   in a browser is not evidence it renders in an inbox. Do not
   "modernise" this to divs and a stylesheet.

   EVERY EMAIL SHIPS HTML *AND* PLAINTEXT. Not optional. A message with
   no text/plain part scores materially worse with spam filters, and this
   sequence sends to a cold list four months after the last contact --
   the exact profile that lands in spam. The plaintext part is also what
   screen readers and watch notifications use.

   ONE remote image: the logo. NO TRACKING PIXEL, ever. The distinction
   is not cosmetic. A logo is content the reader may choose to load; a
   tracking pixel reports back when they opened it, which /privacy
   promises this site does not do. Adding one here would make that page
   false.

   THE LOGO MUST BE DECORATIVE ONLY. Gmail, Outlook and Apple Mail all
   block remote images by default for a sender the recipient has not
   corresponded with, which is every first-time buyer. So the email has
   to carry its full meaning with images off: the wordmark stays as live
   text next to it, and no fact appears only inside an image. Never put
   the order number, the total, or the ship date in one.

   Data URIs are not an alternative -- Gmail strips them. A hosted URL is
   the only thing that works broadly.
   ============================================================ */

/** Absolute URL, necessarily -- an email has no origin to resolve a
    relative path against. Served from public/logo.png by the Pages
    deploy. If the domain ever moves, this moves with it.

    alt is deliberately EMPTY (alt="") rather than "ErgoFlo": the
    wordmark sits beside it as live text, so alt text here would make a
    screen reader announce the brand twice. Empty alt is the correct
    markup for a decorative image, not an oversight. */
const LOGO_URL = "https://ergoflo.tech/logo.png";

/** Near-black on white. Mirrors the site's light theme without importing
    Tailwind tokens, which do not exist in an email context. */
const FG = "#111111";
const MUTED = "#666666";
const RULE = "#e5e5e5";
const ACCENT = "#0891b2";

export interface ShellOptions {
  /** Sits in the inbox preview line next to the subject. If omitted the
      client scrapes the first body text, which is usually the logo alt
      text or a greeting -- wasted space at the only moment the recipient
      decides whether to open. */
  preheader: string;
  bodyHtml: string;
  /** Rendered small and grey under the rule. Legal notices go here. */
  footerHtml: string;
}

export function renderShell({
  preheader,
  bodyHtml,
  footerHtml,
}: ShellOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#f6f6f6;">
<!-- Preheader. Hidden visually, read by the inbox list. The nbsp run
     after it stops Gmail pulling the first body line in behind it. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    preheader
  )}${"&nbsp;&zwnj;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f6;">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid ${RULE};border-radius:12px;">
        <tr>
          <td style="padding:28px 28px 0 28px;">
            <!-- Two cells, not flexbox: Outlook desktop renders through
                 Word and has no flex. width/height as HTML ATTRIBUTES as
                 well as CSS, because Outlook ignores CSS sizing on img
                 and would otherwise draw the source at 512px. -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;font-weight:700;letter-spacing:-0.01em;color:${FG};vertical-align:middle;">ErgoFlo</td>
                <td align="right" style="vertical-align:middle;">
                  <img src="${LOGO_URL}" width="32" height="32" alt=""
                       style="display:block;width:32px;height:32px;border:0;outline:none;text-decoration:none;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 8px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:${FG};">
${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 28px 28px;">
            <div style="border-top:1px solid ${RULE};margin-bottom:16px;"></div>
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
${footerHtml}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** A labelled row in the order-detail block. */
export function detailRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:5px 0;font-size:13px;color:${MUTED};vertical-align:top;width:150px;">${escapeHtml(
    label
  )}</td>
  <td style="padding:5px 0;font-size:13px;color:${FG};vertical-align:top;font-weight:600;">${escapeHtml(
    value
  )}</td>
</tr>`;
}

/** The one visually emphasised fact in the confirmation. See the comment
    on the ship date in confirmation.ts for why it gets this treatment. */
export function calloutHtml(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;">
  <tr><td style="padding:14px 16px;background:#f0fafb;border-left:3px solid ${ACCENT};border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(
      label
    )}</div>
    <div style="font-size:19px;font-weight:700;color:${FG};padding-top:3px;">${escapeHtml(
      value
    )}</div>
  </td></tr>
</table>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 13px 0;">${escapeHtml(text)}</p>`;
}

/**
 * MANDATORY on every interpolation into HTML.
 *
 * Not a theoretical concern here: shipping_name and the address columns
 * come from whatever the buyer typed into Stripe Checkout. An apostrophe
 * in "O'Brien" or an ampersand in a company name breaks the markup; a
 * `<` breaks more than that. Escaping at the point of interpolation is
 * the only version of this that survives someone adding a field later.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
