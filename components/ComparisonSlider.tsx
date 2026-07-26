"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/site";

/**
 * Before/after wipe.
 *
 * Layering: the DRY shirts are the base layer, the SWEATY shirts sit on top
 * clipped to everything left of the handle. So dragging left "turns the fans
 * on" across the grid.
 *
 * Input model: pointer math lives on the wrapper (exact, no thumb-width
 * offset), and a real <input type="range"> parked on the handle provides
 * keyboard + assistive-tech semantics for free. The range is
 * pointer-events:none so the two input paths never fight.
 */
export default function ComparisonSlider() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  // The guard has to be a ref: React state updates are async, so a fast flick
  // can deliver pointermove before the `dragging` state re-render lands, and
  // those first moves would be silently dropped.
  const draggingRef = useRef(false);
  const interacted = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    if (width === 0) return;
    const next = ((clientX - left) / width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    interacted.current = true;
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    setDragging(false);
  };

  // Nudge the handle once on first view so it reads as draggable. Aborts the
  // moment the visitor grabs it themselves.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        [62, 38, 50].forEach((v, i) => {
          timers.push(
            setTimeout(() => {
              if (!interacted.current) setPct(v);
            }, 500 + i * 560)
          );
        });
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <figure className="m-0">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="rim group relative w-full touch-none overflow-hidden rounded-3xl bg-[#f3f4f6] select-none"
        style={{ aspectRatio: "3 / 2", cursor: dragging ? "grabbing" : "ew-resize" }}
      >
        {/* base: dry */}
        <Image
          src="/demo/dry.png"
          alt={`Shirt backs after wearing a pack with ${BRAND} — dry, no sweat mark`}
          fill
          priority
          sizes="(max-width: 1100px) 100vw, 1040px"
          className="pointer-events-none object-cover"
          draggable={false}
        />

        {/* overlay: sweaty, clipped to the left of the handle */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - pct}% 0 0)`,
            transition: dragging ? "none" : "clip-path 420ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <Image
            src="/demo/sweaty.png"
            alt="Shirt backs after wearing a pack without active cooling — sweat down every spine"
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1040px"
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* labels */}
        <span
          className="pointer-events-none absolute top-4 left-4 z-20 rounded-full bg-black/78 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm sm:top-5 sm:left-5 sm:text-[11px]"
          style={{ opacity: pct < 12 ? 0 : 1, transition: "opacity 200ms ease" }}
        >
          Without {BRAND}
        </span>
        <span
          className="pointer-events-none absolute top-4 right-4 z-20 rounded-full bg-black/78 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-cyan uppercase backdrop-blur-sm sm:top-5 sm:right-5 sm:text-[11px]"
          style={{ opacity: pct > 88 ? 0 : 1, transition: "opacity 200ms ease" }}
        >
          With {BRAND}
        </span>

        {/* divider + handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-30 w-px"
          style={{
            left: `${pct}%`,
            transform: "translateX(-0.5px)",
            background: "linear-gradient(180deg, #67e8f9, #22d3ee 45%, #3b82f6)",
            boxShadow: "0 0 14px 1px rgba(34,211,238,0.85), 0 0 40px 4px rgba(34,211,238,0.35)",
            transition: dragging ? "none" : "left 420ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            className={`absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/85 backdrop-blur-md ${
              dragging ? "scale-110" : "group-hover:scale-105"
            } has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#f3f4f6]`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(34,211,238,0.75), 0 0 22px 2px rgba(34,211,238,0.5)",
              transition: "transform 180ms ease",
            }}
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
              <path
                d="M7.5 1.5 3 6l4.5 4.5M12.5 1.5 17 6l-4.5 4.5"
                stroke="#22d3ee"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* keyboard + assistive tech path */}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(pct)}
              onChange={(e) => {
                interacted.current = true;
                setPct(Number(e.target.value));
              }}
              aria-label={`Reveal how much of the grid is worn with ${BRAND}. 0 percent shows every shirt sweaty, 100 percent shows every shirt dry.`}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            />
          </div>
        </div>
      </div>

      <figcaption className="mt-5 flex flex-col gap-1 text-center">
        <span className="font-mono text-[11px] tracking-[0.16em] text-fg-faint uppercase">
          Drag to compare · same shirts, same commute
        </span>
        <span className="text-sm text-fg-dim">
          Left: a passive foam back panel. Right: 46 hours of moving air.
        </span>
      </figcaption>
    </figure>
  );
}
