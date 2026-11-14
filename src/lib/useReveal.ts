"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { afterQuiet } from "@/lib/routeQuiet";
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
// The element this is attached to carries data-reveal-root. Until its reveal is set up,
// CSS holds its targets hidden (see base.css), so they never show and then replay. The
// set-up itself is not done while the page is becoming interactive: it waits for an idle
// moment, and for the 200ms after a route change in which nothing animates (MOTION.md 8).
// If that wait outlasts the 400ms the hold lasts, and the section is already on
// screen, the reveal is skipped. Content first, the animation only when it can start
// cleanly.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const revealed = useRef(false);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;

      const targets = el.querySelectorAll("[data-reveal]");
      if (revealed.current || targets.length === 0) {
        el.setAttribute("data-reveal-ready", "");
        return () => el.removeAttribute("data-reveal-ready");
      }

      const done = () => {
        revealed.current = true;
      };

      const create = contextSafe(() => {
        const alreadyShown = getComputedStyle(targets[0]).opacity !== "0";
        const box = el.getBoundingClientRect();
        const onScreen = box.top < window.innerHeight && box.bottom > 0;
        el.setAttribute("data-reveal-ready", "");

        if (alreadyShown && onScreen) {
          done();
          return;
        }

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

      let cancelIdle: (() => void) | undefined;
      const cancelQuiet = afterQuiet(() => {
        cancelIdle = whenIdle(create);
      });

      return () => {
        cancelQuiet();
        cancelIdle?.();
        el.removeAttribute("data-reveal-ready");
      };
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return ref;
}
