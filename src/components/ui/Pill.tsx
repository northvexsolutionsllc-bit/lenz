import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SmartLink } from "./SmartLink";

type PillProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  /** Styleguide only: hold the pill in a state, for example "hover" or "focus". */
  preview?: string;
};

// DESIGN.md 6: beam-08 fill, caps label, 999px radius, 6px 14px. Service areas and tags.
export function Pill({ children, href, className, preview }: PillProps) {
  if (href) {
    return (
      <SmartLink href={href} className={cx("pill caps", className)} data-preview={preview}>
        {children}
      </SmartLink>
    );
  }

  return <span className={cx("pill caps", className)}>{children}</span>;
}
