"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useReveal } from "@/lib/useReveal";

type SectionProps = {
  children: ReactNode;
  id?: string;
  /** Sits on the pine band instead of the night ground. */
  band?: boolean;
  /** The id of the heading that names this section. */
  labelledBy?: string;
  className?: string;
};

// A page section: the fixed vertical rhythm from DESIGN.md 4, an optional pine band, and
// the default reveal from MOTION.md 5.5 for every child marked data-reveal.
export function Section({ children, id, band = false, labelledBy, className }: SectionProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cx("section", band && "section-band", className)}
      data-reveal-root=""
    >
      {children}
    </section>
  );
}
