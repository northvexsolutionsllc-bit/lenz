"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StepRow } from "@/components/ui/StepRow";
import { correction } from "@/content/home";
import { cx } from "@/lib/cx";
import { DUR, EASE } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { afterQuiet } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useReveal } from "@/lib/useReveal";
import { LensCrossSection, SCRATCH_LENGTH } from "./LensCrossSection";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Where on the timeline each stage's copy takes over. The timeline runs 2.9 units:
// oxidation 0 to 1, scratches 0.3 to 1.3, polish 1.3 to 2.5, coating 1.5 to 2.7,
// glow 2.1 to 2.9.
const STAGE_STARTS = [0, 0.6, 1.3, 1.9];

const stageAt = (time: number) => STAGE_STARTS.reduce((stage, start, index) => (time >= start ? index : stage), 0);

type ProcessProps = {
  /** Sits on the pine band instead of the night ground. */
  band?: boolean;
  /**
   * "pinned" is the set piece: the stage pins and the lens is worked through as you
   * scroll. "still" is the same content as an ordinary section with the finished lens,
   * for pages that are meant to stay short.
   */
  variant?: "pinned" | "still";
  /** Anything that follows the caption, inside the same section. */
  after?: ReactNode;
};

// The four stage correction, as the pinned lens cross-section. CONTENT.md 3.6, MOTION.md 5.4
//
// The stage is pinned for 300 percent of the viewport while the timeline from MOTION.md
// scrubs through the four layers of the SVG. The stage copy steps in sync: one stage is
// active at a time and, while pinned, the others drop to beam-24.
//
// Without script, and under reduced motion, there is no pin and no timeline. The figure
// shows the finished lens and all four stages read as a plain list. Under reduced motion
// the scrub is replaced by a single fade over dur-2, played once. MOTION.md 2
//
// The pin is built in an idle moment after the page becomes interactive, not during it.
// Building it moves everything below this section down by three viewports. So it goes
// to the front of the idle queue, ahead of the reveals of the other sections, and they
// measure a page that already has the pin in it.
export function Process({ band = false, variant = "pinned", after }: ProcessProps) {
  const titleId = useId();
  const reduced = useReducedMotion();
  const ref = useReveal<HTMLElement>();
  const faded = useRef(false);
  const still = variant === "still";
  const [animated, setAnimated] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [stage, setStage] = useState(0);

  useGSAP(
    (_context, contextSafe) => {
      // The still variant is not a set piece. Its rows take the default section reveal.
      if (still) return;

      if (reduced) {
        if (faded.current || !contextSafe) return;
        // Set up outside the 200ms after a route change. MOTION.md 8
        return afterQuiet(
          contextSafe(() => {
            gsap.from(".process-stage", {
              opacity: 0,
              duration: DUR.d2,
              ease: EASE.beam,
              scrollTrigger: { trigger: ".process-stage", start: "top 78%", once: true },
              onComplete: () => {
                faded.current = true;
              },
            });
          }),
        );
      }

      if (!contextSafe) return;

      const build = contextSafe(() => {
        // The stage takes its pinned layout now, ahead of the render that follows the
        // state change below, so that everything built here measures it as it will be
        if (ref.current) ref.current.dataset.mode = "animated";

        // Start from the lens as it arrives: oxidized, scratched, dark
        gsap.set("#layer-oxidation", { opacity: 1 });
        gsap.set("#layer-scratches", { strokeDashoffset: SCRATCH_LENGTH });
        gsap.set("#layer-coating", { strokeDasharray: (i, el) => (el as SVGPathElement).getTotalLength() });
        gsap.set("#lens-glow", { opacity: 0 });
        setAnimated(true);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: "#process", start: "top top", end: "+=300%", pin: true, scrub: 0.8 },
        });

        tl.to("#layer-oxidation", { opacity: 0, duration: 1 })
          .to("#layer-scratches", { strokeDashoffset: 0, duration: 1 }, "<0.3")
          .fromTo("#layer-polish", { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 1, duration: 1.2 })
          .fromTo("#layer-coating", { strokeDashoffset: (i, el) => (el as SVGPathElement).getTotalLength() },
                  { strokeDashoffset: 0, duration: 1.2 }, "<0.2")
          .to("#lens-glow", { opacity: 1, duration: 0.8 }, "<0.6");

        // The copy follows the playhead, and only dims while the stage is actually pinned
        tl.eventCallback("onUpdate", () => setStage(stageAt(tl.time())));
        ScrollTrigger.create({
          trigger: "#process",
          start: "top top",
          end: "+=300%",
          onToggle: (self) => setPinned(self.isActive),
        });

        // Measure and pin now, not on the next tick, so that what is built after this
        // already sees the three viewports the pin adds
        tl.scrollTrigger?.refresh();
      });

      let cancelIdle: (() => void) | undefined;
      const cancelQuiet = afterQuiet(() => {
        cancelIdle = whenIdle(build, true);
      });

      return () => {
        cancelQuiet();
        cancelIdle?.();
        setAnimated(false);
        setPinned(false);
        setStage(0);
      };
    },
    { dependencies: [reduced, still], scope: ref, revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      className={cx("process", band && "section-band")}
      aria-labelledby={titleId}
      data-reveal-root=""
      data-mode={animated ? "animated" : "static"}
      data-pinned={pinned}
    >
      <div className="shell process-head">
        <Eyebrow reveal>{correction.eyebrow}</Eyebrow>
        <h2 id={titleId} className="h2" data-reveal>
          {correction.title.plain} <span className="accent">{correction.title.accent}</span>
        </h2>
      </div>

      <div id="process" className="process-stage">
        <div className="shell process-grid">
          <ol className="process-steps">
            {correction.stages.map((item, index) => (
              <StepRow
                key={item.title}
                number={index + 1}
                title={item.title}
                current={animated ? stage === index : undefined}
                reveal={still}
              >
                {item.body}
              </StepRow>
            ))}
          </ol>
          <figure className="process-figure" data-reveal={still ? "" : undefined}>
            <LensCrossSection />
          </figure>
        </div>
      </div>

      <div className="shell process-foot">
        <p className="small" data-reveal={still ? "" : undefined}>
          {correction.caption}
        </p>
        {after}
      </div>
    </section>
  );
}
