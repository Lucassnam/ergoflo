import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { BRAND, CONTACT_EMAIL, PRICING, SHIP_WINDOW } from "@/lib/site";

export const metadata: Metadata = {
  title: "Investors",
  description: `The thesis, the status, and the unit economics behind ${BRAND} — an active-cooling panel that retrofits into packs people already own.`,
};

/* NOTE FOR THE FOUNDER
   Every figure below is either a spec we've measured or an explicitly
   labelled target. Nothing here claims revenue, users, or a raise size.
   When you have a round assembled, add it to THE ASK section. Do not
   promote any "target" wording to fact without a number behind it. */

const THESIS = [
  {
    k: "The category is passive",
    v: "Every mainstream “ventilated” back panel is shaped foam or suspended mesh. None of them move air. The entire premise of the category is that convection will do the work.",
  },
  {
    k: "The cost curve arrived",
    v: "Brushless micro-fans, PWM controllers, and high-density Li-ion cells are all commodity parts now. A quiet, 46-hour cooling panel was not buildable at this bill of materials five years ago.",
  },
  {
    k: "Retrofit beats replacement",
    v: `Selling a $${PRICING.total} accessory into an installed base of packs people already own avoids competing with Osprey, Deuter, and Jansport on their own turf.`,
  },
];

const STATUS = [
  ["Product", "Working prototype; specs measured on bench"],
  ["Manufacturing", "PETG + TPU, 3D-printed tooling path for first run"],
  ["Channel", "Direct preorder, Stripe-hosted checkout, no backend"],
  ["Distribution", SHIP_WINDOW],
];

const ECONOMICS = [
  {
    label: "Preorder deposit",
    value: `$${PRICING.deposit}`,
    note: "Collected at reservation. Funds tooling before the run.",
  },
  {
    label: "Retail, first run",
    value: `$${PRICING.total}`,
    note: `Balance of $${PRICING.atShipping} charged at fulfilment.`,
  },
  {
    label: "Working capital exposure",
    value: "Deposit-funded",
    note: "Production is triggered by demand, not ahead of it.",
  },
];

const RISKS = [
  {
    q: "Fit fragmentation",
    a: "Packs vary. The first run targets 15–45L bags with a suspended back panel — a large but bounded slice. Compatibility guidance ships with the product, and fit data from run one directs the geometry of run two.",
  },
  {
    q: "Battery logistics",
    a: "A 2000mAh Li-ion cell brings shipping and certification requirements. Cell selection and packaging are being specified against those constraints rather than retrofitted to them later.",
  },
  {
    q: "Fast-follow risk",
    a: "The idea is copyable; the 26 dB noise floor and 168 g weight are not trivially so. Defensibility is execution quality plus being first into an installed base, not a patent moat.",
  },
  {
    q: "Preorder credibility",
    a: "Deposits are small, and non-refundable only once production begins. Under-promising the ship window is deliberate — the first run is sized to what preorders actually fund.",
  },
];

export default function Investors() {
  return (
    <>
      <section className="bloom relative overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-28">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              Investors
            </p>
            <h1 className="mt-4 headline text-[clamp(2.2rem,6vw,4rem)]">
              A hardware category that{" "}
              <span className="accent-text">never got its upgrade.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-dim sm:text-[19px]">
              {BRAND}{" "}
              is an active-cooling panel that retrofits into the pack someone
              already owns. Below is where the product actually stands, what
              we&rsquo;ve measured, and what we haven&rsquo;t.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="headline text-[clamp(1.7rem,3.6vw,2.4rem)]">
              Thesis
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-col gap-4">
            {THESIS.map((t, i) => (
              <Reveal key={t.k} delay={i * 0.07}>
                <div className="rim rounded-2xl bg-surface-2 p-7">
                  <h3 className="headline text-[16px]">
                    {t.k}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-fg-dim">
                    {t.v}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="headline text-[clamp(1.7rem,3.6vw,2.4rem)]">
              Where it stands
            </h2>
          </Reveal>
          <div className="mt-8">
            {STATUS.map(([k, v], i) => (
              <Reveal key={k} delay={i * 0.05}>
                <div>
                  <div className="hairline h-px w-full" />
                  <div className="flex items-baseline justify-between gap-6 py-4">
                    <span className="text-[14.5px] text-fg-dim">{k}</span>
                    <span className="text-right font-mono text-[14px] text-fg">
                      {v}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="hairline h-px w-full" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center headline text-[clamp(1.7rem,3.6vw,2.4rem)]">
              Unit model
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-[14.5px] text-fg-dim">
              First-run pricing. Component and landed costs are still being
              quoted, so no margin figure is published here yet.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/[0.07] sm:grid-cols-3">
            {ECONOMICS.map((e, i) => (
              <Reveal key={e.label} delay={i * 0.07}>
                <div className="flex h-full flex-col gap-2 bg-surface px-7 py-10">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-fg-faint uppercase">
                    {e.label}
                  </span>
                  <span className="accent-text font-mono text-[clamp(1.6rem,3.4vw,2.2rem)] leading-none font-semibold tracking-[-0.02em]">
                    {e.value}
                  </span>
                  <span className="mt-1 text-[13.5px] leading-relaxed text-fg-dim">
                    {e.note}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="headline text-[clamp(1.7rem,3.6vw,2.4rem)]">
              What could go wrong
            </h2>
            <p className="mt-4 text-[14.5px] text-fg-dim">
              The four we take seriously, and what we&rsquo;re doing about each.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {RISKS.map((r, i) => (
              <Reveal key={r.q} delay={i * 0.06}>
                <div className="rim h-full rounded-2xl bg-surface-2 p-7">
                  <h3 className="headline text-[15.5px]">
                    {r.q}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-fg-dim">
                    {r.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bloom relative overflow-hidden px-5 py-24 text-center sm:px-8">
        <div className="relative z-10 mx-auto max-w-xl">
          <Reveal>
            <h2 className="headline text-[clamp(1.9rem,4.6vw,3rem)]">
              Want the deck?
            </h2>
            <p className="mx-auto mt-5 text-[16px] leading-relaxed text-fg-dim">
              Bench data, bill of materials, and the production plan go out on
              request. One email, no form.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  `${BRAND} — investor materials`
                )}`}
                className="glow-btn inline-flex items-center justify-center rounded-full px-8 py-4 text-[16px] font-medium tracking-tight"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
