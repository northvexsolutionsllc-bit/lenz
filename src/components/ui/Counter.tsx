"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cx } from "@/lib/cx";
import { DUR, EASE } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

// DESIGN.md 6: numeral, counts from 0 to its target when it enters the viewport,
// 1200ms, ease-beam. It counts once. The final value is what the server renders, what
// assistive technology reads, and what shows under reduced motion or without script.
// A hidden copy of the final value reserves the width, so nothing shifts while it counts.
export function Counter({ value, prefix = "", suffix = "", className }: CounterProps) {
  const reduced = useReducedMotion();
  const liveRef = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useLayoutEffect(() => {
    const live = liveRef.current;
    const text = live?.firstChild;
    if (!live || !text) return;

    const write = (n: number) => {
      text.nodeValue = `${prefix}${n}${suffix}`;
    };

    // Script arrived after the CSS failsafe had already shown the final value, and the
    // figure is on screen. Restarting it from zero now would be a flash, so it stays put.
    const shownByFailsafe =
      !live.hasAttribute("data-ready") &&
      getComputedStyle(live).visibility === "visible" &&
      live.getBoundingClientRect().top < window.innerHeight;

    if (reduced || played.current || shownByFailsafe) {
      played.current = true;
      write(value);
      live.setAttribute("data-ready", "");
      return;
    }

    const state = { n: 0 };
    let tween: gsap.core.Tween | undefined;
    write(0);
    live.setAttribute("data-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        played.current = true;
        tween = gsap.to(state, {
          n: value,
          duration: DUR.d4,
          ease: EASE.beam,
          onUpdate: () => write(Math.round(state.n)),
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(live);

    return () => {
      observer.disconnect();
      tween?.kill();
      write(value);
    };
  }, [value, prefix, suffix, reduced]);

  const final = `${prefix}${value}${suffix}`;

  return (
    <span className={cx("counter numeral", className)}>
      <span className="sr-only">{final}</span>
      <span className="counter-ghost" aria-hidden="true">
        {final}
      </span>
      <span ref={liveRef} aria-hidden="true" data-counter-live>
        {final}
      </span>
    </span>
  );
}
