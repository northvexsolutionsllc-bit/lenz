"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE } from "@/lib/gsap";
import { afterQuiet, isQuiet } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The default section reveal. MOTION.md 5.5
// Every element marked data-reveal inside the section rises 28px and fades in, 0.07
// apart, once, when the section reaches 78 percent of the viewport. These are the
// numbers. Do not raise them.
//
// Under reduced motion nothing moves: the same elements take a single fade over dur-2.
// A section that has already revealed does not replay when its route is shown again.
//
// Nothing animates in the first 200ms after a route change (MOTION.md 8). A section that
// mounts inside that window keeps its targets hidden, by data-reveal-wait, and sets its
// reveal up the moment the window closes.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const revealed = useRef(false);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe || revealed.current) return;

      const targets = el.querySelectorAll("[data-reveal]");
      if (targets.length === 0) return;

      const done = () => {
        revealed.current = true;
      };

      const create = contextSafe(() => {
        el.removeAttribute("data-reveal-wait");

        if (reduced) {
          gsap.from(targets, {
            opacity: 0,
            duration: DUR.d2,
            ease: EASE.beam,
            scrollTrigger: { trigger: el, start: "top 78%", once: true },
            onComplete: done,
          });
          return;
        }

        gsap.from(targets, {
          y: 28,
          opacity: 0,
          duration: DUR.d3,
          ease: EASE.beam,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
          onComplete: done,
        });
      });

      if (isQuiet()) el.setAttribute("data-reveal-wait", "");
      const cancel = afterQuiet(create);

      return () => {
        cancel();
        el.removeAttribute("data-reveal-wait");
      };
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return ref;
}
