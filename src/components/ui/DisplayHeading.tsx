"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { cx } from "@/lib/cx";
import { DUR, EASE } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(SplitText, useGSAP);

type DisplayHeadingProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

// The page heading, with the hero type reveal. MOTION.md 5.2
// SplitText by line, each line in an overflow hidden mask, rising from yPercent 112 with
// a 0.09 stagger. The accent span gets one extra beat.
//
// The heading is held invisible by CSS until this component is ready, so it never shows
// in its final state and then replays. That hold is capped at one second (see base.css).
// If script or fonts are slower than that, the heading is simply shown and the reveal is
// skipped: content first, the animation only when it can start cleanly. It plays once.
//
// Under reduced motion there is no split. The fade is a CSS animation in base.css.
export function DisplayHeading({ children, id, className }: DisplayHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const played = useRef(false);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;

      const alreadyShown = () => getComputedStyle(el).visibility === "visible";

      if (reduced || played.current || alreadyShown()) {
        played.current = true;
        el.setAttribute("data-ready", "");
        return;
      }

      let cancelled = false;
      let split: SplitText | undefined;

      const reveal = contextSafe(() => {
        if (cancelled || played.current) return;
        played.current = true;

        if (alreadyShown()) {
          el.setAttribute("data-ready", "");
          return;
        }

        split = SplitText.create(el, {
          type: "lines",
          linesClass: "line",
          mask: "lines",
          autoSplit: true,
          onSplit: (self: SplitText) => {
            self.lines.forEach((l) => l.parentElement?.classList.add("line-mask"));
            el.setAttribute("data-ready", "");

            // A later re-split, after a resize, has nothing left to animate
            if (el.hasAttribute("data-revealed")) return;

            const timeline = gsap.timeline();
            timeline.from(
              self.lines,
              {
                yPercent: 112,
                duration: DUR.d4,
                ease: EASE.beam,
                stagger: 0.09,
                delay: 0.15,
                // The masks stop clipping once the lines have landed, so descenders show
                onComplete: () => el.setAttribute("data-revealed", ""),
              },
              0,
            );

            const accent = el.querySelectorAll(".accent");
            if (accent.length) {
              timeline.from(
                accent,
                {
                  opacity: 0, filter: "blur(14px)",
                  duration: DUR.d4, ease: EASE.beam, delay: 0.62,
                },
                0,
              );
            }

            return timeline;
          },
        });
      });

      // Lines can only be measured once the web fonts are in
      document.fonts.ready.then(reveal);

      return () => {
        cancelled = true;
        split?.revert();
        el.removeAttribute("data-revealed");
      };
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return (
    <h1 ref={ref} id={id} className={cx("display", className)} data-split>
      {children}
    </h1>
  );
}
