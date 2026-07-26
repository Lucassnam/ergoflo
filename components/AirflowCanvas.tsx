"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  a: number;
  hue: number;
};

/**
 * Ambient airflow field: particles drift upward and outward, the way air
 * leaves the panel. Purely decorative — aria-hidden, paused off-screen,
 * skipped entirely under prefers-reduced-motion.
 */
export default function AirflowCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let particles: Particle[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = (p: Particle, initial: boolean) => {
      p.x = Math.random() * width;
      p.y = initial ? Math.random() * height : height + Math.random() * 40;
      p.vy = -(0.18 + Math.random() * 0.55);
      p.vx = (Math.random() - 0.5) * 0.22;
      p.r = 0.6 + Math.random() * 1.7;
      p.a = 0.12 + Math.random() * 0.4;
      p.hue = Math.random() < 0.72 ? 187 : 217; // cyan-weighted, some blue
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(120, Math.round((width * height) / 9000));
      particles = Array.from({ length: target }, () => {
        const p: Particle = { x: 0, y: 0, vy: 0, vx: 0, r: 1, a: 0.3, hue: 187 };
        seed(p, true);
        return p;
      });
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // slight lateral spread as the plume rises
        p.vx += (Math.random() - 0.5) * 0.012;
        if (p.y < -12 || p.x < -20 || p.x > width + 20) seed(p, false);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const fade = Math.min(1, p.y / (height * 0.55));
        ctx.fillStyle = `hsla(${p.hue}, 92%, 65%, ${p.a * fade})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
