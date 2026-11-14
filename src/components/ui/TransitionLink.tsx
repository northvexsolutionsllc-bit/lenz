"use client";

import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import { usePageTransition } from "@/components/providers/PageTransition";

type TransitionLinkProps = Omit<ComponentPropsWithRef<"a">, "href"> & { href: string };

// An internal link that hands its navigation to the page transition. MOTION.md 5.7
// onNavigate only fires for a plain client-side navigation, so a modified click that
// opens a new tab, and a visit without script, behave like any other link.
export function TransitionLink({ href, children, ...rest }: TransitionLinkProps) {
  const navigate = usePageTransition();

  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (!navigate) return;
        event.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
