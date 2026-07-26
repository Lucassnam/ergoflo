"use client";

import { useState } from "react";

const MODES = {
  low: {
    key: "low" as const,
    name: "Low",
    blurb: "Whisper mode. What you leave it on for a commute, a lecture hall, a desk.",
    spin: 2.4,
    plume: 0.45,
    bars: 2,
  },
  high: {
    key: "high" as const,
    name: "High",
    blurb: "Full draw. For the last climb, the platform in August, the run for the train.",
    spin: 0.6,
    plume: 1,
    bars: 4,
  },
};

type ModeKey = keyof typeof MODES;

function Fan({ spin }: { spin: number }) {
  return (
    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.35)" }}
      />
      <div
        className="absolute inset-0 motion-reduce:animate-none"
        style={{ animation: `ef-spin ${spin}s linear infinite` }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d="M 50 40 C 63 36 76 42 84 54"
              fill="none"
              stroke="rgba(34,211,238,0.5)"
              strokeWidth="3.4"
              strokeLinecap="round"
              transform={`rotate(${(i * 360) / 7} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="9" fill="#0e1014" stroke="rgba(34,211,238,0.6)" />
        </svg>
      </div>
    </div>
  );
}

export default function FanModes() {
  const [mode, setMode] = useState<ModeKey>("low");
  const m = MODES[mode];

  return (
    <div className="rim glass relative overflow-hidden rounded-3xl p-7 sm:p-10">
      <style>{`@keyframes ef-spin { to { transform: rotate(360deg); } }`}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(50% 60% at 50% 40%, rgba(34,211,238,${
            0.05 + m.plume * 0.14
          }), transparent 70%)`,
          transition: "background 500ms ease",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-7">
        <div
          className="rim inline-flex rounded-full bg-surface-2/80 p-1"
          role="group"
          aria-label="Fan speed"
        >
          {(Object.keys(MODES) as ModeKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={mode === k}
              onClick={() => setMode(k)}
              className={`relative z-10 rounded-full px-6 py-2 font-mono text-[12px] tracking-[0.12em] uppercase transition-colors ${
                mode === k
                  ? "bg-gradient-to-r from-cyan to-blue text-black"
                  : "text-fg-dim hover:text-fg"
              }`}
            >
              {MODES[k].name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <Fan spin={m.spin} />
          <div className="flex flex-col gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full"
                style={{
                  width: 26 + i * 14,
                  background:
                    i < m.bars
                      ? "linear-gradient(90deg, #22d3ee, #3b82f6)"
                      : "rgba(255,255,255,0.08)",
                  opacity: i < m.bars ? 1 : 1,
                  transition: "background 380ms ease",
                }}
              />
            ))}
          </div>
          <Fan spin={m.spin} />
        </div>

        <p className="max-w-md text-center text-[15px] leading-relaxed text-fg-dim">
          {m.blurb}
        </p>
      </div>
    </div>
  );
}
