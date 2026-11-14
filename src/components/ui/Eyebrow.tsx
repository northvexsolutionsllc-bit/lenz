import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  /** Takes part in its section's reveal. MOTION.md 5.5 */
  reveal?: boolean;
};

// DESIGN.md 6: caps in beam-54, preceded by a 24px wide 1px rule in xenon.
// Sits above every H2 on the site.
export function Eyebrow({ children, className, reveal = false }: EyebrowProps) {
  return (
    <p className={cx("eyebrow caps", className)} data-reveal={reveal ? "" : undefined}>
      {children}
    </p>
  );
}
