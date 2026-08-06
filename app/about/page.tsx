import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import PreorderButton from "@/components/PreorderButton";
import {
  BRAND,
  NO_PARTNERSHIP_NOTICE,
  TEAM,
  TRADEMARK_NOTICE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${BRAND} exists, who it’s for, and how a slab of foam became the problem worth solving.`,
};

/* NOTE FOR THE FOUNDER
   The fan count here is TWO BLOWERS, matching PARTS and SPECS in
   lib/site.ts as of 2026-08-04. It has now changed twice — two, then
   one, then two again — and each time this file had to be edited by
   hand, because the design narrative is prose and cannot read from
   lib/site.ts. If you change it a third time, grep the whole repo for
   "blower", "axial", "4-6" and "PETG" before you ship. A visitor who
   reads the pricing table and then /about is exactly the visitor you
   cannot afford to confuse.

   THE 26 dB TARGET IS THE WEAK POINT NOW. It was set against a single
   axial fan. Two blowers at equal airflow are louder. Measure it before
   that claim is ever firmed up.

   CLAIMS NOTE 2026-07-29: this page previously narrated battery
   certification work (UN38.3, IEC 62133) as though it were underway,
   and closed with "the engineering questions are answered". No cell has
   been selected and nothing has been measured. Both were rewritten. Do
   not restore a past-tense telling of work that has not happened —
   this page's whole persuasive value is that it admits what failed. */

const PRINCIPLES = [
  {
    num: "01",
    title: "Retrofit, don’t replace",
    body: "You already own a pack that fits you and has your things in it. Asking you to throw it away to get cooler means a worse product at a bigger price. The cooling should be the part you add.",
  },
  {
    num: "02",
    title: "Targets labelled as targets",
    body: "26 dB, 168 g, 4-6 hours: every one of those is a design target we have not measured, and we label it that way everywhere it appears. We would rather you trusted the number we publish after we have actually taken it.",
  },
];

const TIMELINE = [
  [
    "The category is passive, and nobody says so",
    "Osprey AntiGravity, Deuter Aircomfort, Gregory FreeFloat: the best-known back-panel systems are all described by their own makers as tensioned mesh over a frame. Vaucluse even sells a dedicated retrofit ventilation frame, and it works the same way. Every one of them builds an air gap and leaves the moving of air to you.",
  ],
  [
    "The first one was terrible",
    "Two 80mm computer fans zip-tied to a cut-down laptop stand, run off a power bank in the water-bottle pocket. Loud enough to get looks on a train, heavy enough to feel dishonest. It was also, obviously, cooler, and that was enough to keep going.",
  ],
  [
    "We tried one fan and went back to two",
    "We moved to a single axial fan to kill two noise sources and two failure points, and for a while that was the design. It could not move enough air through a 5 mm channel to be worth carrying. So we went back to two PWM blowers, mounted on a rigid deck so vibration never reaches your back. Blowers push against resistance in a way axial fans do not, and a 5 mm channel is mostly resistance. That reversal cost us runtime, 4-6 hours per set of batteries instead of 9-12, and it made the 26 dB target harder than it was.",
  ],
  [
    "Rigid backing was the wrong instinct",
    "A stiff plate holds an air channel open right up until a spine moves. Swapping it for tensioned 3D spacer mesh, 5mm loft held under load by the PETG frame itself, fixed the airflow and the way the panel sits on a back in one change.",
  ],
  [
    "We gave up on the rechargeable battery, and it made the product better",
    "A 2000mAh lithium cell is easy to buy and hard to ship: UN38.3 transport testing, IEC 62133, air-freight rules, and a cell that can vent or catch fire strapped to somebody’s back. We were going to do it anyway. Then we asked what the product loses if it just takes AA batteries out of an empty compartment, and the answer was a nicer spec sheet and nothing else. You buy the batteries, you swap them at a gas station, and there is no charging cable to forget. It’s a worse line on paper and a much better thing to actually put in the world.",
  ],
  [
    "A preorder, and what that costs you",
    "168 g, 4-6 hours, 26 dB: all targets, none of them measured, on a design with no cell chosen and no test report to its name. We spent a while refusing to take money at this stage, and the argument against it hasn’t gone away, because what is left is most of the engineering rather than a manufacturing run. We’re taking preorders anyway, because the build needs funding to happen at all. Be clear-eyed about the deal. Preorders are final, so if you change your mind we can’t give the money back, because by then it will already be spent on the build. What we do guarantee is that if we’re late you can walk away with a full refund, and if we abandon it you get every cent back. If that isn’t a bet you want to make, the notify list costs nothing.",
  ],
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-28">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="mb-6"
            />
            <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              About
            </p>
            <h1 className="mt-4 headline text-[clamp(2.2rem,6vw,4rem)]">
              Every part of a backpack improved{" "}
              <span className="accent-text">except the one touching your
              back</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-dim sm:text-[19px]">
              Straps became adjustable, frames got lighter. The surface
              actually pressed against your spine, the one
              that decides whether you arrive comfortable, is still a slab of
              closed-cell foam. It does nothing.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rim rounded-3xl bg-surface-2 p-8 sm:p-10">
              <p className="text-[16px] leading-relaxed text-fg-dim">
                {BRAND} started as a commute problem. Twenty minutes on foot
                from a train, a laptop in the pack, and a shirt that had to be
                changed on arrival, every day, all summer. A warm machine and a
                warm back, sealed either side of a closed-cell foam pad, with
                nowhere for the heat to go.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-fg-dim">
                Everything sold as a fix moves the foam around: channels cut
                into it, mesh suspended over it, shapes that widen the gap and
                then rely on you walking fast enough to flush it. All of that
                is a bet that convection will show up, and on a still August
                platform it doesn’t.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-fg-dim">
                So we went after the boring version instead: two quiet blowers
                and a tensioned mesh window between your back and the bag,
                running off a cell small enough to forget about, sized to fit
                the pack you already carry. You keep your backpack, and there
                is no app.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center headline text-[clamp(1.8rem,4vw,2.6rem)]">
              What we hold to
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.08}>
                <div className="rim h-full rounded-2xl bg-surface-2 p-7">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-neutral-400">
                    {p.num}
                  </p>
                  <h3 className="mt-4 headline text-[17px]">{p.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-fg-dim">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="mb-4 text-center headline text-[clamp(1.8rem,4vw,2.6rem)]">
              How it got here
            </h2>
            <p className="mx-auto mb-10 max-w-md text-center text-[14.5px] leading-relaxed text-fg-dim">
              Including the parts that didn’t work, because those are the ones
              that shaped it.
            </p>
          </Reveal>
          <ol className="list-none space-y-0 p-0">
            {TIMELINE.map(([title, body], i) => (
              <Reveal as="li" key={title} delay={Math.min(i * 0.06, 0.3)}>
                <div className="flex gap-5 py-5">
                  <div className="flex flex-col items-center pt-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-neutral-900"
                    />
                    {i < TIMELINE.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="mt-2 w-px flex-1 bg-neutral-200"
                      />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="headline text-[16px]">{title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-dim">
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-center sm:px-8">
        <div className="relative z-10">
          <Reveal>
            {/* WHO BUILDS IT — names only, no titles, no ownership claim.

                NO_PARTNERSHIP_NOTICE must stay directly beneath this. It is
                not boilerplate: publicly presenting people as a team is
                evidence of an implied general partnership (Cal. Corp. Code
                §16202), which would make each of them personally liable for
                the whole venture. Both are minors and no entity exists, so
                the page states what is true — a student project — and claims
                no structure. Do not add roles or titles here. */}
            <div className="mx-auto mb-24 max-w-2xl text-left">
              <h2 className="text-center headline text-[clamp(1.8rem,4vw,2.6rem)]">
                Who&rsquo;s building it
              </h2>
              <p className="mt-6 text-center text-[16px] leading-relaxed text-fg-dim">
                {BRAND} is a student business project by{" "}
                {TEAM.slice(0, -1).join(", ")} and {TEAM[TEAM.length - 1]}. It
                is not a company and no business entity stands behind it.
                We&rsquo;re two students taking preorders for something we
                haven&rsquo;t built yet.
              </p>
              <p className="mt-8 text-[12px] leading-relaxed text-neutral-500">
                {NO_PARTNERSHIP_NOTICE}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
                {TRADEMARK_NOTICE}
              </p>
            </div>

            <h2 className="headline text-[clamp(1.9rem,4.6vw,3rem)]">
              Back the first run.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-fg-dim">
              You’d be paying for a design rather than a finished product, and
              preorders are final. If you’d rather wait, the notify list costs
              nothing.
            </p>
            <div className="mt-8 flex justify-center">
              <PreorderButton size="lg" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
