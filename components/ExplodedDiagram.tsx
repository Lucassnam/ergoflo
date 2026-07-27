"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { MotionValue } from "motion/react";

const RX = 170; // half-width of the isometric top face
const RY = 76; // half-depth — flatter than a true isometric so the stack fits
const T = 11; // slab thickness
/* GAP must exceed 2*RY, otherwise an exploded layer still overlaps the one
   below it and paints over its detail (this hid a fan on the deck layer). */
const GAP = 140;
const CX = 300; // group origin inside the viewBox
const CY = 320;

/** Isometric slab: top face diamond plus two side faces so it reads as solid. */
function Slab({
  fill,
  edge,
  children,
}: {
  fill: string;
  edge: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <path d={`M ${-RX} 0 L 0 ${RY} L 0 ${RY + T} L ${-RX} ${T} Z`} fill={edge} />
      <path d={`M ${RX} 0 L 0 ${RY} L 0 ${RY + T} L ${RX} ${T} Z`} fill={edge} />
      <path
        d={`M 0 ${-RY} L ${RX} 0 L 0 ${RY} L ${-RX} 0 Z`}
        fill={fill}
        stroke="rgba(9,9,11,0.22)"
        strokeWidth="1.1"
      />
      {children}
    </>
  );
}

type LayerProps = {
  progress: MotionValue<number>;
  /** 0 = pack side (bottom of the stack), 3 = mesh (against your back). */
  index: number;
  total: number;
  label: string;
  detail: string;
  fill: string;
  edge: string;
  children?: React.ReactNode;
  reduced: boolean;
};

function Layer({
  progress,
  index,
  total,
  label,
  detail,
  fill,
  edge,
  children,
  reduced,
}: LayerProps) {
  // Spread symmetrically about the centre so the composition stays put
  // instead of climbing out of the frame.
  const centred = index - (total - 1) / 2;
  const travel = -centred * GAP;

  const y = useTransform(progress, [0, 1], [0, travel]);
  const labelOpacity = useTransform(progress, [0.4, 0.75], [0, 1]);

  // Stack order when collapsed: a couple of px so the edges read as separate.
  const restY = (total - 1 - index) * 5;

  return (
    <motion.g style={reduced ? { y: travel } : { y }}>
      <g transform={`translate(${CX} ${CY + restY})`}>
        <Slab fill={fill} edge={edge}>
          {children}
        </Slab>
        <motion.g style={{ opacity: reduced ? 1 : labelOpacity }}>
          <line
            x1={RX - 10}
            y1={2}
            x2={RX + 54}
            y2={2}
            stroke="rgba(9,9,11,0.3)"
            strokeWidth="1"
          />
          <circle cx={RX + 54} cy={2} r="2.4" fill="#0a0a0a" />
          <text
            x={RX + 64}
            y={-1}
            fill="#0a0a0a"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="var(--font-geist-sans), sans-serif"
          >
            {label}
          </text>
          <text
            x={RX + 64}
            y={15}
            fill="#71717a"
            fontSize="11.5"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {detail}
          </text>
        </motion.g>
      </g>
    </motion.g>
  );
}

/**
 * The single centrifugal fan, drawn in the isometric plane. Blades are swept
 * arcs off the hub rather than straight spokes so it reads as an impeller.
 */
function Fan() {
  const R = 84; // impeller radius along x
  const ry = (R * RY) / RX; // same radius projected onto the iso plane
  const BLADES = 11;

  return (
    <g>
      {/* housing */}
      <ellipse rx={R + 9} ry={ry + 4} fill="#ffffff" stroke="rgba(9,9,11,0.38)" strokeWidth="1.2" />
      <ellipse rx={R} ry={ry} fill="#f4f4f5" stroke="rgba(9,9,11,0.2)" strokeWidth="0.9" />

      {/* swept impeller blades */}
      {Array.from({ length: BLADES }, (_, i) => {
        const a = (i / BLADES) * Math.PI * 2;
        const b = a + 0.62; // sweep
        const inner = 0.34;
        const x1 = Math.cos(a) * R * inner;
        const y1 = Math.sin(a) * ry * inner;
        const x2 = Math.cos(b) * R * 0.94;
        const y2 = Math.sin(b) * ry * 0.94;
        const cx = Math.cos(a + 0.34) * R * 0.7;
        const cy = Math.sin(a + 0.34) * ry * 0.7;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
            fill="none"
            stroke="rgba(9,9,11,0.42)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}

      {/* motor hub */}
      <ellipse rx={R * 0.3} ry={ry * 0.3} fill="#e4e4e7" stroke="rgba(9,9,11,0.35)" strokeWidth="1" />
      <ellipse rx={R * 0.12} ry={ry * 0.12} fill="#52525b" />
    </g>
  );
}

/** Louvred intake slots on the pack-facing plate. */
function Intake() {
  return (
    <g>
      {[-2, -1, 0, 1, 2].map((n) => {
        const off = n * 26;
        const w = 62 - Math.abs(n) * 7;
        return (
          <g key={n} transform={`translate(${off} ${(off * RY) / RX})`}>
            <path
              d={`M ${-w} 0 L 0 ${(w * RY) / RX} L ${w} 0 L 0 ${(-w * RY) / RX} Z`}
              fill="#ffffff"
              stroke="rgba(9,9,11,0.3)"
              strokeWidth="1"
            />
          </g>
        );
      })}
    </g>
  );
}

/** Branching ducts that spread one fan's output across the panel. */
function Distributor() {
  const arm = (sx: number, sy: number) => (
    <path
      d={`M 0 0 L ${sx * 96} ${sy * 43}`}
      stroke="rgba(9,9,11,0.34)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  );
  return (
    <g>
      {arm(1, 1)}
      {arm(-1, -1)}
      {arm(1, -1)}
      {arm(-1, 1)}
      {[
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ].map(([sx, sy], i) => (
        <ellipse
          key={i}
          cx={sx * 96}
          cy={sy * 43}
          rx="13"
          ry="6"
          fill="#ffffff"
          stroke="rgba(9,9,11,0.32)"
          strokeWidth="1"
        />
      ))}
      <ellipse rx="17" ry="7.6" fill="#e4e4e7" stroke="rgba(9,9,11,0.34)" strokeWidth="1" />
    </g>
  );
}

export default function ExplodedDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <div id="exploded" ref={sectionRef} className="relative h-[230vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* pt clears the sticky header, which would otherwise cover the eyebrow */}
        <div className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8">
          <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Exploded view
          </p>
          <h2 className="headline mt-3 text-center text-[clamp(1.7rem,4vw,2.75rem)] text-black">
            Four layers. Nothing decorative.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-neutral-600">
            Air enters at the pack, gets moved by a single brushless fan, is
            split four ways by the distributor, and leaves through the mesh
            against your back.
          </p>

          <svg
            viewBox="0 0 840 640"
            className="mx-auto mt-1 block h-auto w-full max-w-3xl"
            style={{ maxHeight: "58vh" }}
            role="img"
            aria-label="Exploded diagram of the panel, following the airflow from the bag outward: intake, single brushless fan, air distributor, and 3D spacer mesh against your back."
          >
            {/* 0 — intake, against the pack (air enters here) */}
            <Layer
              progress={scrollYProgress}
              index={0}
              total={4}
              reduced={reduced}
              label="Intake"
              detail="Draws air in · pack side"
              fill="#d4d4d8"
              edge="#a1a1aa"
            >
              <Intake />
            </Layer>

            {/* 1 — the single centrifugal fan */}
            <Layer
              progress={scrollYProgress}
              index={1}
              total={4}
              reduced={reduced}
              label="Brushless fan"
              detail="PWM · 26 dB · 46 hr"
              fill="#e4e4e7"
              edge="#b8b8c0"
            >
              <Fan />
            </Layer>

            {/* 2 — spreads one fan's output across the whole panel */}
            <Layer
              progress={scrollYProgress}
              index={2}
              total={4}
              reduced={reduced}
              label="Air distributor"
              detail="Splits flow to four corners"
              fill="#f0f0f2"
              edge="#c9c9d1"
            >
              <Distributor />
            </Layer>

            {/* 3 — spacer mesh (touches you, air exits here) */}
            <Layer
              progress={scrollYProgress}
              index={3}
              total={4}
              reduced={reduced}
              label="3D spacer mesh"
              detail="5 mm loft · touches you"
              fill="#fcfcfd"
              edge="#dcdce2"
            >
              {Array.from({ length: 9 }, (_, r) =>
                Array.from({ length: 9 }, (_, c) => {
                  const u = (c - 4) / 4;
                  const v = (r - 4) / 4;
                  if (Math.abs(u) + Math.abs(v) > 0.9) return null;
                  return (
                    <circle
                      key={`${r}-${c}`}
                      cx={(u + v) * RX * 0.46}
                      cy={(v - u) * RY * 0.46}
                      r="2"
                      fill="rgba(9,9,11,0.3)"
                    />
                  );
                })
              )}
            </Layer>
          </svg>

          <p className="text-center text-sm text-fg-dim">
            Scroll to pull the stack apart.
          </p>
        </div>
      </div>
    </div>
  );
}
