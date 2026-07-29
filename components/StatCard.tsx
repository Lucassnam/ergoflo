"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import CountUp from "./CountUp";
import type { HERO_STATS } from "@/lib/site";

type Stat = (typeof HERO_STATS)[number];

type Props = {
  stat: Stat;
  index: number;
};

/**
 * Hero stat card. Monochrome by design — the number and border used to light
 * up blue/red/cyan on scroll, which read as three unrelated brands in a row.
 * The border still firms up on first view so the card isn't inert; emphasis
 * now comes from weight instead of hue.
 */
export default function StatCard({ stat, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className={`flex h-full flex-col items-start gap-3 rounded-2xl border bg-white p-10 transition-colors duration-700 hover:border-neutral-400 sm:p-12 ${
        inView ? "border-neutral-300" : "border-neutral-200"
      }`}
    >
      <span className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* Sans, not the Baskerville `headline` utility — these are instrument
          readings, and the serif made them read as pull quotes. */}
      <CountUp
        to={stat.value}
        prefix={stat.prefix}
        suffix={stat.suffix}
        className="text-[clamp(2.75rem,5vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.04em] text-black tabular-nums"
      />
      <p className="mt-1 text-[16px] font-medium text-neutral-900">{stat.label}</p>
      <p className="text-[14px] leading-relaxed text-neutral-500">{stat.note}</p>
    </div>
  );
}
