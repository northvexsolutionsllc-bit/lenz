"use client";

import type { ComponentPropsWithoutRef } from "react";
import { jumpToAnchor } from "@/lib/anchor";

type AnchorLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  /** The id of the element on this page to jump to */
  target: string;
};

// A link to a place further down the same page. It is an ordinary "#id" link, and with
// script it makes sure the jump lands on the page that is on screen (see jumpToAnchor).
export function AnchorLink({ target, children, ...rest }: AnchorLinkProps) {
  return (
    <a
      href={`#${target}`}
      onClick={(event) => {
        if (jumpToAnchor(target)) event.preventDefault();
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
