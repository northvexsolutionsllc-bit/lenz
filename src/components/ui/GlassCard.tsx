import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type GlassCardProps = {
  children: ReactNode;
  as?: "div" | "article" | "li";
  className?: string;
  /** Styleguide only: hold the card in a state, for example "hover". */
  preview?: string;
};

// DESIGN.md 6: smoke fill, beam-12 hairline, 10px radius, 32px padding.
// On hover the hairline goes to xenon at 40 percent and the card lifts by 2px. No shadow.
export function GlassCard({ children, as: Tag = "div", className, preview }: GlassCardProps) {
  return (
    <Tag className={cx("glass-card", className)} data-preview={preview}>
      {children}
    </Tag>
  );
}
