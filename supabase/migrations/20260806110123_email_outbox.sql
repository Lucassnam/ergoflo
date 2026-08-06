-- Transactional email for preorders.
--
-- Adds the three order facts an email has to quote, plus an outbox that
-- decouples "an order happened" from "an email was sent". See
-- docs/plans/2026-08-06-transactional-email.md for the full reasoning.
--
-- WHY AN OUTBOX AND NOT A DIRECT SEND FROM THE WEBHOOK:
-- functions/api/stripe-webhook.ts must return 2xx or Stripe retries. Its
-- 23505 branch returns 200 early, which is what makes redelivery safe --
-- and it means any side effect placed after the insert is SKIPPED on every
-- retry. Send inline and the sequence is: insert ok, Resend down, return
-- 500, Stripe retries, unique violation, return 200, email never sent, no
-- error anywhere. The buyer is charged and hears nothing. Writing a row
-- here and draining it from a scheduled Worker makes the insert and the
-- send independently retryable. Do not "simplify" this to a direct send.

-- ---------------------------------------------------------------------------
-- preorders: three added columns
-- ---------------------------------------------------------------------------

alter table public.preorders
  -- Human-readable order reference. The uuid primary key is unusable in an
  -- email or a support reply -- nobody reads a uuid down the phone. Generated
  -- in the webhook rather than defaulted here so the value is known without a
  -- read-back round trip when the confirmation is enqueued.
  add column if not exists order_number text unique,

  -- The concrete calendar date promised to THIS buyer, computed once at order
  -- time from created_at + promised_ship_days. Stored, not derived at render
  -- time, for the same reason promised_ship_days is stored: a later change to
  -- LEAD_TIME_DAYS must not silently move a date a customer already holds in
  -- writing. The FTC Mail Order Rule (16 CFR 435.2) cares about what the buyer
  -- was told when they paid.
  add column if not exists promised_ship_date date,

  -- Set when the buyer confirms or corrects their address at the ~day-100
  -- checkpoint. Null means never confirmed -- a shipping risk flag on a
  -- four-month-old address, not an error.
  add column if not exists address_confirmed_at timestamptz,

  -- The terms this buyer actually bought under, frozen at order time.
  -- Keys: refund_policy, not_a_company_notice, ship_window_phrase,
  -- seller_of_record, product_name.
  --
  -- WHY THIS IS NOT READ FROM lib/site.ts AT SEND TIME:
  -- the emails in this sequence are sent up to four months apart, and the
  -- legal copy on this site changes. REFUND_POLICY was already narrowed once
  -- on 2026-08-04, from "cancel any time before your order ships" to
  -- final-sale-with-three-carve-outs, and was being rewritten again on
  -- 2026-08-06. An email that renders today's constant would quote a buyer
  -- terms they never agreed to -- tightening a refund right retroactively in
  -- the one artefact they are most likely to keep and forward.
  --
  -- Same reasoning as amount_cents and promised_ship_days, applied to prose
  -- instead of numbers. Snapshot it, quote the snapshot, never the constant.
  add column if not exists terms_snapshot jsonb;

-- The sequence needs a state between paid and shipped. The original check
-- constraint has no 'in_production' and would reject it.
alter table public.preorders
  drop constraint if exists preorders_status_check;

alter table public.preorders
  add constraint preorders_status_check
  check (status in ('paid', 'in_production', 'shipped', 'refunded', 'cancelled'));

-- ---------------------------------------------------------------------------
-- email_outbox
-- ---------------------------------------------------------------------------

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.preorders(id) on delete cascade,

  -- Constrained so a typo cannot invent a silent new category that no
  -- template handles and nothing ever sends.
  kind text not null check (kind in (
    'receipt',
    'confirmation',
    'update_30', 'update_60', 'update_90',
    'address_check',
    'shipped',
    'delayed',
    'cancelled_refunded'
  )),

  -- THIS IS THE IDEMPOTENCY GUARANTEE, and it is load-bearing three times
  -- over: a Stripe webhook redelivery, two overlapping cron runs, and a
  -- manual re-trigger all collide here instead of sending a second email.
  -- The drain treats 23505 on this constraint as success, exactly as the
  -- webhook already does for stripe_session_id.
  unique (order_id, kind),

  -- Operator-written body for the milestone emails. Null for kinds that are
  -- fully templated (confirmation, shipped).
  body_markdown text,

  -- 'sending' is a claim marker, not decoration. The drain moves a row
  -- pending -> sending with a compare-and-swap before it calls the
  -- provider, so two overlapping scheduled runs cannot both send the same
  -- message. A row stuck in 'sending' means the Worker died mid-send:
  -- that is recoverable by hand and is meant to be visible, which it
  -- would not be if the claim were implicit.
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),

  attempts integer not null default 0,

  -- Provider error CODE or short reason only. Never the response body:
  -- Resend echoes the recipient address back, and this column is visible to
  -- anyone with dashboard access. Same rule as the console.error calls in
  -- functions/api/notify.ts and stripe-webhook.ts.
  last_error text,

  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  resend_id text,
  created_at timestamptz not null default now()
);

-- Partial index: the drain only ever asks for pending rows that are due.
create index if not exists email_outbox_due_idx
  on public.email_outbox (scheduled_for)
  where status = 'pending';

create index if not exists email_outbox_order_idx
  on public.email_outbox (order_id);

alter table public.email_outbox enable row level security;

-- NO POLICIES AT ALL, DELIBERATELY -- same as public.preorders. RLS with zero
-- policies denies every anon and authenticated request. Only the project's
-- secret key (which bypasses RLS) writes here, from the webhook and the
-- mailer Worker. If a client-side path is ever added, it must not read this
-- table: it joins to email addresses and shipping data.

-- ---------------------------------------------------------------------------
-- production_updates
-- ---------------------------------------------------------------------------

-- Operator-written copy for the day-30/60/90 milestone emails.
--
-- WHY THIS TABLE EXISTS RATHER THAN THE CRON WRITING "still on track":
-- an automated progress email that fires without a human confirming progress
-- will eventually send "still on track" during a month when it is not. That
-- turns a schedule slip into a false statement to a paying customer. The
-- scheduled job instead checks for copy here, and if there is none it nags
-- the operator rather than reassuring the customer. The cadence stays
-- enforced; the claim stays human.
create table if not exists public.production_updates (
  id uuid primary key default gen_random_uuid(),
  milestone text not null unique
    check (milestone in ('update_30', 'update_60', 'update_90')),
  body_markdown text not null,
  image_url text,
  written_at timestamptz not null default now()
);

alter table public.production_updates enable row level security;
-- No policies, same reasoning as above.
