"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { FAQ } from "@/lib/site";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <div className="hairline h-px w-full" />
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-medium text-fg transition-colors hover:text-neutral-500"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl leading-none text-neutral-400 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 text-[15px] leading-relaxed text-fg-dim">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="hairline h-px w-full" />
    </div>
  );
}
