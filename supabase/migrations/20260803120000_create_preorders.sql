-- Paid preorders. Written ONLY by functions/api/stripe-webhook.ts, after a
-- Stripe signature has been verified. Nothing else may insert here.
--
-- WHY NO CARD DATA COLUMNS EXIST, AND WHY NONE MAY BE ADDED:
-- card details never reach this origin. Checkout is hosted by Stripe, so the
-- PAN is entered on checkout.stripe.com. Storing any part of a card number
-- here would drag this project from PCI SAQ-A (a questionnaire) into SAQ-D
-- (a full audit). `card_last4` and `card_brand` are the only card facts that
-- would ever be safe, and neither is needed. Do not add them.
--
-- Shipping address IS stored, because you cannot ship without it. It is
-- personal data: /privacy must keep describing it, and the deletion promise
-- there (5 business days to hello@ergoflo.tech) covers this table too.

create table if not exists public.preorders (
  id uuid primary key default gen_random_uuid(),

  -- Stripe's session id. UNIQUE is load-bearing: Stripe retries a webhook
  -- until it gets a 2xx, so the same checkout.session.completed event will
  -- arrive more than once in normal operation. The unique violation is how
  -- the handler stays idempotent — see the 23505 branch in the webhook.
  stripe_session_id text not null unique,
  stripe_payment_intent text,

  email text not null,
  -- Nullable: Stripe only returns these once the buyer has filled them in,
  -- and a session can complete with a name but no address for a digital
  -- good. Ours always collects an address, but do not assume it in code.
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,

  -- Cents. Recorded as charged rather than read from lib/site.ts at display
  -- time, so a future price change cannot silently rewrite what an existing
  -- customer was told they paid.
  amount_cents integer not null,
  currency text not null default 'usd',

  -- The window promised at the time of THIS order. Same reasoning: if
  -- LEAD_TIME_DAYS is ever changed, every existing order keeps the promise
  -- it was actually sold under. The FTC Mail Order Rule cares about what the
  -- buyer was told when they paid, not what the site says today.
  promised_ship_days integer not null,

  status text not null default 'paid'
    check (status in ('paid', 'refunded', 'shipped', 'cancelled')),

  created_at timestamptz not null default now()
);

create index if not exists preorders_email_idx on public.preorders (email);
create index if not exists preorders_status_idx on public.preorders (status);

alter table public.preorders enable row level security;

-- NO POLICIES AT ALL, DELIBERATELY. RLS with zero policies denies every
-- anon and authenticated request. The webhook writes with the project's
-- secret key, which bypasses RLS entirely.
--
-- Contrast with notify_signups, which grants anon INSERT as defence in
-- depth. That is right for an email list and wrong here: an anon INSERT
-- path on this table would let anyone forge a paid order they never paid
-- for. Orders may only ever originate from a Stripe-signed webhook.
-- Do not add a policy to this table to "make it work" from the browser.
