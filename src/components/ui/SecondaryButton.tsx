import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SmartLink } from "./SmartLink";

type SecondaryButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  /** Styleguide only: hold the button in a state, for example "hover" or "focus". */
  preview?: string;
};

// DESIGN.md 6: transparent fill, 1px beam-24 border, beam label.
// Hover: border and label go xenon, background goes beam-04.
export function SecondaryButton({ children, href, type = "button", className, preview }: SecondaryButtonProps) {
  const face = (
    <span className="btn-face">
      <span className="caps">{children}</span>
    </span>
  );

  if (href) {
    return (
      <SmartLink href={href} className={cx("btn btn-secondary", className)} data-cursor="button" data-preview={preview}>
        {face}
      </SmartLink>
    );
  }

  return (
    <button type={type} className={cx("btn btn-secondary", className)} data-cursor="button" data-preview={preview}>
      {face}
    </button>
  );
}
