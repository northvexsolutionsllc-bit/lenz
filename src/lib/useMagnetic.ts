"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Magnetic primary button. MOTION.md 5.6
// Fine pointers only, never on touch, and no listeners under reduced motion.
// The strength, travel, durations and eases below are the literal values from that section.
export function useMagnetic(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const strength = 0.35, max = 18;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = gsap.utils.clamp(-max, max, (e.clientX - (r.left + r.width / 2)) * strength);
      const y = gsap.utils.clamp(-max, max, (e.clientY - (r.top + r.height / 2)) * strength);
      gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, reduced]);
}
