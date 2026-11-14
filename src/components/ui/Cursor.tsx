"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { DUR, EASE } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

const FINE = "(pointer: fine)";

function subscribeFine(onChange: () => void) {
  const list = window.matchMedia(FINE);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

const BUTTON = 'button, .btn, [role="button"], [data-cursor="button"]';
const MEDIA = '[data-cursor="media"]';

// DESIGN.md 6: a 28px ring that follows fine pointers. Over a gallery image it grows to
// 96px and fills with beam-04. Over a button it shrinks to 8px and fills xenon.
// It does not mount at all for coarse pointers or under reduced motion.
// The native pointer stays visible. The ring trails it.
export function Cursor() {
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(
    subscribeFine,
    () => window.matchMedia(FINE).matches,
    () => false,
  );

  if (reduced || !fine) return null;
  return <CursorRing />;
}

function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    if (!ring) return;

    // Centring is done by GSAP in percent so it holds while the ring changes size
    gsap.set(ring, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(ring, "x", { duration: DUR.d1, ease: EASE.beam });
    const moveY = gsap.quickTo(ring, "y", { duration: DUR.d1, ease: EASE.beam });

    let frame: Element | null = null;

    const clearFrame = () => {
      frame?.removeAttribute("data-cursor-over");
      frame = null;
    };

    // While the ring is over a media frame, tell the frame where the ring is so its
    // haze overlay can be masked away inside it. The frame reads --ring-x and --ring-y.
    const track = () => {
      if (!frame) return;
      const box = frame.getBoundingClientRect();
      const x = Number(gsap.getProperty(ring, "x")) - box.left;
      const y = Number(gsap.getProperty(ring, "y")) - box.top;
      (frame as HTMLElement).style.setProperty("--ring-x", `${x}px`);
      (frame as HTMLElement).style.setProperty("--ring-y", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (ring.dataset.visible !== "true") {
        gsap.set(ring, { x: event.clientX, y: event.clientY });
        ring.dataset.visible = "true";
      }
      moveX(event.clientX);
      moveY(event.clientY);

      const target = event.target instanceof Element ? event.target : null;
      const media = target?.closest(MEDIA) ?? null;
      const button = target?.closest(BUTTON) ?? null;

      if (media !== frame) {
        clearFrame();
        if (media) {
          frame = media;
          media.setAttribute("data-cursor-over", "");
        }
      }

      ring.dataset.state = button ? "button" : media ? "media" : "default";
    };

    const onLeave = () => {
      ring.dataset.visible = "false";
      clearFrame();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(track);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(track);
      clearFrame();
      gsap.killTweensOf(ring);
    };
  }, []);

  return <div ref={ref} className="cursor" data-state="default" data-visible="false" aria-hidden="true" />;
}
