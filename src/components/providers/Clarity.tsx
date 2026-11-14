"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The contact section of the route that is on screen. Recently visited routes stay in the
// document, hidden, so an id can match more than one element. Only one of them is laid out.
function contactTop(): number {
  const contact = Array.from(document.querySelectorAll<HTMLElement>("#contact")).find(
    (el) => el.getClientRects().length > 0,
  );
  if (!contact) return ScrollTrigger.maxScroll(window);
  return contact.getBoundingClientRect().top + window.scrollY;
}

// The global clarity curve. MOTION.md 4
// One CSS variable, --clarity, runs from 0 at the top of the page to 1 at the contact
// section. Three things read it and nothing else: the page grain, the section bands and
// the image haze. The tween is the one given in MOTION.md. It is rebuilt on every route,
// and it refreshes after every other trigger so pinned sections are already measured.
// Under reduced motion there is no scrub: CSS holds --clarity at 1.
export function Clarity() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.to(document.documentElement, {
        "--clarity": 1,
        ease: "none", // scrub-eased
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: contactTop,
          scrub: 0.6,
          refreshPriority: -1,
        },
      });
    },
    { dependencies: [pathname, reduced], revertOnUpdate: true },
  );

  return null;
}
