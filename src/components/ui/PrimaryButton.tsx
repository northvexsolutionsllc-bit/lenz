"use client";

import { useRef, type MouseEventHandler, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useMagnetic } from "@/lib/useMagnetic";
import { SmartLink } from "./SmartLink";

type PrimaryButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  /** Styleguide only: hold the button in a state, for example "hover" or "focus". */
  preview?: string;
};

// DESIGN.md 6: beam fill, night label, 10px radius, 14px 28px padding, caps label.
// Hover is the beam glow plus a 2 percent scale. Magnetic on fine pointers only.
// The magnet moves the outer element and the hover scale lives on the face inside it,
// so the two transforms never fight over one element.
export function PrimaryButton({ children, href, type = "button", onClick, className, preview }: PrimaryButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  useMagnetic(ref);

  const face = (
    <span className="btn-face">
      <span className="caps">{children}</span>
    </span>
  );

  if (href) {
    return (
      <SmartLink
        ref={(node) => {
          ref.current = node;
        }}
        href={href}
        onClick={onClick}
        className={cx("btn btn-primary", className)}
        data-cursor="button"
        data-preview={preview}
      >
        {face}
      </SmartLink>
    );
  }

  return (
    <button
      ref={(node) => {
        ref.current = node;
      }}
      type={type}
      onClick={onClick}
      className={cx("btn btn-primary", className)}
      data-cursor="button"
      data-preview={preview}
    >
      {face}
    </button>
  );
}
