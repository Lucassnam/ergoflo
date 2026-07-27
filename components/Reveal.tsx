"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** seconds */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "tr";
};

/**
 * Fade-up on first scroll into view. Once only — re-animating on scroll-back
 * makes a long page feel twitchy.
 */
export default function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      /* `amount: "some"` fires as soon as any part of the block crosses the
         viewport. The old 0.2 threshold plus a -80px bottom margin meant a
         tall block sitting just under a full-height hero could fail to
         trigger and stay at opacity 0 — invisible content, not just
         un-animated content. Failing visible is the safer default. */
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
