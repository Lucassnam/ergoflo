"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { MotionValue } from "motion/react";

const RX = 170; // half-width of the isometric top face
const RY = 76; // half-depth — flatter than a true isometric so the stack fits
const T = 14; // slab thickness; drives the two visible side faces
/* GAP must exceed 2*RY, otherwise an exploded layer still overlaps the one
   below it and paints over its detail (this hid a fan on the deck layer). */
const GAP = 158;
const CX = 300; // group origin inside the viewBox
const CY = 330;

/** Squash factor that maps circular geometry onto the isometric plane. */
const ISO = RY / RX;

/**
 * Draws its children in plain circular/square space, then squashes them onto
 * the isometric plane. Every part below is authored as if seen head-on, which
 * keeps the geometry readable and lets things rotate correctly — a rotation
 * applied inside an already-flattened group shears instead of spinning.
 */
function Iso({ children }: { children: React.ReactNode }) {
  return <g transform={`scale(1 ${ISO})`}>{children}</g>;
}

/**
 * Isometric slab. Three faces with separate tones — lit top, mid-tone
 * lower-left, dark lower-right — so the thickness reads as solid volume
 * rather than an outline.
 */
function Slab({
  id,
  edgeLeft,
  edgeRight,
  children,
}: {
  id: string;
  edgeLeft: string;
  edgeRight: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      {/* contact shadow — sells the layer as floating once the stack opens */}
      <ellipse
        cy={RY + T + 16}
        rx={RX * 0.82}
        ry={RY * 0.3}
        fill="rgba(9,9,11,0.13)"
        filter="url(#exp-blur)"
      />
      <path
        d={`M ${-RX} 0 L 0 ${RY} L 0 ${RY + T} L ${-RX} ${T} Z`}
        fill={edgeLeft}
      />
      <path
        d={`M ${RX} 0 L 0 ${RY} L 0 ${RY + T} L ${RX} ${T} Z`}
        fill={edgeRight}
      />
      <path
        d={`M 0 ${-RY} L ${RX} 0 L 0 ${RY} L ${-RX} 0 Z`}
        fill={`url(#${id})`}
        stroke="rgba(9,9,11,0.28)"
        strokeWidth="1.1"
      />
      {children}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Layer artwork                                                      */
/* ------------------------------------------------------------------ */

/** Louvred intake grille on the pack-facing plate, with slot depth. */
function Intake() {
  return (
    <Iso>
      <g transform="rotate(45)">
        <rect
          x={-104}
          y={-104}
          width={208}
          height={208}
          rx={18}
          fill="#ffffff"
          stroke="rgba(9,9,11,0.3)"
          strokeWidth="2"
        />
        {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
          <g key={n}>
            {/* the slot itself, then the louvre blade sitting proud of it */}
            <rect
              x={-84}
              y={n * 25 - 9}
              width={168}
              height={16}
              rx={7}
              fill="rgba(9,9,11,0.42)"
            />
            <rect
              x={-84}
              y={n * 25 - 9}
              width={168}
              height={9}
              rx={4.5}
              fill="#e9e9ee"
              stroke="rgba(9,9,11,0.22)"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>
    </Iso>
  );
}

/**
 * The brushless fan, drawn as the square-frame axial unit the product
 * actually uses: rounded frame, four corner mounting holes, swept impeller,
 * and the two-wire DC lead running off one corner.
 */
function Fan({ spin }: { spin: boolean }) {
  const S = 104; // half-side of the frame
  const R = 92; // bore radius
  const BLADES = 9;

  return (
    <Iso>
      <g transform="rotate(45)">
        {/* frame */}
        <rect
          x={-S}
          y={-S}
          width={S * 2}
          height={S * 2}
          rx={14}
          fill="#f7f7f9"
          stroke="rgba(9,9,11,0.4)"
          strokeWidth="2.2"
        />
        {/* corner mounting holes */}
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sy], i) => (
          <circle
            key={i}
            cx={sx * (S - 16)}
            cy={sy * (S - 16)}
            r="8"
            fill="#ffffff"
            stroke="rgba(9,9,11,0.45)"
            strokeWidth="1.6"
          />
        ))}
        {/* bore */}
        <circle
          r={R}
          fill="#3f3f46"
          stroke="rgba(9,9,11,0.5)"
          strokeWidth="1.4"
        />
        <circle r={R - 5} fill="#52525b" />

        {/* swept impeller */}
        <g>
          {spin && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="2.6s"
              repeatCount="indefinite"
            />
          )}
          {Array.from({ length: BLADES }, (_, i) => {
            const a = (i / BLADES) * Math.PI * 2;
            const b = a + 0.78; // sweep
            const inner = 0.3;
            const x1 = Math.cos(a) * R * inner;
            const y1 = Math.sin(a) * R * inner;
            const x2 = Math.cos(b) * R * 0.95;
            const y2 = Math.sin(b) * R * 0.95;
            const cx = Math.cos(a + 0.42) * R * 0.66;
            const cy = Math.sin(a + 0.42) * R * 0.66;
            const x3 = Math.cos(b - 0.3) * R * 0.95;
            const y3 = Math.sin(b - 0.3) * R * 0.95;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2} L ${x3} ${y3} Z`}
                fill="#27272a"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.1"
              />
            );
          })}
        </g>

        {/* motor hub with the brand-side sticker face */}
        <circle r={R * 0.32} fill="#18181b" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4" />
        <circle r={R * 0.24} fill="#2563eb" opacity="0.9" />
        <circle r={R * 0.07} fill="#e4e4e7" />

        {/* two-wire DC lead off the corner */}
        <path
          d={`M ${S - 22} ${S - 8} C ${S + 26} ${S + 16}, ${S + 44} ${S + 40}, ${S + 30} ${S + 74}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d={`M ${S - 14} ${S - 16} C ${S + 34} ${S + 10}, ${S + 52} ${S + 36}, ${S + 40} ${S + 72}`}
          fill="none"
          stroke="#18181b"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </g>
    </Iso>
  );
}

/** Tapered ducts that spread one fan's output to the four corners. */
function Distributor() {
  const OUT = 132;
  return (
    <Iso>
      <g transform="rotate(45)">
        {[
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ].map(([sx, sy], i) => (
          <g key={i}>
            {/* duct widens from the plenum toward its outlet */}
            <path
              d={`M ${sx * 16} ${sy * 8}
                  L ${sx * OUT} ${sy * (OUT - 34)}
                  L ${sx * (OUT - 34)} ${sy * OUT}
                  L ${sx * 8} ${sy * 16} Z`}
              fill="#ffffff"
              stroke="rgba(9,9,11,0.34)"
              strokeWidth="1.8"
            />
            {/* outlet mouth */}
            <path
              d={`M ${sx * OUT} ${sy * (OUT - 34)} L ${sx * (OUT - 34)} ${sy * OUT}`}
              stroke="rgba(9,9,11,0.5)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* central plenum sitting over the fan outlet */}
        <circle
          r="34"
          fill="#e4e4e7"
          stroke="rgba(9,9,11,0.38)"
          strokeWidth="2"
        />
        <circle r="20" fill="#ffffff" stroke="rgba(9,9,11,0.24)" strokeWidth="1.2" />
      </g>
    </Iso>
  );
}

/** Woven 3D spacer mesh — the face that touches your back. */
function Mesh() {
  const HALF = 112;
  const STEP = 16;
  const lines = [];
  for (let v = -HALF; v <= HALF; v += STEP) {
    lines.push(
      <line
        key={`h${v}`}
        x1={-HALF}
        y1={v}
        x2={HALF}
        y2={v}
        stroke="rgba(9,9,11,0.3)"
        strokeWidth="1.5"
      />,
      <line
        key={`v${v}`}
        x1={v}
        y1={-HALF}
        x2={v}
        y2={HALF}
        stroke="rgba(9,9,11,0.18)"
        strokeWidth="1.5"
      />
    );
  }
  return (
    <Iso>
      <g transform="rotate(45)">
        <rect
          x={-HALF}
          y={-HALF}
          width={HALF * 2}
          height={HALF * 2}
          rx={20}
          fill="#ffffff"
          stroke="rgba(9,9,11,0.28)"
          strokeWidth="2"
        />
        <g clipPath="url(#exp-mesh-clip)">{lines}</g>
      </g>
    </Iso>
  );
}

/* ------------------------------------------------------------------ */

type LayerSpec = {
  key: string;
  label: string;
  detail: string;
  /** Expanded facts, shown when this layer is the active one. */
  specs: readonly string[];
  gradId: string;
  from: string;
  to: string;
  edgeLeft: string;
  edgeRight: string;
};

/** Ordered pack-side first, so index 0 is where air enters. */
const LAYERS: readonly LayerSpec[] = [
  {
    key: "intake",
    label: "Intake",
    detail: "Draws air in · pack side",
    /* "Splash resistant to IPX4" removed 2026-07-29 — IPX4 is a formal
       IEC 60529 rating and this product has never been IP-tested. */
    specs: ["Louvred slot grille", "Faces the bag, not you", "Splash resistant (target)"],
    gradId: "exp-g0",
    from: "#e4e4e7",
    to: "#c4c4cb",
    edgeLeft: "#b4b4bd",
    edgeRight: "#9a9aa4",
  },
  {
    key: "fan",
    label: "Brushless fan",
    detail: "PWM · 26 dB · 9–12 hr",
    specs: ["Single brushless, PWM speed control", "2000 mAh Li-ion, USB-C", "26 dB at the shoulder"],
    gradId: "exp-g1",
    from: "#f0f0f2",
    to: "#d2d2d9",
    edgeLeft: "#c2c2cb",
    edgeRight: "#a8a8b2",
  },
  {
    key: "distributor",
    label: "Air distributor",
    detail: "Splits flow to four corners",
    specs: ["One inlet, four outlets", "Rigid PETG plenum", "No dead spot in the lumbar zone"],
    gradId: "exp-g2",
    from: "#f7f7f9",
    to: "#dedee4",
    edgeLeft: "#cfcfd7",
    edgeRight: "#b5b5bf",
  },
  {
    key: "mesh",
    label: "3D spacer mesh",
    detail: "5 mm loft · touches you",
    specs: ["5 mm spacer loft", "Tensioned on TPU rails", "168 g added, all in"],
    gradId: "exp-g3",
    from: "#ffffff",
    to: "#e9e9ef",
    edgeLeft: "#dcdce2",
    edgeRight: "#c3c3cc",
  },
];

type LayerProps = {
  progress: MotionValue<number>;
  index: number;
  spec: LayerSpec;
  reduced: boolean;
  active: number | null;
  onActivate: (i: number | null) => void;
  children?: React.ReactNode;
};

function Layer({
  progress,
  index,
  spec,
  reduced,
  active,
  onActivate,
  children,
}: LayerProps) {
  const total = LAYERS.length;
  // Spread symmetrically about the centre so the composition stays put
  // instead of climbing out of the frame.
  const centred = index - (total - 1) / 2;
  const travel = -centred * GAP;

  const y = useTransform(progress, [0, 1], [0, travel]);
  const labelOpacity = useTransform(progress, [0.4, 0.75], [0, 1]);

  // Stack order when collapsed: a couple of px so the edges read as separate.
  const restY = (total - 1 - index) * 5;

  const isActive = active === index;
  const isDimmed = active !== null && !isActive;

  return (
    <motion.g style={reduced ? { y: travel } : { y }}>
      <g transform={`translate(${CX} ${CY + restY})`}>
        {/* Scale/lift live on their own group whose origin is already the
            slab centre, so the hover pop grows from the middle of the layer
            rather than from the corner of the viewBox. */}
        <motion.g
          animate={{
            scale: isActive ? 1.045 : 1,
            y: isActive ? -10 : 0,
            opacity: isDimmed ? 0.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{ cursor: "pointer" }}
          onPointerEnter={() => onActivate(index)}
          onPointerLeave={() => onActivate(null)}
        >
          <Slab id={spec.gradId} edgeLeft={spec.edgeLeft} edgeRight={spec.edgeRight}>
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
              {spec.label}
            </text>
            <text
              x={RX + 64}
              y={15}
              fill="#71717a"
              fontSize="11.5"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {spec.detail}
            </text>
          </motion.g>
        </motion.g>
      </g>
    </motion.g>
  );
}

/**
 * Airflow rail down the left margin. Grows with scroll so the direction of
 * travel — pack side at the bottom, your back at the top — is explicit once
 * the stack is open.
 */
function AirflowRail({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity = useTransform(progress, [0.25, 0.55], [0, 1]);
  const half = ((LAYERS.length - 1) / 2) * GAP;
  const top = CY - half;
  const bottom = CY + half;

  return (
    <motion.g style={{ opacity: reduced ? 1 : opacity }}>
      <line
        x1={100}
        y1={bottom}
        x2={100}
        y2={top}
        stroke="rgba(9,9,11,0.28)"
        strokeWidth="2"
        strokeDasharray="7 9"
        strokeLinecap="round"
      >
        {!reduced && (
          <animate
            attributeName="stroke-dashoffset"
            from="32"
            to="0"
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </line>
      {[0, 1, 2].map((i) => {
        const yy = bottom - ((bottom - top) / 3) * (i + 0.75);
        return (
          <path
            key={i}
            d={`M 93 ${yy + 9} L 100 ${yy} L 107 ${yy + 9}`}
            fill="none"
            stroke="rgba(9,9,11,0.42)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      <text
        x={100}
        y={top - 18}
        textAnchor="middle"
        fill="#71717a"
        fontSize="11"
        letterSpacing="1.6"
        fontFamily="var(--font-geist-mono), monospace"
      >
        AIRFLOW
      </text>
    </motion.g>
  );
}

export default function ExplodedDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const art = [
    <Intake key="intake" />,
    <Fan key="fan" spin={!reduced} />,
    <Distributor key="distributor" />,
    <Mesh key="mesh" />,
  ];

  const activeSpec = active !== null ? LAYERS[active] : null;

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
            viewBox="0 0 860 700"
            className="mx-auto mt-1 block h-auto w-full max-w-3xl"
            style={{ maxHeight: "48vh" }}
            role="img"
            aria-label="Exploded diagram of the panel, following the airflow from the bag outward: intake grille, single brushless fan, air distributor, and 3D spacer mesh against your back."
          >
            <defs>
              {LAYERS.map((l) => (
                <linearGradient
                  key={l.gradId}
                  id={l.gradId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={l.from} />
                  <stop offset="100%" stopColor={l.to} />
                </linearGradient>
              ))}
              <filter id="exp-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <clipPath id="exp-mesh-clip">
                <rect x={-112} y={-112} width={224} height={224} rx={20} />
              </clipPath>
            </defs>

            <AirflowRail progress={scrollYProgress} reduced={reduced} />

            {LAYERS.map((spec, i) => (
              <Layer
                key={spec.key}
                progress={scrollYProgress}
                index={i}
                spec={spec}
                reduced={reduced}
                active={active}
                onActivate={setActive}
              >
                {art[i]}
              </Layer>
            ))}
          </svg>

          {/* Keyboard- and touch-reachable path to the same detail the hover
              gives, plus a fixed-height readout so selecting never shifts the
              layout underneath the diagram. */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {LAYERS.map((l, i) => (
              <button
                key={l.key}
                type="button"
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                aria-pressed={active === i}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
                  active === i
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-3 flex h-11 max-w-2xl items-center justify-center px-4 text-center">
            {activeSpec ? (
              <p className="text-[13px] leading-relaxed text-neutral-600">
                {activeSpec.specs.join("  ·  ")}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                Scroll to pull the stack apart. Hover a layer for detail.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
