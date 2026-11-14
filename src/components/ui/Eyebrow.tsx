import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

// DESIGN.md 6: caps in beam-54, preceded by a 24px wide 1px rule in xenon.
// Sits above every H2 on the site.
export function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={cx("eyebrow caps", className)}>{children}</p>;
}
