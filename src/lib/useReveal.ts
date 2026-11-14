"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The default section reveal. MOTION.md 5.5
// Every element marked data-reveal inside the section rises 28px and fades in, 0.07
// apart, once, when the section reaches 78 percent of the viewport. These are the
// numbers. Do not raise them.
//
// Under reduced motion nothing moves: the same elements take a single fade over dur-2.
// A section that has already revealed does not replay when its route is shown again.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const revealed = useRef(false);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || revealed.current) return;

      const targets = el.querySelectorAll("[data-reveal]");
      if (targets.length === 0) return;

      const done = () => {
        revealed.current = true;
      };

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
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return ref;
}
