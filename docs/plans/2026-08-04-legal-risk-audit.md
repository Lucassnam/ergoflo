# Legal risk audit — live commerce

**Date:** 2026-08-04
**Scope:** whole site, as it stands with a **live** Stripe payment link
**Auditor:** Claude (not a lawyer, this is not legal advice)
**Requested framing:** "lowest legal risk… it's just a teen product"

---

## On that framing, once, then I'll drop it

Being a teenager does not reduce legal exposure. It changes its shape, and two
of the changes are unfavourable:

- **The contract runs one way.** A minor's contract is voidable (Cal. Family
  Code §6710). Your buyer is bound by your Terms; you may not be. So the
  arbitration clause, the class-action waiver and the liability cap — the three
  things doing the most protective work — are the parts most likely to fail
  when you need them.
- **There is no entity, so there is no shield.** Liability lands on personal
  assets, and for a minor's business activity, plausibly on parents. An LLC is
  the normal fix and a minor generally cannot form one alone.

What *does* genuinely lower your risk right now is that **you have zero
orders**. That is real and it is worth using. It disappears with the first
sale, not on your 18th birthday.

The good news: the disclosure posture on this site is already unusually strong
— stronger than most funded hardware startups. The gaps below are structural,
not cosmetic.

---

## Fixed during this audit

These were live defects. All are corrected and the build passes.

| # | Defect | Where |
| --- | --- | --- |
| 1 | Liability cap read *"You have not paid us anything, because nothing here is for sale"* — false, and sitting **inside the cap clause**, which is exactly where an unconscionability argument starts | `app/terms/page.tsx` §7 |
| 2 | §1 said *"it is the reason preorders are not open yet"* — preorders **are** open | `app/terms/page.tsx` §1 |
| 3 | **No buyer eligibility clause at all**, on a product aimed at students | `app/terms/page.tsx` §2 (new "Who may order") |
| 4 | Privacy policy dated **29 July** despite the Stripe/preorder rewrite — an inaccurate effective date is a CalOPPA defect | `app/privacy/page.tsx` |
| 5 | Terms + Refunds dated 3 August after 4 August edits | both |
| 6 | `/refunds` and `/preorder` **missing from sitemap**; comment still claimed /refunds was deleted. A site that takes money and omits its cancellation terms from the sitemap looks like it is hiding them | `app/sitemap.ts` |
| 7 | §4 still titled "The waitlist" | `app/terms/page.tsx` |

---

## CRITICAL — the three that actually matter

### C1. Stripe account capacity — highest *practical* risk

Stripe's Services Agreement requires the account holder to be able to form a
binding contract: **18+**. If this account was opened by a minor, Stripe's
remedies on discovery are account closure, **freezing the balance**, and
**reversing payouts** — while you still owe every customer a refund. That is
the scenario where you personally owe money you cannot access.

This is more likely to bite you than the patent, and sooner. Stripe verifies
identity against SSN and DOB at payout time, not at signup.

**Fix:** an adult (parent/guardian) is the account holder and is named in
`SELLER_OF_RECORD`. Nothing else closes it.

### C2. No seller of record

`SELLER_OF_RECORD` is `""`. Right now `/terms` §1 renders a notice telling
buyers plainly that no adult is named and that a minor's contract is voidable.
That disclosure is the honest and correct thing to publish — **and it is also
an admission that the buyer has no reliable counterparty.**

Selling in that state is legal-ish and commercially fragile. The buyer's real
protection is their card issuer, which means your first dispute goes straight
to chargeback.

**Fix:** same as C1. They are one action.

### C3. Patent — US 11,779,097 (Vaucluse Gear)

35 U.S.C. §271(a) makes an **offer to sell** an act of infringement on its own;
nothing has to ship. You now publish a definite product at a definite price.
The risk moved from theoretical to live the moment the Stripe link went in.

No freedom-to-operate opinion exists. The plausible design-around is that
claim 1 requires an **adjustable** gap and your 5 mm spacer-mesh loft is fixed
— but adding a fan is *not* a design-around under the all-elements rule.

**Realistically:** a competitor sues when you are visible and worth suing.
At zero-to-ten orders you are neither. The exposure scales with your success,
which is a strange incentive to sit under.

**Fix options, cheapest first:** (a) keep volume low and stay unremarkable;
(b) $2–5k FTO opinion from a patent attorney before any real marketing push;
(c) read claim 1 with an attorney and design deliberately around it.

---

## HIGH

### H1. Route A keeps no order record — and you have promised things that need one

The live payment link writes **nothing** to your `preorders` table. The Stripe
dashboard is your only order list. But you have published two promises that
require actively knowing who ordered and when:

- refund within **5 business days** of request (`/refunds`)
- a **revised-date email with an unconditional refund offer** if the 120-day
  window slips (FTC Mail Order Rule, 16 CFR 435)

A missed Mail Order Rule notice is a per-violation FTC matter, and "I didn't
check the dashboard" is not a defence.

**Fix now, free:** turn on Stripe email notifications for successful payments,
and put a calendar reminder at **day 100** from your first order. Later:
switch to Route B (`functions/api/checkout.ts` + webhook are already built and
tested) so orders land in your own database.

### H2. Product liability — the uncapped one

Your $100/purchase-price liability cap **will not** limit personal-injury
claims. Cal. Civ. Code §1668 voids attempts to contract away liability for
wilful injury or violation of law, and California applies **strict liability**
to defective products — no negligence needed.

You are selling a **lithium-ion device worn against a person's back**. A cell
failure is a burn injury. With no entity, that claim reaches personal assets.

**Fix:** do not ship anything until (a) an entity exists, (b) you carry product
liability insurance, and (c) the cell supplier holds UN38.3 and IEC 62133
reports. Selling now and shipping later is survivable; shipping without these
is the thing that could actually ruin someone.

### H3. No insurance

None. General liability + product liability for a small hardware run is roughly
$500–1,500/year. Cannot be bought by a minor; the entity buys it.

### H4. Sales tax — unhandled

Stripe Tax is off. No nexus analysis. At your volume the economic-nexus
thresholds (usually $100k or 200 transactions per state) are far away, and CA
has no small-seller registration requirement that bites at ten orders. **Low
risk today, becomes real at scale.** Turn on Stripe Tax before you promote.

### H5. AI-generated imagery

Both homepage images are AI-generated (`Gemini_Generated_Image_*`). The
"student" image shows a **synthetic person** and a backpack with **no ErgoFlo
panel on it**.

Currently mitigated: both carry a badge and an explicit caption, and the
student image states outright that the person is not real, no panel is fitted,
and it is not the product in use. **That disclosure is what keeps it lawful.**

**Do not** add to that image: a name, a quote, a star rating, "verified buyer",
or any wording implying ownership or endorsement. Any of those converts an
illustration into a fabricated endorsement (16 CFR Part 255), which is a
straightforward FTC deception case.

---

## MEDIUM

| # | Risk | Note |
| --- | --- | --- |
| M1 | **Trademark.** `ERGOFLO` is a live, incontestable federal reg. (No. 4286129, Class 021 mop handles). Distant class, but an exact character match — and you are now **using the name in commerce on goods**, which is a different posture from a waitlist. | Knock-out search in Class 018/009 before any packaging, logo, or filing spend. |
| M2 | **26 dB claim.** Set against one axial fan; the design is now two blowers, which are louder at equal airflow. `/about` principle 02 makes quietness a gate the product must clear. | Labelled a target everywhere, so defensible — but measure before firming. |
| M3 | **"Launching Q2 2027"** on Passive Panel and Complete Backpack — a specific, checkable availability claim on two products with no design work started. Availability claims are the easiest FTC deception cases to prove. | Nothing is for sale on those, so no Mail Order clock. Update or remove the date if Q2 2027 nears. |
| M4 | **`/privacy` names "Vercel" as host.** Site moved to Cloudflare Pages (commit 7f92234). Naming the wrong processor in the section whose entire job is naming processors is a CalOPPA accuracy defect. | **Not fixed — my edit was declined earlier.** One-line change; say the word. |
| M5 | **Retention section covers waitlist emails only.** Says nothing about how long preorder names, addresses and order records are kept. | Add a sentence: order records kept 7 years (tax), addresses deleted after fulfilment. |
| M6 | **CPSC.** Once a product exists you acquire a duty to report substantial product hazards within 24 hours (15 U.S.C. §2064(b)). Battery products draw attention. | Not yet applicable. Applies the day you ship. |
| M7 | **CAN-SPAM.** Any commercial launch email needs a valid physical postal address. Both operators are minors. | Use a PO box or school address — **never a home address.** |
| M8 | **Arbitration/class waiver enforceability.** Standard clauses, but a minor-drafted contract with no entity invites an unconscionability challenge. | Attorney review at the same time as C1/C2. |

---

## LOW / housekeeping

- **Dead code:** `functions/api/checkout.ts` and `functions/api/stripe-webhook.ts`
  are fully built, tested and **unused** while Route A is active. Keep them —
  they are the H1 fix — but they are unreachable today.
- **Build guard:** nothing stops a `buy.stripe.com/test_...` link shipping to
  production, which would render a live-looking buy button that cannot take
  money. Offered, not yet built.
- **`hello@ergoflo.tech` must actually receive mail.** `/privacy` promises a
  5-business-day answer to deletion requests and `/refunds` promises refunds in
  the same window. A dead mailbox turns both into broken commitments. **Verify
  by sending a real test email today.**

---

## What I'd actually do, in order

1. **Today, free:** turn on Stripe payment notifications. Send a test email to
   `hello@ergoflo.tech` and confirm it arrives. Set a day-100 calendar reminder.
2. **This week, free:** have a parent/guardian take over the Stripe account and
   set `SELLER_OF_RECORD`. This single action closes C1 and C2 — the two
   highest-probability risks on this list.
3. **Before promoting anywhere:** decide on the patent question. Quiet and small
   is a legitimate strategy; visible without an FTO opinion is not.
4. **Before shipping a single physical unit:** entity + product liability
   insurance + certified cell. Non-negotiable — H2 is the only item here that
   can cause harm that money cannot undo.

Taking preorders while you sort 1–3 is defensible **because** the refund policy
is unconditional and the disclosures are strong. Shipping before 4 is not.
