import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ReserveButton from "@/components/ReserveButton";
import { BRAND, PRICING } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${BRAND} exists, who it’s for, and how a foam pad became the problem worth solving.`,
};

const PRINCIPLES = [
  {
    num: "01",
    title: "Retrofit, don’t replace",
    body: "Nobody needs another backpack. You already own one you like. The cooling should be the part you add, not the bag you throw away.",
  },
  {
    num: "02",
    title: "Quiet or it doesn’t ship",
    body: "A fan you can hear is a fan you turn off. 26 dB was a hard gate, not a target — everything else was designed around hitting it.",
  },
  {
    num: "03",
    title: "Numbers you can check",
    body: "Every figure on this site came off a bench, not a brainstorm. Where we’re still measuring, we say so instead of rounding up.",
  },
];

const TIMELINE = [
  ["Foam, everywhere", "Every “ventilated” back panel on the market turns out to be passive. Shaped foam, a mesh sock, and hope."],
  ["First ugly prototype", "Two computer fans zip-tied to a cut-down laptop stand. Loud, heavy, and unmistakably cooler."],
  ["The quiet problem", "Brushless fans plus PWM control drop the noise floor to 26 dB. The whole design reorganises around that constraint."],
  ["Tension, not rigidity", "Swapping a rigid backing for a tensioned 3D spacer mesh fixes both airflow and the way the panel sits on a spine."],
  ["Preorders open", "168 g, 46 hours, IPX4. Now it’s a question of how many we build in the first run."],
];

export default function About() {
  return (
    <>
      <section className="bloom relative overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-28">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              About
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,6vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
              The back panel is the{" "}
              <span className="accent-text">last unsolved part</span> of a
              backpack.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-dim sm:text-[19px]">
              Straps got adjustable. Fabrics got waterproof. Frames got light.
              The panel pressed against your spine — the one surface that
              actually decides whether you arrive comfortable — is still a slab
              of foam doing nothing at all.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rim rounded-3xl bg-surface-2 p-8 sm:p-10">
              <p className="text-[16px] leading-relaxed text-fg-dim">
                {BRAND} started as a commute problem. A 20-minute walk from a
                train, a laptop in a pack, and a shirt that had to be changed on
                arrival — every day, all summer. Every product that claimed to
                fix it moved the foam around instead of moving air.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-fg-dim">
                So we built the boring version of the fix: put two quiet fans and
                a tensioned mesh window between your back and the bag, run it off
                a battery small enough that you forget it&rsquo;s there, and make
                it fit the pack you already carry.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
              What we hold to
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.08}>
                <div className="rim h-full rounded-2xl bg-surface-2 p-7">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-cyan">
                    {p.num}
                  </p>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight">
                    {p.title}
                  </h3>
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
            <h2 className="mb-10 text-center text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
              How it got here
            </h2>
          </Reveal>
          <ol className="list-none space-y-0 p-0">
            {TIMELINE.map(([title, body], i) => (
              <Reveal as="li" key={title} delay={Math.min(i * 0.06, 0.3)}>
                <div className="flex gap-5 py-5">
                  <div className="flex flex-col items-center pt-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-cyan"
                      style={{ boxShadow: "0 0 10px 2px rgba(34,211,238,0.7)" }}
                    />
                    {i < TIMELINE.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="mt-2 w-px flex-1 bg-gradient-to-b from-cyan/40 to-transparent"
                      />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-[16px] font-semibold tracking-tight">
                      {title}
                    </h3>
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

      <section className="bloom relative overflow-hidden px-5 py-24 text-center sm:px-8">
        <div className="relative z-10">
          <Reveal>
            <h2 className="text-[clamp(1.9rem,4.6vw,3rem)] font-semibold tracking-[-0.03em]">
              Be in the first run.
            </h2>
            <div className="mt-8 flex justify-center">
              <ReserveButton size="lg">
                Reserve — ${PRICING.deposit} deposit
              </ReserveButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
