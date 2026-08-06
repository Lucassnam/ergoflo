/* ============================================================
   ONE-OFF BACKFILL for orders taken before the pipeline existed.

   Four sales completed on Stripe while `preorders` did not exist as a
   table, so those customers are invisible to every part of this system:
   no order record, no promised date, no email, and no coverage by the
   day-30/60/90 updates or the delay notice. This script pulls them from
   Stripe, writes them into `preorders` as if the webhook had run, and
   queues their receipt and confirmation.

   IT IS A DRY RUN BY DEFAULT. Nothing is written and nothing is sent
   without explicit flags, because the far end of this is four real
   people who paid real money and an email cannot be recalled:

     (no flags)   print exactly what would happen, per customer
     --commit     insert the preorders rows and queue the emails
     --send       drain the queue and actually send

   Run it with no flags first and read the output. Every time.

   WHY IT RECONSTRUCTS TERMS PER ORDER RATHER THAN USING TODAY'S:
   REFUND_POLICY changed on 2026-08-04. A buyer is owed the terms they
   agreed to at checkout, not the ones on the site by the time the email
   goes out, and tightening a refund right retroactively is both
   unenforceable and the fact pattern that loses a chargeback. Each row
   gets the policy that was in force at ITS created_at.
   ============================================================ */

import { readFileSync } from "node:fs";
import {
  REFUND_POLICY,
  NOT_A_COMPANY_NOTICE,
  SELLER_OF_RECORD,
  BRAND,
} from "../../../lib/site";
import { shipByDate, toDateColumn, SHIP_WINDOW_PHRASE } from "../../../lib/shipping";
import { renderReceipt } from "./templates/receipt";
import { renderConfirmation } from "./templates/confirmation";
import { sendEmail } from "./resend";
import type { PreorderRow, TermsSnapshot } from "./types";

/* ---- The policy boundary. ------------------------------------------
   `REFUND_POLICY` was introduced in its current narrow form in commit
   df48982, 2026-08-04 09:48:48 -0700, which is also the commit that
   first put the live Stripe link on the site. So the site has never
   shown a buy button beside the older, more generous policy.

   The older wording is preserved here because the payment link URL works
   independently of the site: anyone who was sent it directly before that
   commit could have paid while the generous policy was the only one
   published. If Stripe shows no order before this instant, this branch
   never fires and that is the expected outcome.

   Text is verbatim from the "WHAT THIS REPLACED" block in lib/site.ts.
   Do not paraphrase it. It is the contract those buyers accepted. */
const POLICY_CHANGE_AT = Date.parse("2026-08-04T09:48:48-07:00");

const OLD_REFUND_POLICY =
  `Cancel any time before your order ships and we refund the full $49.99, ` +
  `no questions asked and no restocking fee.`;

const ORDER_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Same shape as the webhook's, so a backfilled order is indistinguishable
    from a live one. */
function generateOrderNumber(now: Date): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
  let suffix = "";
  for (const b of bytes) suffix += ORDER_ALPHABET[b % 32];
  return `EF-${yy}${mm}-${suffix}`;
}

function termsFor(orderedAt: Date): TermsSnapshot {
  const wasBeforeChange = orderedAt.getTime() < POLICY_CHANGE_AT;
  return {
    refund_policy: wasBeforeChange ? OLD_REFUND_POLICY : REFUND_POLICY,
    not_a_company_notice: NOT_A_COMPANY_NOTICE,
    ship_window_phrase: SHIP_WINDOW_PHRASE,
    seller_of_record: SELLER_OF_RECORD,
    product_name: `${BRAND} FlowPack V1 panel`,
  };
}

interface StripeShipping {
  name?: string | null;
  address?: Record<string, string | null> | null;
}

interface StripeSession {
  id: string;
  created: number;
  payment_status?: string | null;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  customer_email?: string | null;
  collected_information?: { shipping_details?: StripeShipping | null } | null;
  shipping_details?: StripeShipping | null;
}

function envValue(file: string, name: string): string {
  const v = readFileSync(file, "utf8").match(
    new RegExp(`^${name}=(.+)$`, "m")
  )?.[1];
  if (!v) throw new Error(`${name} not found in ${file}`);
  return v.trim();
}

async function listPaidSessions(stripeKey: string): Promise<StripeSession[]> {
  const out: StripeSession[] = [];
  let startingAfter: string | undefined;

  /* Paginate properly even though there are four. A backfill that
     silently truncates at the page boundary is the kind of bug that is
     invisible until the fifth customer complains. */
  for (;;) {
    const params = new URLSearchParams({ limit: "100", status: "complete" });
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Stripe-Version": "2024-06-20",
        },
      }
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string; type?: string };
      } | null;
      throw new Error(
        `Stripe ${res.status}: ${body?.error?.message ?? body?.error?.type ?? "unknown"}`
      );
    }
    const page = (await res.json()) as {
      data: StripeSession[];
      has_more: boolean;
    };
    out.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1].id;
  }

  /* A complete session is not necessarily a paid one: delayed payment
     methods complete as unpaid and settle later. Same guard the webhook
     applies before recording an order. */
  return out.filter((s) => s.payment_status === "paid");
}

function toRow(s: StripeSession): Record<string, unknown> & { _order: PreorderRow } {
  const orderedAt = new Date(s.created * 1000);
  const shipping =
    s.collected_information?.shipping_details ?? s.shipping_details ?? null;
  const addr = shipping?.address ?? null;
  const email = (s.customer_details?.email ?? s.customer_email ?? "")
    .trim()
    .toLowerCase();

  const promisedDays = 120;
  const orderNumber = generateOrderNumber(orderedAt);
  const promisedShipDate = toDateColumn(shipByDate(orderedAt, promisedDays));
  const terms = termsFor(orderedAt);

  const row = {
    stripe_session_id: s.id,
    stripe_payment_intent: s.payment_intent ?? null,
    email,
    shipping_name: shipping?.name ?? s.customer_details?.name ?? null,
    shipping_line1: addr?.line1 ?? null,
    shipping_line2: addr?.line2 ?? null,
    shipping_city: addr?.city ?? null,
    shipping_state: addr?.state ?? null,
    shipping_postal_code: addr?.postal_code ?? null,
    shipping_country: addr?.country ?? null,
    amount_cents: s.amount_total ?? 0,
    currency: s.currency ?? "usd",
    promised_ship_days: promisedDays,
    order_number: orderNumber,
    promised_ship_date: promisedShipDate,
    terms_snapshot: terms,
    status: "paid",
    /* Preserve the real order time. Without this the row defaults to
       now(), every backfilled order looks like it was placed today, and
       the age-based milestone queries fire on the wrong dates. */
    created_at: orderedAt.toISOString(),
  };

  /* The in-memory shape the templates render from, so the dry run shows
     the actual email rather than an approximation of it. */
  const order: PreorderRow = {
    id: "(assigned on insert)",
    order_number: orderNumber,
    email,
    shipping_name: row.shipping_name,
    shipping_line1: row.shipping_line1,
    shipping_line2: row.shipping_line2,
    shipping_city: row.shipping_city,
    shipping_state: row.shipping_state,
    shipping_postal_code: row.shipping_postal_code,
    shipping_country: row.shipping_country,
    amount_cents: row.amount_cents,
    currency: row.currency,
    promised_ship_days: promisedDays,
    promised_ship_date: promisedShipDate,
    terms_snapshot: terms,
    status: "paid",
    created_at: row.created_at,
  };

  return { ...row, _order: order };
}

async function main() {
  const envFile = process.argv[2];
  if (!envFile) throw new Error("usage: backfill <env-file> [--commit] [--send]");
  const commit = process.argv.includes("--commit");
  const send = process.argv.includes("--send");

  const stripeKey = envValue(envFile, "STRIPE_RESTRICTED_KEY");
  const supabaseUrl = envValue(envFile, "SUPABASE_URL");
  const supabaseKey = envValue(envFile, "SUPABASE_SECRET_KEY");
  const resendKey = envValue(envFile, "RESEND_API_KEY");

  const sessions = await listPaidSessions(stripeKey);
  console.log(`Stripe: ${sessions.length} paid session(s)\n`);

  const rows = sessions
    .map(toRow)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

  for (const r of rows) {
    const o = r._order;
    const old = o.terms_snapshot?.refund_policy === OLD_REFUND_POLICY;
    console.log("─".repeat(64));
    console.log(`${o.order_number}  ${o.email}`);
    console.log(`  ordered      ${o.created_at}`);
    console.log(`  amount       ${(o.amount_cents / 100).toFixed(2)} ${o.currency}`);
    console.log(`  ship by      ${o.promised_ship_date}`);
    console.log(
      `  shipping to  ${[o.shipping_name, o.shipping_line1, o.shipping_city, o.shipping_state, o.shipping_postal_code]
        .filter(Boolean)
        .join(", ") || "(none captured)"}`
    );
    console.log(`  terms        ${old ? "OLD (pre 2026-08-04, generous)" : "current"}`);
    if (!o.shipping_line1) {
      console.log(`  WARNING      no shipping address on this session`);
    }
  }
  console.log("─".repeat(64));

  if (!commit) {
    console.log("\nDRY RUN. Nothing written, nothing sent.");
    console.log("Re-run with --commit to insert, then --send to email.");
    return;
  }

  for (const r of rows) {
    const { _order, ...insert } = r;
    const res = await fetch(`${supabaseUrl}/rest/v1/preorders`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(insert),
    });
    const body = (await res.json().catch(() => null)) as
      | Array<{ id?: string }>
      | { code?: string }
      | null;

    if (!res.ok) {
      const code = (body as { code?: string })?.code;
      /* Already backfilled. Makes re-running safe, which matters because
         the first run is the one most likely to be interrupted. */
      console.log(
        `${_order.order_number}  ${code === "23505" ? "already present, skipped" : `INSERT FAILED ${code ?? res.status}`}`
      );
      continue;
    }

    const id = (body as Array<{ id?: string }>)?.[0]?.id;
    console.log(`${_order.order_number}  inserted ${id}`);

    if (send && id) {
      for (const [kind, email] of [
        ["receipt", renderReceipt({ ..._order, id })],
        ["confirmation", renderConfirmation({ ..._order, id })],
      ] as const) {
        const r2 = await sendEmail({
          apiKey: resendKey,
          from: "ErgoFlo <hello@ergoflo.tech>",
          replyTo: "hello@ergoflo.tech",
          to: _order.email,
          email,
          idempotencyKey: `backfill-${id}-${kind}`,
        });
        console.log(`    ${kind.padEnd(13)} ${r2.ok ? `sent ${r2.id}` : `FAILED ${r2.error}`}`);

        /* Record it, so the outbox reflects reality and a later drain
           cannot send these a second time. */
        await fetch(`${supabaseUrl}/rest/v1/email_outbox`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            order_id: id,
            kind,
            status: r2.ok ? "sent" : "failed",
            sent_at: r2.ok ? new Date().toISOString() : null,
            resend_id: r2.id ?? null,
            last_error: r2.ok ? null : (r2.error ?? "unknown"),
          }),
        });
      }
    }
  }
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
});
