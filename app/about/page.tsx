import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import WaitlistButton from "@/components/WaitlistButton";
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
   The fan count here is ONE, matching PARTS and SPECS in lib/site.ts.
   An earlier draft of this page said "two fans" — if you ever change
   the design, this file and lib/site.ts have to move together. A
   visitor who reads the pricing table and then /about is exactly the
   visitor you cannot afford to confuse.

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
    body: "You already own a pack you like, that fits you, that has your things in it. Asking you to throw it away to get cooler is a worse product with a bigger price tag. The cooling is the part you add.",
  },
  {
    num: "02",
    title: "Quiet or it doesn’t ship",
    body: "A fan you can hear is a fan you switch off, and a fan switched off is a foam pad you overpaid for. 26 dB is the gate the design has to clear, and two prototypes were abandoned because you could plainly hear them across a room.",
  },
  {
    num: "03",
    title: "Targets labelled as targets",
    body: "26 dB. 168 g. 9–12 hours. Every one of those is a design target we have not yet measured, and we label it that way everywhere it appears. An unlabelled estimate is just marketing wearing a lab coat, and we would rather you trusted the number we publish after we have taken it.",
  },
];

const TIMELINE = [
  [
    "The category is passive, and nobody says so",
    "Osprey AntiGravity, Deuter Aircomfort, Gregory FreeFloat — the celebrated back-panel systems are all described by their makers as tensioned mesh over a frame. Vaucluse even sells a dedicated retrofit ventilation frame, and it works the same way. Every one of them builds an air gap and leaves the moving of air to you. Once you notice it, you can’t stop noticing it.",
  ],
  [
    "The first one was terrible",
    "Two 80mm computer fans zip-tied to a cut-down laptop stand, run off a power bank in the water-bottle pocket. Loud enough to get looks on a train, heavy enough to feel dishonest — and unmistakably, obviously cooler. That was the whole signal.",
  ],
  [
    "One fan beat two",
    "Two fans meant two noise sources, two failure points, and a battery that died before lunch. A single brushless fan under PWM control, mounted on a rigid deck so vibration never reaches your back, is the design we settled on — with 26 dB as the target it has to hit. Subtraction, not addition.",
  ],
  [
    "Rigid backing was the wrong instinct",
    "A stiff plate holds an air channel open beautifully until a spine moves. Swapping it for tensioned 3D spacer mesh — 5mm loft, held under load by TPU rails — fixed the airflow and the way the panel sits on a back, in one change.",
  ],
  [
    "The battery is still the open question",
    "A 2000mAh cell isn’t hard to buy. It’s hard to ship: UN38.3 transport testing, IEC 62133, air-freight rules. We haven’t selected a cell yet, and we’re deliberately looking for one whose supplier already holds those reports rather than trying to certify a product ourselves. That decision is ahead of us, not behind us.",
  ],
  [
    "A waitlist, not a pre-order",
    "168 g, 9–12 hours, 26 dB — all targets, none of them measured, on a design with no cell chosen and no test report to its name. We could take deposits at this stage. Plenty of projects do. We’d rather find out whether anyone wants this by asking, and come back for money when there’s a product to sell. What’s left isn’t a manufacturing question. It’s most of the engineering.",
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
              The back panel is the{" "}
              <span className="accent-text">last unsolved part</span> of a
              backpack.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-dim sm:text-[19px]">
              Straps got adjustable. Fabrics got waterproof. Frames got light.
              The one surface actually pressed against your spine — the one
              that decides whether you arrive comfortable — is still a slab of
              foam, doing nothing at all.
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
                changed on arrival — every day, all summer. The physics aren’t
                subtle: a warm machine and a warm back, sealed either side of a
                closed-cell foam pad, with nowhere for any of it to go.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-fg-dim">
                Everything sold as a fix moved the foam around. Channels cut
                into it. Mesh suspended over it. Clever shapes that widen the
                gap and then rely on you walking fast enough to flush it. All
                of it is a bet that convection will show up. On a still August
                platform, it doesn’t.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-fg-dim">
                So we built the boring version instead: put one quiet fan and a
                tensioned mesh window between your back and the bag, run it off
                a cell small enough that you forget it’s there, and make the
                whole thing fit the pack you already carry. No new backpack. No
                app. A fan, where a fan should have been for twenty years.
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
          <div className="mt-12 grid gap-4 md:grid-cols-3">
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
                is not a company, and it isn&rsquo;t selling anything &mdash;
                we&rsquo;re two students trying to find out whether this is
                worth building.
              </p>
              <p className="mt-8 text-[12px] leading-relaxed text-neutral-500">
                {NO_PARTNERSHIP_NOTICE}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
                {TRADEMARK_NOTICE}
              </p>
            </div>

            <h2 className="headline text-[clamp(1.9rem,4.6vw,3rem)]">
              Hear about it when it’s real.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-fg-dim">
              We’re not taking money for something that doesn’t exist. Leave an
              email and we’ll tell you if it ever does. That’s the whole pitch.
            </p>
            <div className="mt-8 flex justify-center">
              <WaitlistButton size="lg">Join the waitlist</WaitlistButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
