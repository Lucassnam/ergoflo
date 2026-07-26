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
        stroke="rgba(255,255,255,0.15)"
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
            stroke="rgba(34,211,238,0.5)"
            strokeWidth="1"
          />
          <circle cx={RX + 54} cy={2} r="2.4" fill="#22d3ee" />
          <text
            x={RX + 64}
            y={-1}
            fill="#f2f5f8"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="var(--font-geist-sans), sans-serif"
          >
            {label}
          </text>
          <text
            x={RX + 64}
            y={15}
            fill="#98a2ae"
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

/** Fan face drawn in the isometric plane. */
function Fan({ dx }: { dx: number }) {
  return (
    <g transform={`translate(${dx} ${(-dx * RY) / RX})`}>
      <ellipse rx="44" ry="19.7" fill="#08090b" stroke="rgba(34,211,238,0.45)" strokeWidth="1.1" />
      <ellipse rx="30" ry="13.4" fill="none" stroke="rgba(148,163,175,0.25)" strokeWidth="0.9" />
      {[0, 45, 90, 135].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={-Math.cos(rad) * 40}
            y1={-Math.sin(rad) * 17.9}
            x2={Math.cos(rad) * 40}
            y2={Math.sin(rad) * 17.9}
            stroke="rgba(148,163,175,0.3)"
            strokeWidth="0.9"
          />
        );
      })}
      <ellipse rx="10" ry="4.5" fill="#14171d" stroke="rgba(34,211,238,0.55)" strokeWidth="1" />
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
          <p className="text-center font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
            Exploded view
          </p>
          <h2 className="mt-3 text-center text-[clamp(1.7rem,4vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
            Four layers. Nothing decorative.
          </h2>

          <svg
            viewBox="0 0 840 640"
            className="mx-auto mt-1 block h-auto w-full max-w-3xl"
            style={{ maxHeight: "58vh" }}
            role="img"
            aria-label="Exploded diagram of the panel, from the bag outward: pack-side plate, rigid PETG perimeter, dual brushless fan deck, and 3D spacer mesh."
          >
            {/* 0 — pack side (bottom) */}
            <Layer
              progress={scrollYProgress}
              index={0}
              total={4}
              reduced={reduced}
              label="Pack side"
              detail="Sits against your bag"
              fill="#0e1014"
              edge="#08090b"
            />

            {/* 1 — PETG perimeter */}
            <Layer
              progress={scrollYProgress}
              index={1}
              total={4}
              reduced={reduced}
              label="Rigid PETG perimeter"
              detail="Holds mesh tension"
              fill="#14171d"
              edge="#0b0d11"
            >
              <path
                d={`M 0 ${-RY * 0.58} L ${RX * 0.58} 0 L 0 ${RY * 0.58} L ${-RX * 0.58} 0 Z`}
                fill="#08090b"
                stroke="rgba(34,211,238,0.26)"
                strokeWidth="1"
              />
            </Layer>

            {/* 2 — fan deck */}
            <Layer
              progress={scrollYProgress}
              index={2}
              total={4}
              reduced={reduced}
              label="Dual brushless fans"
              detail="PWM · 26 dB"
              fill="#12151b"
              edge="#0a0c10"
            >
              <Fan dx={-58} />
              <Fan dx={58} />
            </Layer>

            {/* 3 — spacer mesh (touches you) */}
            <Layer
              progress={scrollYProgress}
              index={3}
              total={4}
              reduced={reduced}
              label="3D spacer mesh"
              detail="5 mm loft · touches you"
              fill="#171b22"
              edge="#0d0f13"
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
                      fill="rgba(34,211,238,0.32)"
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
