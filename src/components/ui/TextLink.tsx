import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SmartLink } from "./SmartLink";

type TextLinkProps = {
  children: ReactNode;
  href: string;
  className?: string;
  /** Styleguide only: hold the link in a state, for example "hover" or "focus". */
  preview?: string;
};

// DESIGN.md 6: beam label with a 1px beam-24 underline 4px below the baseline.
// On hover the underline wipes to xenon, left to right, over 320ms.
// The underline is drawn on the inner label, which always stays an inline box, so it
// sits at the same height whether the link itself is inline or a flex or grid item.
export function TextLink({ children, href, className, preview }: TextLinkProps) {
  return (
    <SmartLink href={href} className={cx("text-link", className)} data-preview={preview}>
      <span className="text-link-label">{children}</span>
    </SmartLink>
  );
}
