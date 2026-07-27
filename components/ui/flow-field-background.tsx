"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   Deterministic 2D gradient (Perlin) noise. Inlined so the
   component stays dependency-free — the field must look
   identical on every load, hence the fixed-seed shuffle.
   ============================================================ */
const PERM = new Uint8Array(512);
{
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

function grad(hash: number, x: number, y: number) {
  switch (hash & 3) {
    case 0:
      return x + y;
    case 1:
      return -x + y;
    case 2:
      return x - y;
    default:
      return -x - y;
  }
}

/** Perlin noise in roughly [-1, 1]. */
function noise2D(x: number, y: number) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  );
}

type Particle = { x: number; y: number; px: number; py: number; life: number };

type Props = {
  /** Stroke colour of the trails. */
  color?: string;
  /** Field frequency — higher means tighter, more chaotic curls. */
  scale?: number;
  /** Per-frame fade. Lower leaves longer trails. */
  trailOpacity?: number;
  /** Particle travel speed in px per frame. */
  speed?: number;
  /** Colour the canvas fades toward. Must match the section behind it. */
  backdrop?: string;
  className?: string;
};

/**
 * Particles advected through a Perlin vector field, leaving trails. The
 * canvas is fogged each frame with `backdrop` at `trailOpacity` rather
 * than cleared, which is what produces the streaks.
 */
export default function FlowFieldBackground({
  color = "#d4d4d8",
  scale = 1,
  trailOpacity = 0.1,
  speed = 0.8,
  backdrop = "255,255,255",
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frameId = 0;

    const seedParticle = (p: Particle) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.px = p.x;
      p.py = p.y;
      p.life = Math.random() * 200 + 100;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area so wide viewports don't look sparse.
      const count = Math.min(1400, Math.floor((width * height) / 900));
      particles = Array.from({ length: count }, () => {
        const p: Particle = { x: 0, y: 0, px: 0, py: 0, life: 0 };
        seedParticle(p);
        return p;
      });

      ctx.fillStyle = `rgb(${backdrop})`;
      ctx.fillRect(0, 0, width, height);
    };

    resize();

    // Static fields read as noise, not decoration — draw one frame and stop.
    if (reduced) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (const p of particles) {
        const angle = noise2D((p.x * scale) / 260, (p.y * scale) / 260) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(angle) * 12, p.y + Math.sin(angle) * 12);
        ctx.stroke();
      }
      return;
    }

    let t = 0;

    const render = () => {
      frameId = requestAnimationFrame(render);
      t += 0.0012;

      // Fog rather than clear — this is what leaves the trails behind.
      ctx.fillStyle = `rgba(${backdrop},${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;

        const angle =
          noise2D((p.x * scale) / 260, (p.y * scale) / 260 + t) * Math.PI * 2;
        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;
        p.life -= 1;

        if (
          p.life <= 0 ||
          p.x < 0 ||
          p.x > width ||
          p.y < 0 ||
          p.y > height
        ) {
          seedParticle(p);
          continue;
        }

        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }

      ctx.stroke();
    };

    render();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [color, scale, trailOpacity, speed, backdrop]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
