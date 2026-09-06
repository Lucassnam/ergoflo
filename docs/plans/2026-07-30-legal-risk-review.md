# Gustvane — Legal Risk Review (2026-07-30)

> ## SUPERSEDED IN PART — the brand is now `Gustvane` on `gustvane.com`
>
> This review was written under an earlier brand name. Everything it says
> about **the name and the domain** describes that earlier name and does
> **not** describe `Gustvane`. Read those parts as a record of a decision
> already taken, not as findings about the current brand.
>
> - **Finding 1 (domain not owned) — RESOLVED.** `gustvane.com` is
>   registered. `BRAND` is `Gustvane`, `SITE_URL` is `https://gustvane.com`,
>   `CONTACT_EMAIL` is `hello@gustvane.com`.
>   **Still owed off-site, and blocking deploy:** the mailbox must actually
>   receive mail; A records for `gustvane.com` *and* `www.gustvane.com` must
>   point at the deploy host or TLS issuance fails; the Resend sender domain
>   must be re-verified for `send.gustvane.com` or order confirmations to
>   paying customers stop going out. See the header of `lib/site.ts`.
> - **Finding 2 (name in use by others) — VOID, AND NOT YET REDONE.** The
>   trademark analysis in this document was run against the earlier name.
>   None of it transfers. **`Gustvane` has never been cleared.** Any USPTO
>   registration numbers, classes or coexistence arguments appearing below
>   belong to the old name and must not be read as describing this one.
>   Run a fresh knock-out search at `tmsearch.uspto.gov` in Classes 018,
>   009 and 011 — plus common-law use — before filing, packaging spend or
>   paid advertising.
> - Findings 3–7 are **unchanged and still open.** The rename did not touch
>   `/terms` §11, the three "ready to order" strings, the arbitration clause,
>   the published minors' names, or the patent position.
>
> The authoritative brand note now lives in `lib/site.ts`, above
> `CONTACT_EMAIL`.

**Not legal advice.** I am not a lawyer. This is an engineering-grade read of the
site's copy, code and public records, meant to tell you where to spend real
money on a real attorney and what to fix yourself for free.

**Scope reviewed:** every rendered string on `/`, `/about`, `/notify`, `/terms`,
`/privacy`; `lib/site.ts`; `app/api/notify/route.ts`; the Supabase migration;
git secret hygiene; the 20 hero images; public domain-registration records; and
public trademark search results for "Gustvane".

**Bottom line:** the *copy* is in good shape — better than most funded startups.
The 2026-07-29 hardening pass did real work and I found no false product claims
left in rendered text. The remaining risk is not in what the site says. It is
in **the name and the domain**, plus one stale clause in the Terms that
contradicts the whole no-sale posture.

---

## What is already correct (do not undo any of this)

Verified by reading the rendered output, not the comments:

- **No price, no ship date, no availability claim, no warranty, no IP rating,
  no certification mark anywhere in rendered copy.** I grepped for
  `guarantee|warranty|certified|available now|preorder|deposit|refund|IPX|$N`
  across `app/`, `components/`, `lib/` — every single hit was inside a code
  comment. Nothing leaks to the page.
- **No `schema.org/Offer` in the JSON-LD.** Only `FAQPage`. Correct — an Offer
  node is the most machine-readable possible form of an "offer to sell".
- **Every target figure carries the word "target" at the point of display**,
  not in a footnote.
- **The API endpoint is genuinely hardened**: rate limit, content-type check,
  body-size cap before parsing, honeypot returning an indistinguishable 200,
  email validation, `product` allowlist, and it logs the Postgres error *code*
  rather than the message or the email. RLS is enabled with insert-only for
  `anon`. This is better than most production code.
- **No secrets in git history.** `git ls-files` returns only
  `.env.local.example`; `.env*` is gitignored. `SUPABASE_SECRET_KEY` correctly
  has no `NEXT_PUBLIC_` prefix.
- **Consent notice sits adjacent to the submit button** with an explicit "by
  joining, you agree to" — that is what keeps `/terms` from being unenforceable
  browsewrap.
- **The hero images are clean.** I downloaded all 20 and inspected them: they
  are landscapes, cityscapes and empty interiors. No identifiable faces, so the
  usual Unsplash trap — the licence grants no model or property release — does
  not bite here. Unsplash is also correctly named as a third-party recipient in
  the privacy policy, which almost nobody does.

---

## VOID — 1. Domain ownership

**This finding is resolved and its original content has been removed.**

It described a domain-ownership problem with a name this project no longer
uses. `gustvane.com` is registered to the project, so the finding does not
apply. The original wording named specific registration dates, registrars
and resale valuations for a *different* domain; leaving it in place under
the current name would have asserted things about `gustvane.com` that are
simply untrue.

What survives from it is the operational checklist, which is now in the
header of `lib/site.ts` and still blocks deploy: mailbox live, A records
repointed, Resend sender domain re-verified.

---

## OPEN — 2. Trademark clearance on "Gustvane" has never been run

**The previous version of this section has been deleted rather than
renamed.** It recorded a public-search pass against the project's earlier
name and listed specific third-party sellers, domains, foreign retailers
and a USPTO registration number. None of those findings describe
"Gustvane". Carrying them over under the new name would have manufactured
a record of trademark conflicts that were never found for this name — the
kind of document that is actively harmful to have on file, because a
future reader (or an opposing party) would take it as your own knowledge
of a conflict.

The accurate current position is short:

- **"Gustvane" has not been searched.** Not federally, not for common-law
  use, not for domain or marketplace-seller collisions.
- The site **is in commerce on real goods**, which is the posture where
  trademark exposure actually bites. That was not true when the earlier
  search was run against a page that sold nothing.
- Nothing has been spent on the name yet — no packaging, no logo run, no
  paid advertising. That makes right now the cheapest possible moment to
  find a problem.

**Do before spending anything on the name:** a free knock-out search at
`tmsearch.uspto.gov` covering the word itself, phonetic equivalents and
obvious misspellings, in International Classes 018, 009 and 011. Search
marketplace sellers and domain registrations separately — the federal
register does not surface unregistered common-law use, which can still
block you. If anything close turns up, get a real clearance opinion.

Nobody who worked on this document is a lawyer.

---

## MEDIUM — 3. `/terms` §11 still describes a sale, and it undercuts §2

`app/terms/page.tsx:238-245`:

> "The version that applies to **your reservation** is the version published on
> the date **you placed it**, and we will email you if a change materially
> affects **an order you have already placed**."

There are no reservations and no orders. This is leftover text from the Terms of
Sale.

Why this is worth fixing rather than shrugging at: §2 ("No offer, no sale, no
reliance") is the load-bearing clause on the site — it is what backs the
§271(a) position and defeats any consumer-expectation reading. A later clause in
the same document that twice refers to orders the reader has "placed" is exactly
the internal contradiction a plaintiff or a regulator quotes back at you. A
contract is read as a whole.

**Fix:** replace with something like — "We may update these terms. The version
that applies is the one published on this page at the time you use the site. The
'last updated' date always reflects the current version. If a change materially
affects people on the waitlist, we will say so in the email we send."

---

## MEDIUM — 4. Three places still say "order"

The pivot missed these:

- `app/notify/page.tsx:8` — metadata description: "Get an email the moment the
  next Gustvane product is **ready to order**."
- `app/notify/page.tsx:36-37` — body copy, both branches: "we'll let you know
  the moment ... is **ready to order**."
- `components/ProductRender.tsx:54-55` — "the product **you receive** will not
  look exactly like this."

Individually trivial. Collectively they are the same defect as #3: the
no-sale posture is only as strong as its weakest sentence, and `/notify` is the
page where someone actually hands you their email. Swap "ready to order" for
"something real to sell" (matching the homepage) and "the product you receive"
for "the finished product".

---

## MEDIUM — 5. The arbitration clause probably costs you more than it protects

`/terms` §8 sends disputes to "binding individual arbitration, administered
under the consumer rules of a recognised arbitration provider."

Two problems:

1. **No provider is named and no fees are allocated.** An arbitration clause
   that identifies no forum and no cost-sharing is materially more likely to be
   found unconscionable and struck — and if it is struck, you have signalled to
   a court that you tried to strip a consumer's remedies, which does not help
   the rest of the document.
2. **Consumer arbitration is expensive for the business side.** Under AAA
   consumer rules the business pays nearly all of the filing and arbitrator
   fees, commonly thousands of dollars per claim, and the consumer pays a
   capped nominal amount. You have no entity and no revenue. **A clause you
   drafted could obligate you personally to fund an arbitration.** The class
   waiver is the part with real defensive value; the mandatory-arbitration
   commitment is the part that can bill you.

**Recommendation:** keep the class-action waiver and the jury waiver, keep
"email us first, give us 30 days", keep small-claims carve-out — and drop
mandatory arbitration, or name a provider and state who pays. Nothing is sold
here, so the realistic dispute surface is close to zero either way; do not buy
an obligation you do not need.

---

## LOW — 6. Two minors' full legal names are published site-wide

`LEGAL_NAME` / `TEAM` publish both full names on `/about`, `/terms`, `/privacy`
and in the footer copyright line.

The partnership analysis behind this is sound and I would not undo it — no
titles, no ownership claims, `NO_PARTNERSHIP_NOTICE` adjacent. But note the
trade-off nobody has written down: the site names two minors as the people
responsible for a personal-data collection, permanently, in an indexed page.
That is a doxxing and future-employment surface, not a liability one.

`robots.ts` allows indexing, so these names will be searchable against the
project forever.

**Options:** first names + last initial in the visible team block, while the
legal pages say "the students who operate this site" with the contact email as
the accountable channel. CalOPPA requires you to disclose *how to contact* the
operator; it does not require you to publish a minor's full legal name. Talk to
a parent about this one — it is a family judgment call, not a compliance one.

---

## LOW — 7. Third-party terms and the capacity question

I checked, rather than assumed:

- **Vercel** — "Age and Eligibility": *"You certify that you are a person at
  least 16 years of age."* If you are 16+, you are compliant. If either account
  holder is under 16, the account is in breach and can be terminated, taking
  the site with it.
- **Supabase** — no age clause. It requires you to *"REPRESENT AND WARRANT THAT
  YOU HAVE THE RIGHT, POWER, AND AUTHORITY TO ENTER INTO THIS AGREEMENT."* A
  minor's capacity to make that warranty is questionable. Practical risk: low.
  Nobody audits this. Worth knowing it is technically shaky.
- **The mirror image of your own Terms:** a minor's contract is voidable by the
  minor (Cal. Fam. Code §6710). Your disclaimers and liability cap are being
  asserted *by* people who could disaffirm the agreement — which cuts in your
  favour on paper, but also means a court could decline to treat the Terms as a
  binding contract with anyone at all, since there is no legal person on your
  side of it. This is the strongest argument for having an adult (a parent, or
  eventually an LLC) be the named operator before any money moves.

---

## Unchanged and still #1 overall: the patent

Nothing in this review changes the `US 11,779,097` analysis in
`docs/plans/2026-07-29-production-legal-security-hardening.md`. Restating so it
does not get lost behind the newer findings:

- The waitlist pivot is the correct response and it is correctly implemented —
  no price, no availability, no `Offer` node. Under §271(a) an offer to sell
  infringes on its own; you have removed the offer.
- **You now have actual notice of that patent**, which raises willfulness
  exposure (§284 treble damages, §285 fees) if you ever do sell.
- A written freedom-to-operate opinion is still the highest-value dollar on this
  project and the standard defence against willfulness.
- Do not reintroduce a price, a deposit, a unit cap or a ship date before that
  opinion exists. `lib/site.ts` says this in three places; it is right.

---

## Also noted, not legal

- **Blocker 1 from the previous plan may still be open**: the `notify_signups`
  table was reported missing from Supabase, meaning the waitlist silently
  fails. I could not verify this without hitting your live project. If it is
  still missing, your privacy policy describes processing that is not happening
  — check it before launch.
- **The 21st.dev hero component's licence is unverified.** `scroll-morph-hero.tsx`
  was pasted from a third-party source and carries no licence header. Community
  component libraries are usually MIT, but "usually" is not a licence. Find the
  source page and record the licence in a comment, or in `README.md`.

---

## Do this, in this order

| # | Action | Cost | Who |
|---|---|---|---|
| 1 | Get a real, working contact email on a domain you control, and set `CONTACT_EMAIL` + `SITE_URL` | free–$15 | you, today |
| 2 | Decide on the name. Knock-out search the replacement on `tmsearch.uspto.gov` before committing | free | you, this week |
| 3 | Fix `/terms` §11; remove the three "order" strings | 10 min | you |
| 4 | Drop mandatory arbitration or name a provider + fee split | 10 min | you |
| 5 | Talk to a parent about publishing two minors' full names, and about an adult being the named operator | free | family |
| 6 | Confirm both hosting accounts are 16+ compliant | free | you |
| 7 | Verify the Supabase table exists so the form actually works | 10 min | you |
| 8 | Freedom-to-operate opinion on US 11,779,097 — **before any money, ever** | $$$$ | patent attorney |

Items 1–7 are free and you can do them yourself. Item 8 is the only one that
needs a lawyer, and it is not needed until you want to sell something.

**Nothing here says stop.** A waitlist page for an unbuilt product, with no
price and honest disclaimers, is close to the lowest-risk thing you could be
doing. The exposure is concentrated almost entirely in the name and the domain
— which is exactly the kind of problem that is cheap now and expensive later.
