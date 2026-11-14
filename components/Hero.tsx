import Link from "next/link";
import PreorderButton from "@/components/PreorderButton";
import { PREORDERS_ENABLED, TAGLINE } from "@/lib/site";

/**
 * Opening section. Replaced the scroll-morph hero (20 remote photos that
 * swirled into an arc and held the page's scroll hostage until the
 * animation finished) on 2026-11-14.
 *
 * Everything here is server-rendered and animated with CSS only, so the
 * headline and the buy control are on screen the instant the HTML lands,
 * with no JS to wait for and no scroll-jacking. The motion is the airflow
 * behind the copy: thin streamlines with a cyan pulse running along each,
 * which says "air moving across your back" without a single photo. The
 * keyframes live in globals.css (hero-*), and the reduced-motion block there
 * freezes all of it.
 */

/* Streamlines across a 1440x800 field. Deterministic so server and client
   agree. Each line: vertical position, wave amplitude, pulse duration (s)
   and start offset (s). */
const LINES = [
  { y: 150, a: 34, d: 9.5, o: -1.2 },
  { y: 230, a: -26, d: 11, o: -6.4 },
  { y: 310, a: 42, d: 8.2, o: -3.1 },
  { y: 390, a: -38, d: 10.4, o: -8.0 },
  { y: 470, a: 30, d: 9.0, o: -4.7 },
  { y: 550, a: -44, d: 12, o: -0.6 },
  { y: 630, a: 28, d: 8.8, o: -7.3 },
  { y: 710, a: -32, d: 10.8, o: -2.5 },
];

function streamline(y: number, a: number) {
  return `M-120 ${y} C 240 ${y - a}, 520 ${y + a}, 760 ${y} S 1240 ${y - a * 0.8}, 1560 ${y + a * 0.3}`;
}

function Airflow() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {LINES.map((l, i) => {
        const d = streamline(l.y, l.a);
        return (
          <g key={i}>
            {/* The resting line: a hairline you only half notice. */}
            <path
              d={d}
              pathLength={1000}
              stroke="#0a0a0a"
              strokeOpacity={0.06}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            {/* The moving pulse: a short cyan dash travelling the line. */}
            <path
              d={d}
              pathLength={1000}
              stroke="var(--color-cyan)"
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="90 910"
              vectorEffect="non-scaling-stroke"
              className="hero-flow"
              style={{
                animationDuration: `${l.d}s`,
                animationDelay: `${l.o}s`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-64px)] items-center justify-center overflow-hidden bg-white px-5 sm:px-8">
      <Airflow />

      {/* Clears the field behind the copy so the lines frame the headline
          instead of running through it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 46% 42% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.92) 45%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center py-20 text-center">
        <p
          className="hero-rise inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.16em] text-neutral-500 uppercase backdrop-blur-sm"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="hero-ping absolute inline-flex h-full w-full rounded-full bg-cyan" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
          </span>
          {PREORDERS_ENABLED
            ? "In development · preorders open"
            : "In development · join the waitlist"}
        </p>

        <h1 className="headline mt-8 text-[clamp(2.9rem,8vw,6rem)] leading-[1.02] text-neutral-950">
          <span className="hero-rise block" style={{ animationDelay: "90ms" }}>
            Never sweat
          </span>
          <span className="hero-rise block" style={{ animationDelay: "200ms" }}>
            again<span className="text-cyan">.</span>
          </span>
        </h1>

        <p
          className="hero-rise mx-auto mt-7 max-w-xl text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-neutral-600"
          style={{ animationDelay: "320ms" }}
        >
          {TAGLINE} Two blower fans move air through the gap between your
          back and the pack, instead of waiting for you to walk fast enough.
        </p>

        <div
          className="hero-rise mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
          style={{ animationDelay: "430ms" }}
        >
          <PreorderButton size="lg" />
          <Link
            href="#problem"
            className="group inline-flex items-center gap-2 text-[15px] text-neutral-600 transition-colors hover:text-black"
          >
            See how it works
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path
                d="M6 1v10M1.5 6.5 6 11l4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll cue: a short line that keeps drawing downward. */}
      <div
        aria-hidden="true"
        className="hero-rise absolute bottom-8 left-1/2 h-10 w-px -translate-x-1/2 overflow-hidden bg-neutral-200"
        style={{ animationDelay: "700ms" }}
      >
        <span className="hero-cue absolute inset-x-0 top-0 h-1/2 bg-neutral-800" />
      </div>
    </section>
  );
}
