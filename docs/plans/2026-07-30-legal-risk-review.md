# ErgoFlow — Legal Risk Review (2026-07-30)

> ## UPDATE, same day — the brand is now `ErgoFlo` on `ergoflo.tech`
>
> This review was written while the brand was **ErgoFlow** and is kept in its
> original wording as the record of why the name changed. Acted on immediately:
>
> - **Finding 1 (`ergoflow.com` not owned) — RESOLVED.** `BRAND` is now
>   `ErgoFlo`, `SITE_URL` is `https://ergoflo.tech` and `CONTACT_EMAIL` is
>   `hello@ergoflo.tech`, matching the site block in `./Caddyfile`.
>   **Still owed off-site:** the mailbox has to actually receive mail, and A
>   records for `ergoflo.tech` *and* `www.ergoflo.tech` must point at the deploy
>   host. As of 2026-07-30 `ergoflo.tech` resolves to `198.54.115.19`
>   (registrar parking), not to an EC2 instance — so TLS issuance will fail
>   until DNS is repointed. See the header of `./Caddyfile`.
> - **Finding 2 (name in use by others) — CHANGED, NOT ELIMINATED.** `ErgoFlo`
>   trades a near-match for an **exact** match against a live, incontestable
>   federal registration: `ERGOFLO`, USPTO Reg. 4286129, Serial 85661701,
>   Class 021 (mop handles), §§8 & 15 accepted 2018-11-30. Class 021 is distant
>   from a backpack accessory (Class 018 / 009), so coexistence is arguable and
>   this is not a blocker for a page that sells nothing. Separately, `ergofló`
>   is an existing consumer product (Perfect Fit, an enema/douche system on
>   Amazon, Class 010) — no legal conflict, but it shares the name in consumer
>   search. Both were known and accepted when the name was chosen. Run a
>   knock-out search in Classes 018 and 009 at `tmsearch.uspto.gov` before
>   filing anything or paying for packaging.
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
public trademark search results for "ErgoFlow".

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

## HIGH — 1. You do not own `ergoflow.com`, and you probably cannot get it

**This is the finding that matters most, and it is new.**

Public registry data (Verisign RDAP, checked 2026-07-30):

```
ERGOFLOW.COM
  registration:  2003-12-09
  expiration:    2026-10-02
  last changed:  2024-09-27
  registrar:     GoDaddy.com, LLC
```

It resolves, and it serves a 114-byte stub that redirects to `/lander` — the
signature of a **parked domain held for resale**. Someone has been sitting on
it for 22 years and renewing it.

Consequences, in order of how much they hurt:

1. **`CONTACT_EMAIL = "hello@ergoflow.com"` is undeliverable mail to a stranger's
   domain.** Your privacy policy promises: email this address and we will tell
   you what we hold, delete it, correct it, export it, within 5 business days.
   Your Terms promise: email this address first and we ask for 30 days.
   **Those are the only two enforceable promises on the entire site, and both
   currently route to a mailbox you do not control.** A privacy policy with a
   dead rights-request address is worse than no policy — it is a written,
   dated, unkept commitment. This is the single highest-value fix on the list
   and it costs nothing.
2. `SITE_URL = "https://ergoflow.com"` feeds `metadataBase`, `sitemap.ts` and
   `robots.ts`. Every canonical URL and share card currently points at a
   squatter's lander.
3. A 2003-registered one-word `.com` on the aftermarket is realistically
   four to five figures. Budget zero for it.

**Fix now:** pick a domain you can actually register (`ergoflow.io`,
`getergoflow.com`, `ergoflowpanel.com`, or a different name entirely — see the
next finding), then set `CONTACT_EMAIL` and `SITE_URL` in `lib/site.ts`. Those
are the only two places either value is hardcoded.

---

## HIGH — 2. "ErgoFlow" is already in commercial use by other people

The project plan lists trademark clearance as off-site item 5, "never searched."
I searched. It is not clean.

Live commercial uses of the exact or near-exact name found in one pass:

| Who | What | Why it matters |
|---|---|---|
| ErgoFlow (Amazon seller, ASIN B0F7X66XVZ) | "ErgoFlow Gel Wrist Rest Mouse Pad", ergonomic desk accessory | **Closest conflict.** Consumer ergonomic body-contact accessory sold online — arguably related goods to a body-contact backpack panel |
| ergoflow.ca | ergonomics / usable design | same word, adjacent field |
| ergoflowmethod.com | workflow consulting, NYC/NJ/SF | services, further away |
| ErgoFlow Office Chair (ZA retailer) | seating | foreign, ergonomic seating |
| Shimano "Ergo Flow" | bicycle component technology | large company, sporting goods, two words |
| ERGOFLO — USPTO Reg. 4286129 | mop handles; pseudo-mark recorded as "ERGO FLO; **ERGO FLOW**" | wrong class, but USPTO has already indexed "ERGO FLOW" as a phonetic equivalent of a registered mark |

**Honest limits on this search:** I could not query USPTO TSDR or Trademarkia
directly — both blocked automated requests (403 / Cloudflare). So I cannot tell
you whether a federal `ERGOFLOW` registration or a pending application exists in
the relevant class. **Treat this as "found conflicts in 10 minutes of public
search", not as a clearance search.**

What the risk actually is — and is not:

- Nobody is going to sue a high-school waitlist page. The realistic harm is
  **later**: you build an audience, a logo, a domain and a following on a name,
  and then a Section 2(d) likelihood-of-confusion refusal, an Amazon brand
  complaint, or a cease-and-desist forces a rename. Rebranding is expensive
  precisely because it happens after the name has value.
- You cannot register `ErgoFlow` federally with confidence while a seller of
  ergonomic consumer accessories is already using it in commerce.
- "Ergo" + a flow/air word is the single most crowded naming space in this
  category. That is the real signal: the name is generic enough that five
  unrelated parties independently landed on it.

**Recommendation, bluntly: change the name now, while it costs you nothing but
a find-and-replace.** `BRAND` lives in exactly one place (`lib/site.ts:31`), so
the code cost is one line. Pick something with a clear `.com` and no existing
seller. Then do a free knock-out search on the new name at
`tmsearch.uspto.gov` before committing (search the word, phonetic equivalents,
and the relevant class — 09/18/22 depending on how it is described).

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
  next ErgoFlow product is **ready to order**."
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
