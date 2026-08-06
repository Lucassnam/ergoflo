# ergoflo-mailer

Transactional email for preorders. A **separate Cloudflare Worker**, not part of the Pages
project — Cron Triggers require a Worker `scheduled()` handler and Pages has no scheduled
entry point.

Design and reasoning: `docs/plans/2026-08-06-transactional-email.md`.

## What is built

- **Day 0 confirmation.** Enqueued by `functions/api/stripe-webhook.ts`, sent from here.
- The outbox drain, claim/retry logic, and the Resend transport.

## What is not built yet

`update_30` / `update_60` / `update_90`, `address_check`, `shipped`, `delayed`,
`cancelled_refunded`. Rows of these kinds stay `pending` and log a warning rather than
failing, so they send as soon as a template lands.

**`delayed` is the one to write before day 120, not on day 120.** Its content is governed by
16 CFR 435.2 — a revised date plus an unconditional refund offer — and improvising that under
time pressure is how the wording goes wrong.

## Setup

### 1. Install and migrate

```sh
# From the repo root — applies the outbox migration.
supabase db push
```

Adds `order_number`, `promised_ship_date`, `address_confirmed_at` and `terms_snapshot` to
`preorders`, plus the `email_outbox` and `production_updates` tables.

### 2. Resend + DNS — ALREADY DONE

Verified 2026-08-06 by sending from it. `ergoflo.tech` (the **apex**) is the verified domain,
so any address on it can send. Records in place:

| Record | Value |
|---|---|
| `resend._domainkey.ergoflo.tech` TXT | DKIM public key |
| `send.ergoflo.tech` TXT | `v=spf1 include:amazonses.com ~all` |
| `send.ergoflo.tech` MX | `feedback-smtp.us-east-1.amazonses.com` |
| `_dmarc.ergoflo.tech` TXT | `v=DMARC1; p=none;` |

**`send.ergoflo.tech` is not a second domain.** It is the return-path subdomain Resend
creates as part of apex verification. Sending *from* an address on it returns 403. An
earlier version of `wrangler.jsonc` had `orders@send.ergoflo.tech` as `MAIL_FROM` and would
have failed on the first real order.

Two things to leave alone:

- **The apex SPF.** It still reads `v=spf1 +a +mx +ip4:... include:spf.web-hosting.com ~all`,
  serving the Namecheap mailbox. Resend did not touch it because its own SPF lives on the
  return-path subdomain. Never add a second `v=spf1` record to the apex — one per domain, or
  SPF permerrors and deliverability drops for the mailbox too.
- **`MAIL_FROM = hello@ergoflo.tech`.** Not `orders@`. `hello@` demonstrably receives mail
  (`/privacy` publishes it as the deletion address); whether `orders@` has a mailbox behind
  the Namecheap MX is unknown, and these emails tell the buyer to "just reply".

Worth improving: the DMARC record has no `rua=`, so nobody receives aggregate reports.
`v=DMARC1; p=none; rua=mailto:hello@ergoflo.tech` costs nothing and shows who is sending as
you.

### 3. Deploy the Worker

```sh
cd workers/ergoflo-mailer
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAILER_SHARED_SECRET   # any long random string
npx wrangler deploy
```

`MAIL_FROM` and `MAIL_REPLY_TO` are plaintext `vars` in `wrangler.jsonc`; everything above is
a secret and must never be committed.

### 4. Register the Stripe webhook

This is what makes any of it fire. Dashboard → Developers → Webhooks → add endpoint:

- URL: `https://ergoflo.tech/api/stripe-webhook`
- Event: `checkout.session.completed`
- Copy the signing secret (`whsec_…`) into the **Pages** project env as
  `STRIPE_WEBHOOK_SECRET` (not this Worker).

The live checkout is the hosted Payment Link (Route A). Payment Links emit
`checkout.session.completed` too, so this works without enabling Route B.

## Previewing templates

`src/preview.ts` renders every template to HTML and plaintext and **fails if any
rendered copy contains an em or en dash** — the house rule from commit `df48982`
(`github.com/blader/humanizer`). It checks output, not source, because a dash can arrive
through an imported constant that a source grep never sees.

```sh
# from the repo root
node node_modules/typescript/bin/tsc --strict --target ES2022 --module commonjs \
  --moduleResolution node --lib ES2022,DOM --types node --skipLibCheck \
  --outDir /tmp/prev workers/ergoflo-mailer/src/preview.ts
node /tmp/prev/workers/ergoflo-mailer/src/preview.js ./email-preview
```

Exits non-zero on failure, so it works as a pre-commit hook. Sample data is in
`src/fixtures.ts` — a name with an apostrophe (proves HTML escaping) and a null
`line2` (proves the blank-line filter). Keep it awkward.

`preview.ts` runs on load. Never import from it; import fixtures from `fixtures.ts`.

## Testing

`next dev` cannot run Pages Functions at all. The webhook is only testable under Wrangler:

```sh
# terminal 1 — from repo root
npx wrangler pages dev out --compatibility-date=2024-06-20
# terminal 2
stripe listen --forward-to http://localhost:8788/api/stripe-webhook
stripe trigger checkout.session.completed
```

The Worker:

```sh
cd workers/ergoflo-mailer
npx wrangler dev --test-scheduled
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
```

**Send to `delivered@resend.dev` until the templates are final.** Sending test mail to real
inboxes from a brand-new sending domain damages a reputation that does not exist yet, and
this sequence depends on mail arriving four months from now.

Typecheck (the root `tsconfig.json` excludes `workers/`):

```sh
node ../../node_modules/typescript/bin/tsc --noEmit \
  --strict --target ES2022 --module ESNext --moduleResolution bundler \
  --lib ES2022,DOM --skipLibCheck src/index.ts
```

`tsconfig.json` here references `@cloudflare/workers-types`, which is **not installed** —
adding it means editing the site's `package.json`. Until it is, use the command above.

## Operating it

Force a drain rather than waiting for 15:00 UTC:

```sh
curl -X POST https://ergoflo-mailer.<subdomain>.workers.dev/run \
  -H "x-mailer-secret: <MAILER_SHARED_SECRET>"
```

Useful queries:

```sql
-- Stuck or failed sends.
select kind, status, attempts, last_error, scheduled_for
from email_outbox where status in ('failed','sending') order by created_at desc;

-- A row stuck in 'sending' means the Worker died mid-send. Safe to reset:
update email_outbox set status='pending' where id='...' and status='sending';

-- Orders whose promised date is close. The 16 CFR 435.2 notice is owed
-- BEFORE the date passes, not after.
select order_number, email, promised_ship_date
from preorders where status='paid' and promised_ship_date < now() + interval '14 days';
```

## Two constraints that are easy to forget

**Stripe cannot refund a card past 180 days from the charge.** The promise is 120 days. That
leaves ~60 days of margin, and `REFUND_POLICY` promises refunds on delay and abandonment with
no expiry. Treat day 150 as a hard internal deadline: any order not shipped by then either
ships or gets refunded while the mechanism still works.

**Emails quote `terms_snapshot`, not `lib/site.ts`.** The snapshot is frozen at order time so
a buyer is always quoted the terms they actually agreed to. If the fallback to live constants
in `templates/confirmation.ts` starts firing for new orders, the webhook has stopped writing
the snapshot — fix that rather than relying on the fallback.
