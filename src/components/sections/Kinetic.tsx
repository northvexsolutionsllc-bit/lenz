"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { kinetic } from "@/content/home";
import { DUR, EASE } from "@/lib/gsap";
import { afterQuiet } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The kinetic line. CONTENT.md 3.3, MOTION.md 5.3
// The one place on the site where the Archivo width axis moves: it runs from wdth 62 to
// wdth 118 as the line crosses the viewport. Used exactly once.
// At the kinetic size the three words cannot share a row at any viewport, so each takes
// its own. The line is full bleed: it ignores the page gutter and sits centred, so at
// full width the longest word runs from one edge of a phone screen to the other.
// Under reduced motion the scrub is replaced by a single fade over dur-2, played once.
export function Kinetic() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const faded = useRef(false);

  useGSAP(
    (_context, contextSafe) => {
      if (reduced) {
        if (faded.current || !contextSafe) return;
        // Set up outside the 200ms after a route change. MOTION.md 8
        return afterQuiet(
          contextSafe(() => {
            gsap.from(".kinetic", {
              opacity: 0,
              duration: DUR.d2,
              ease: EASE.beam,
              scrollTrigger: { trigger: ".kinetic", start: "top 85%", once: true },
              onComplete: () => {
                faded.current = true;
              },
            });
          }),
        );
      }

      gsap.fromTo(".kinetic",
        { fontVariationSettings: '"wght" 700, "wdth" 62' },
        {
          fontVariationSettings: '"wght" 700, "wdth" 118',
          ease: "none", // scrub-eased
          scrollTrigger: { trigger: ".kinetic", start: "top 85%", end: "bottom 35%", scrub: 0.5 },
        }
      );
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return (
    <section ref={ref} className="section kinetic-section">
      <p className="kinetic">
        {kinetic.map((word, index) => (
          <span key={word}>
            {word}
            {index < kinetic.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
