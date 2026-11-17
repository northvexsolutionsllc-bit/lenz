"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import gsap from "gsap";
import { cx } from "@/lib/cx";
import { DUR, EASE } from "@/lib/gsap";
import type { MediaSlot } from "@/lib/media";
import { afterQuiet } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Icon } from "./Icon";
import { MediaFrame } from "./MediaFrame";

// MOTION.md 6
const REST = 38; // where the intro leaves the seam, in percent
const STEP = 4; // arrow keys
const STEP_SHIFT = 12; // arrow keys with shift
const TOUCH_SLOP = 6; // px of sideways travel before a touch counts as a drag

type CompareSliderProps = {
  before: MediaSlot;
  after: MediaSlot;
  beforeAlt: string;
  afterAlt: string;
  /** The sizes attribute for the two images. */
  sizes: string;
  className?: string;
};

const valueText = (value: number) => {
  const seam = Math.round(value);
  return `${seam} percent before, ${100 - seam} percent after`;
};

// The comparison slider. MOTION.md 6
//
// Two images of identical size are stacked: before underneath, after on top and clipped
// with clip-path: inset(0 0 0 var(--pos)). The seam position lives in --pos and is
// written straight to the element, so dragging never re-renders React.
//
//   Pointer   drag anywhere on the image, or click to position. On touch a drag only
//             starts once the finger has moved sideways, so a vertical swipe still
//             scrolls the page and a horizontal drag never does (touch-action: pan-y).
//   Keyboard  arrows move 4 percent, 12 with shift. Home and End go to the ends.
//   Intro     on first scroll into view the seam runs from 100 to 38 over dur-4, once.
//             It never loops. Under reduced motion it is skipped: the seam starts at 38.
//
// There is no transition on --pos while dragging or during the intro. Keyboard moves
// take the CSS transition. The wrapper is the slider. Because a slider's children are
// presentational to assistive technology, the two alt texts are also given as its
// description.
//
// Until both photos of a pair exist there is nothing to compare, and the slider renders
// nothing at all.
export function CompareSlider({ before, after, beforeAlt, afterAlt, sizes, className }: CompareSliderProps) {
  const reduced = useReducedMotion();
  const describedBy = useId();
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef(REST);
  const intro = useRef<gsap.core.Tween | null>(null);
  const pendingIntro = useRef<(() => void) | null>(null);
  const introPlayed = useRef(false);
  const drag = useRef<{ id: number; startX: number; active: boolean } | null>(null);

  const apply = useCallback((value: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.min(100, Math.max(0, value));
    position.current = next;
    el.style.setProperty("--pos", `${next}%`);
    el.setAttribute("aria-valuenow", String(Math.round(next)));
    el.setAttribute("aria-valuetext", valueText(next));
  }, []);

  const stopIntro = useCallback(() => {
    pendingIntro.current?.();
    pendingIntro.current = null;
    intro.current?.kill();
    intro.current = null;
    ref.current?.removeAttribute("data-intro");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Script arrived after the CSS failsafe had already settled the seam at its resting
    // place, with the slider on screen. Running the intro now would be a second move.
    const settledByFailsafe =
      !el.hasAttribute("data-ready") &&
      getComputedStyle(el).getPropertyValue("--pos").trim() === `${REST}%` &&
      el.getBoundingClientRect().top < window.innerHeight;

    if (reduced || introPlayed.current || settledByFailsafe) {
      introPlayed.current = true;
      apply(position.current);
      el.setAttribute("data-ready", "");
      return;
    }

    apply(100);
    el.setAttribute("data-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        introPlayed.current = true;

        // Not inside the 200ms after a route change. MOTION.md 8
        pendingIntro.current = afterQuiet(() => {
          pendingIntro.current = null;
          const state = { value: 100 };
          el.setAttribute("data-intro", "true");
          intro.current = gsap.to(state, {
            value: REST,
            duration: DUR.d4,
            ease: EASE.beam,
            onUpdate: () => apply(state.value),
            onComplete: stopIntro,
          });
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stopIntro();
      if (!introPlayed.current) apply(REST);
    };
  }, [reduced, apply, stopIntro]);

  const moveTo = (el: HTMLDivElement, clientX: number) => {
    const box = el.getBoundingClientRect();
    apply(((clientX - box.left) / box.width) * 100);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = event.currentTarget;
    stopIntro();
    introPlayed.current = true;
    el.setPointerCapture(event.pointerId);

    // A mouse or pen press positions the seam at once. A touch waits to see which way it goes.
    const active = event.pointerType !== "touch";
    drag.current = { id: event.pointerId, startX: event.clientX, active };
    if (active) {
      el.setAttribute("data-dragging", "true");
      moveTo(el, event.clientX);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const el = event.currentTarget;

    if (!current.active) {
      if (Math.abs(event.clientX - current.startX) < TOUCH_SLOP) return;
      current.active = true;
      el.setAttribute("data-dragging", "true");
    }
    moveTo(el, event.clientX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, tap: boolean) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const el = event.currentTarget;
    drag.current = null;
    el.removeAttribute("data-dragging");
    // A touch that never became a drag is a tap: the seam goes to it
    if (tap && !current.active) moveTo(el, event.clientX);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? STEP_SHIFT : STEP;
    let next: number;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = position.current - step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = position.current + step;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 100;
        break;
      default:
        return;
    }

    event.preventDefault();
    stopIntro();
    introPlayed.current = true;
    apply(next);
  };

  // A pair is only a pair with both halves. Until both files exist there is no slider.
  if (!before.src || !after.src) return null;

  return (
    <>
      <div
        ref={ref}
        className={cx("compare aspect-pair", className)}
        role="slider"
        tabIndex={0}
        aria-label="Reveal the restored headlight"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={REST}
        aria-valuetext={valueText(REST)}
        aria-describedby={describedBy}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endDrag(event, true)}
        onPointerCancel={(event) => endDrag(event, false)}
        onKeyDown={onKeyDown}
      >
        <div className="compare-layer">
          <MediaFrame slot={before} ratio="3/2" alt={beforeAlt} tone="before" sizes={sizes} flush className="h-full" />
          <span className="pill caps compare-label compare-label-before">BEFORE</span>
        </div>

        <div className="compare-layer compare-after">
          <MediaFrame slot={after} ratio="3/2" alt={afterAlt} tone="after" sizes={sizes} flush className="h-full" />
          <span className="pill caps compare-label compare-label-after">AFTER</span>
        </div>

        <div className="compare-handle" aria-hidden="true">
          <span className="compare-line" />
          <span className="compare-knob">
            <Icon name="chevron-left" size={16} />
            <Icon name="chevron-right" size={16} />
          </span>
        </div>
      </div>

      <p id={describedBy} className="sr-only">
        {beforeAlt}. {afterAlt}.
      </p>
    </>
  );
}
