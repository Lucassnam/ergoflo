# Transactional email for preorders — plan

**Date:** 2026-08-06
**Status:** AWAITING APPROVAL — no code has been changed.
**Requested:** a sale confirmation email, and on discussion, the full long-lead-time
sequence: confirmation, periodic production updates, address re-confirmation, shipping
notice, delay notice.
**Decided already:** Resend as the sending provider. Plan before code.

---

## 0. Three findings that change the job before anything else

### 0.1 The webhook that would send the email does not currently run

There are two Stripe paths in this repo and only one executes.

| | Route A — Payment Link | Route B — Checkout Session API |
|---|---|---|
| Switch | `STRIPE_LINK` non-empty (`lib/site.ts:279`) → `PREORDERS_ENABLED` derives true (`lib/site.ts:288`) | `PREORDERS_ENABLED` hardcoded `false` (`functions/api/checkout.ts:43`) |
| State | **LIVE. Real cards.** | **DEAD.** |
| Writes to `preorders` | No | Yes |

Pages Functions are bundled separately from the Next app and cannot import `@/lib`, so
four constants are mirrored by hand into `functions/api/checkout.ts` (its header says so
at lines 36–42). The two `PREORDERS_ENABLED` values are unrelated variables that happen
to share a name. Route B being off is why nothing reaches Supabase today.

**This does not require enabling Route B.** `functions/api/stripe-webhook.ts` is
path-agnostic — Payment Links also emit `checkout.session.completed`. Registering that
endpoint in the Stripe dashboard makes it fire for Route A, giving order rows and a send
trigger while checkout stays on the simpler hosted link.

Two things Route A will not supply that the handler already tolerates:

- `metadata[promised_ship_days]` is absent. `stripe-webhook.ts:224` falls back to `120`.
  Correct today, and it is why that fallback exists — but it means the promise recorded
  against an order comes from a constant in a file, not from the transaction. If
  `LEAD_TIME_DAYS` ever changes, orders taken on Route A before the change are recorded
  under the *new* number. **Route A cannot keep per-order promises accurately.** See §7.1.
- `consent_collection[terms_of_service]` is set in code at `checkout.ts:209` but that code
  does not run. On Route A it must be configured on the Payment Link by hand.

### 0.2 Stripe cannot refund past 180 days, and your promise is 120

Stripe refunds a card charge for **up to 180 days** after the payment
([docs.stripe.com/refunds](https://docs.stripe.com/refunds)). `LEAD_TIME_DAYS` is 120
(`lib/site.ts:307`).

That leaves a 60-day margin between the promised ship date and the point where refunding
to the original card stops being possible. `REFUND_POLICY` (`lib/site.ts:353-358`) promises
a full refund on delay, on abandonment, and on damage or non-delivery — obligations with no
expiry date. A slip of two months past the promise puts the project in the position of owing
refunds it cannot execute through Stripe, and having to send cheques or bank transfers to
people whose addresses may have changed.

This is not an email problem, but the email sequence is where it becomes visible or doesn't.
Concretely, it means the **day-100 checkpoint is not optional and is not really about
addresses** — it is the last point at which a delay can be declared while every buyer can
still be refunded normally. Treat day 150 as a hard internal deadline: any order not shipped
by then either ships or gets refunded, while the mechanism still works.

### 0.3 The cancellation policy in the email must be the real one

The user-supplied sequence outline says to "include your cancellation policy" and implies a
buyer can cancel. **That is not the current policy.** `REFUND_POLICY` was deliberately
narrowed on 2026-08-04 to all-sales-final with three carve-outs — delay, abandonment, damage
or non-delivery (`lib/site.ts:312-358`). The previous wording was "cancel any time before
your order ships".

The confirmation email must render `REFUND_POLICY` verbatim from `lib/site.ts`, not a
paraphrase and not the older, friendlier version. An email promising a cancellation right the
site does not offer creates that right for that buyer.

**Action before any email ships:** confirm whether any orders were taken between the payment
link going live (~2026-08-03) and the policy narrowing (2026-08-04). Buyers in that window
bought under "cancel any time" and keep those terms — they need the old policy text in their
email, or a manual note. Query: `select id, created_at from preorders order by created_at;`
If the webhook was never registered, that table is empty and the Stripe dashboard is the only
record — check it there.

---

## 1. Architecture

Nothing about the site's static export changes. Three deployables, two of them new.

```
Buyer pays on buy.stripe.com  (Route A, unchanged)
          │
          ├─► checkout.session.completed
          │        ↓
          │   functions/api/stripe-webhook.ts        [EXISTS — extend]
          │     verify sig → insert preorders row
          │     → enqueue 'confirmation' in email_outbox
          │     → return 200 (never fails on email)
          │
          └─► /preorder/success  (URL only, records nothing)

workers/ergoflo-mailer/                              [NEW deployable]
  scheduled()  daily 15:00 UTC
    ├─ drain email_outbox → Resend
    ├─ find orders due a milestone → enqueue
    └─ nag the operator for missing update copy
  fetch()      POST /run  with shared secret (manual trigger + testing)
```

**Why a separate Worker.** Cron Triggers are a Workers feature — `triggers.crons` plus a
`scheduled()` handler ([Cron Triggers docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/)).
Pages Functions have no `scheduled()` entry point. A Pages project cannot be given a cron.
The alternative is Supabase `pg_cron` + `pg_net`, which avoids a second deployable but moves
send logic into SQL where it is much harder to read and test; not recommended here.

**Why an outbox table rather than sending inline.** The webhook must return 2xx or Stripe
retries. If it sends inline and Resend is down, either the order is lost (return 500, retry,
then the unique violation at `stripe-webhook.ts:246` returns 200 early and **the email is never
sent, silently**) or the failure is swallowed and nobody knows. Writing a row and letting the
cron drain it makes both the insert and the send individually retryable. This failure mode is
the single most important thing in this plan; see §4.1.

**No SDKs.** Resend is one `fetch` to `https://api.resend.com/emails`. This matches the
standing rule in `functions/api/notify.ts:9-18` and `checkout.ts:8-14` — raw fetch, no client
objects, for both the Workers-runtime constraints and the 13 KB/request heap leak that
motivated it.

---

## 2. Schema

New migration: `supabase/migrations/20260806HHMMSS_email_outbox.sql`.

### 2.1 `preorders` — three added columns

```sql
alter table public.preorders
  -- Human-readable order number. A uuid is unusable in a support email.
  -- Generated in the webhook, not defaulted here, so it appears in the
  -- confirmation email without a read-back round trip.
  add column if not exists order_number text unique,

  -- The concrete date promised to THIS buyer, computed once at order time
  -- from created_at + promised_ship_days. Stored rather than derived at
  -- render time so a later change to LEAD_TIME_DAYS cannot silently move
  -- a date a customer already has in writing. Same reasoning as the
  -- promised_ship_days column itself.
  add column if not exists promised_ship_date date,

  -- Set by the day-100 address check when the buyer confirms or corrects.
  -- Null means never confirmed; that is a shipping risk flag, not an error.
  add column if not exists address_confirmed_at timestamptz;
```

`status` already has a check constraint allowing `paid | refunded | shipped | cancelled`
(`20260803120000_create_preorders.sql`). Add `in_production` to it — the sequence needs a
state between paid and shipped, and the constraint will reject it otherwise.

### 2.2 `email_outbox` — new

```sql
create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.preorders(id) on delete cascade,

  -- What kind of email. Constrained, so a typo cannot invent a silent
  -- new category that no template handles.
  kind text not null check (kind in (
    'confirmation', 'update_30', 'update_60', 'update_90',
    'address_check', 'shipped', 'delayed', 'cancelled_refunded'
  )),

  -- THIS PAIR IS THE IDEMPOTENCY GUARANTEE. It is what makes a webhook
  -- redelivery, a double cron run, and a manual re-trigger all harmless.
  -- Without it, an overlapping cron sends every pending email twice.
  unique (order_id, kind),

  -- Operator-supplied body for the milestone emails. Null for kinds that
  -- are fully templated (confirmation, shipped).
  body_markdown text,

  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempts integer not null default 0,
  last_error text,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  resend_id text,
  created_at timestamptz not null default now()
);

create index if not exists email_outbox_due_idx
  on public.email_outbox (status, scheduled_for)
  where status = 'pending';

alter table public.email_outbox enable row level security;
-- No policies, deliberately — same as preorders. RLS with zero policies
-- denies anon and authenticated entirely. Only the secret key writes here.
```

`last_error` stores a provider error **code or short reason only**. Never the response body:
Resend echoes the recipient address back, and this column is read by anyone with dashboard
access. Same rule already applied at `notify.ts` and `stripe-webhook.ts:251-254`.

### 2.3 `production_updates` — new

```sql
-- Operator-written copy for milestone emails. Keyed by milestone so the
-- cron can ask "is there copy for update_30 yet?" and answer honestly.
create table if not exists public.production_updates (
  id uuid primary key default gen_random_uuid(),
  milestone text not null unique
    check (milestone in ('update_30', 'update_60', 'update_90')),
  body_markdown text not null,
  image_url text,
  written_at timestamptz not null default now()
);
```

See §3.2 for why this exists rather than the cron generating "still on track" itself.

---

## 3. The sequence

All dates derive from `promised_ship_date` and `created_at` **on the order row**. All money
renders from `amount_cents` on the row, never from `PRICE_CENTS`. This matters this week:
`docs/plans/2026-08-06-pricing-and-disclosure-restructure.md` proposes moving the price to
$50 → $70. Reading price from config at render time would retroactively rewrite what earlier
customers are told they paid.

### 3.1 Day 0 — confirmation

Triggered by the webhook. The only email in the sequence that must never be delayed.

Required content, all of it:

| Element | Source |
|---|---|
| Order number | `preorders.order_number` |
| What was bought | `PRODUCT_NAME` equivalent from `lib/site.ts` |
| Amount charged | `formatPrice(amount_cents)` — from the row |
| Shipping address as entered | `shipping_*` columns, echoed back so errors get caught on day 0 rather than day 120 |
| **A concrete ship-by date** | `promised_ship_date`, rendered as e.g. "ships by 4 December 2026" — never "about 120 days" |
| Refund policy, verbatim | `REFUND_POLICY`, `lib/site.ts:353` |
| Delay rights, explicit | The 16 CFR 435.2 promise: if we miss that date we email a revised one and you may take a full refund |
| Who the seller is | `SELLER_OF_RECORD` — **currently `""`**, see §7.2 |
| Not-a-company notice | `NOT_A_COMPANY_NOTICE`, `lib/site.ts:141` |
| Reply address | `hello@ergoflo.tech` |

The concrete date is the single highest-value element. It is what a buyer checks against in
four months, and it is the evidence Stripe asks for in a non-receipt dispute.

### 3.2 Days 30 / 60 / 90 — production updates

The cron finds orders at each age and checks `production_updates` for that milestone.

- **Copy exists** → enqueue the milestone email for every eligible order.
- **Copy does not exist** → enqueue nothing to customers. Email the operator instead: *"12
  orders are due their day-30 update and there is no copy written."*

This is a deliberate departure from "send them even when there's nothing to report". An
automated "still on track" that fires without a human confirming it is on track will
eventually send "still on track" during a month when it is not — which converts a schedule
problem into a false statement to a paying customer. The nag preserves the intent (the
cadence is enforced, silence is not allowed to happen by default) without automating a claim
nobody checked.

Practical note: one honest sentence and a phone photo of the workbench satisfies this. The
bar is evidence of a human, not production values.

### 3.3 Day ~100 — address confirmation

Sent to every order whose `address_confirmed_at` is null. Echoes the stored address, asks for
a reply if anything changed. Per §0.2 this is also the last comfortable point to declare a
delay while all refunds still work; treat a slipping schedule at day 100 as triggering §3.5
immediately rather than waiting for day 120.

Reply-based, not a form. A form means a new public endpoint that mutates shipping addresses,
which needs a per-order token, rate limiting, and its own abuse surface. At this volume a
reply to `hello@ergoflo.tech` is better in every respect.

### 3.4 Ship — tracking

Manual trigger when a unit actually ships. Sets `status = 'shipped'`, enqueues `shipped` with
the carrier and tracking number.

### 3.5 Any delay — revised date and cancel option

**Manual trigger only, and the most legally load-bearing email here.** 16 CFR 435.2 requires
a seller who cannot ship within the stated window to offer a revised date *and* an
unconditional right to cancel for a full refund — no conditions attached, and it survives the
all-sales-final policy (`lib/site.ts:326-330` already states this).

The template must contain: the original promised date, the new date, an unambiguous statement
that a full refund is available on request with nothing required in return, and how to ask.
Do not soften it, do not add a deadline to respond, and do not make the refund path harder to
find than the accept path.

Build this template now, in the same pass as the others. Improvising it under time pressure
in four months is how the wording goes wrong.

---

## 4. Failure modes to design against

### 4.1 The idempotent-retry trap (the important one)

`stripe-webhook.ts:246` returns 200 on Postgres error 23505 — the unique violation on
`stripe_session_id`. That is what makes webhook redelivery safe, and Stripe *will* redeliver
in normal operation. Any side effect placed after the insert is therefore **skipped on every
retry**.

The consequence if the confirmation send is naively bolted on after the insert:

1. Insert succeeds. Resend call fails. Handler returns 500.
2. Stripe retries. Insert hits 23505. Handler returns 200 at line 246.
3. Email never sends. No error anywhere. The buyer is charged and hears nothing.

Required shape instead: enqueue into `email_outbox` in the **same logical step** as the
insert, and reach the enqueue on the 23505 path too — a redelivery must still be able to
create the outbox row if the first attempt died between the two writes. The enqueue's own
unique constraint makes doing it twice harmless. The handler returns 200 whenever the order
row exists, regardless of email state.

### 4.2 Email failure must never fail the webhook

No Resend call from inside the webhook at all. The webhook writes rows; the cron sends. A
provider outage delays email and loses nothing.

### 4.3 Double sends

Three independent guards: the `unique (order_id, kind)` constraint, a `status` transition to
`sent` before the row is considered done, and Resend's `Idempotency-Key` header keyed on the
outbox row id.

### 4.4 Bounces

A bounced confirmation on a 120-day preorder means a customer who will never hear from you
and will dispute. Register a Resend webhook for `email.bounced` / `email.complained` and have
it flag the order. This is a small addition and worth doing in the same pass.

### 4.5 Local testing

`next dev` cannot run Pages Functions at all — `.env.local.example` already says so. The
webhook change is testable only under
`wrangler pages dev out --compatibility-date=2024-06-20`, with `stripe listen --forward-to`.
The mailer Worker tests via `wrangler dev --test-scheduled` and
`curl "http://localhost:8787/cdn-cgi/handler/scheduled"`.

Use Resend's test address `delivered@resend.dev` for every send until the templates are
final. Sending test mail to a real inbox from a new domain is how a sending reputation gets
damaged before it exists.

---

## 5. Off-site work — only the account holder can do these

Code cannot verify any of this, exactly as `lib/site.ts:237-247` warns about the payment link.

**DNS (`ergoflo.tech`)**
1. Add Resend's DKIM records on a **subdomain**: `send.ergoflo.tech`. Do not put them on the
   apex. The apex already carries MX for Namecheap Private Email
   (`mx1-3-hosting.jellyfish.systems`) and an SPF record scoped to that host
   (`v=spf1 +a +mx +ip4:198.54.114.19 +ip4:198.54.115.145 include:spf.web-hosting.com ~all`).
   Editing that SPF to add Resend risks breaking receipt of mail at `hello@ergoflo.tech`,
   which `/privacy` publishes as the data-deletion address.
2. Verify the domain in the Resend dashboard.
3. Add a DMARC record at `_dmarc.ergoflo.tech` — start `v=DMARC1; p=none; rua=mailto:…`.
   There is no DMARC record today. Gmail and Yahoo both require one for bulk senders and it
   costs nothing to publish at `p=none`.
4. Send from `ErgoFlo <orders@send.ergoflo.tech>`, `Reply-To: hello@ergoflo.tech`.

**Stripe dashboard**
5. Register the webhook endpoint `https://ergoflo.tech/api/stripe-webhook` for
   `checkout.session.completed`. Copy the signing secret (`whsec_…`).
6. On the Payment Link itself: confirm shipping address collection is on and US-only, that
   terms-of-service acceptance is required and points at `/terms`, and that the price matches
   what the site advertises. `lib/site.ts:237-247` lists this; none of it is checkable from code.
7. Decide on Stripe's own receipt email (Settings → Customer emails). Recommendation: **leave
   it on.** It is a receipt, ours is an order confirmation, and they do different jobs. Two
   emails at checkout is normal and the Stripe one carries the charge descriptor a buyer looks
   for on their statement.

**Cloudflare**
8. `RESEND_API_KEY` and `MAILER_SHARED_SECRET` as secrets on the new Worker;
   `STRIPE_WEBHOOK_SECRET` on the Pages project if not already set. Never in `.env.local` for
   a deployed build.

---

## 6. Task breakdown

| # | Task | Files |
|---|---|---|
| 1 | Migration: `preorders` columns, `email_outbox`, `production_updates`, `status` constraint | `supabase/migrations/20260806*.sql` |
| 2 | Shared email template module — HTML + plaintext, both required | `workers/ergoflo-mailer/src/templates/*.ts` |
| 3 | Order-number generator | `workers/ergoflo-mailer/src/order-number.ts` |
| 4 | Extend webhook: order number, promised date, outbox enqueue, 23505 path | `functions/api/stripe-webhook.ts` |
| 5 | Mailer Worker: `scheduled()` drain + milestone scan + operator nag | `workers/ergoflo-mailer/src/index.ts`, `wrangler.jsonc` |
| 6 | Resend send function — raw fetch, idempotency key, code-only error logging | `workers/ergoflo-mailer/src/resend.ts` |
| 7 | Manual trigger endpoint for `shipped` / `delayed` / `cancelled_refunded` | `workers/ergoflo-mailer/src/index.ts` |
| 8 | Bounce/complaint webhook | `workers/ergoflo-mailer/src/index.ts` |
| 9 | Operator runbook — how to send a delay notice, write an update, mark shipped | `docs/RUNBOOK-orders.md` |
| 10 | Test pass under `wrangler` for both deployables | — |

Tasks 1–4 deliver the confirmation email alone and are independently shippable. Everything
from 5 onward is the sequence. **Recommend stopping after task 4 for approval** before
building the scheduled half.

---

## 7. Open risks

### 7.1 Route A cannot keep accurate per-order promises

Covered in §0.1. Today the fallback is correct. If the lead time ever changes, Route A orders
silently record the new promise against old buyers. Route B carries
`metadata[promised_ship_days]` from the session and does not have this problem
(`checkout.ts:204`). Not blocking; worth knowing before `LEAD_TIME_DAYS` is ever touched.

### 7.2 `SELLER_OF_RECORD` is empty and this email has to name someone

`lib/site.ts:369` is `""` because no adult 18+ holds the Stripe account, and both operators
are minors whose contracts are voidable under Cal. Family Code §6710. `/terms` renders a
blocking notice about this next to a working buy button — described in the code as
"deliberate and honest, but not a finished state" (`lib/site.ts:270-276`).

A confirmation email has to say who took the money. There are two options and no third:

1. **Fill in `SELLER_OF_RECORD` with a named adult** who holds the Stripe account. This is
   already item 1 of "Blocking before this can take real money" in
   `docs/plans/2026-08-03-preorder-commerce.md`, and it was open when the live link was pasted
   back in.
2. **Render the same blocking notice in the email** that `/terms` renders. Honest, consistent
   with the site, and it tells a paying customer in writing that no adult is named as seller —
   which is accurate and is also, plainly, a thing that will cost sales.

Do not fill the constant with a minor's name to silence the notice; `lib/site.ts:368` says
this and it is right.

Blunt version: an email confirming a $50 charge for an unbuilt product, shipping in four
months, from a seller who cannot be named, is a chargeback that has not happened yet. The
email does not create that problem, but it is the first artefact where a buyer sees it stated
plainly. The fix is item 1, not softer wording.

### 7.3 Still open from earlier plans

No freedom-to-operate opinion on US 11,779,097 (Vaucluse Gear). 35 U.S.C. §271(a) makes an
offer to sell an act of infringement in itself, so this is live exposure while the payment
link is live — independent of anything in this plan.

---

## 8. Approval

Nothing here is built. Say which of these you want:

- **Tasks 1–4 only** — the confirmation email, shippable on its own.
- **Everything** — the full sequence including the cron Worker.
- **Adjustments first** — particularly on §3.2 (operator nag vs. auto-send "on track") and
  §7.2 (name a seller vs. render the notice in the email).
