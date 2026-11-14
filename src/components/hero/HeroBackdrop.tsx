"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { BeamInput } from "./BeamCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// three.js is loaded on its own, after the page is interactive, and never on the server
const BeamCanvas = dynamic(() => import("./BeamCanvas").then((module) => module.BeamCanvas), { ssr: false });

// How long after the load event the canvas waits before it boots on its own, in ms
const BOOT_DELAY = 2500;

// A page that took longer than this to load, in ms, does not boot the canvas on its own
const SLOW_LOAD = 4000;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

// If the canvas fails for any reason, it renders nothing and the poster stays
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type HeroBackdropProps = {
  /** The image behind the canvas. It is what shows without WebGL and without script. */
  poster: string;
};

// The hero's canvas zone. MOTION.md 5.1 and 7
// A poster image with the beam canvas over it, exactly one viewport tall. The canvas
// mounts once the browser is idle, runs only while the hero is on screen, and fades in
// over the poster once its first frame is drawn.
export function HeroBackdrop({ poster }: HeroBackdropProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<BeamInput>({ x: 0.5, y: 0.62, progress: 0 });
  const [mounted, setMounted] = useState(false);
  const [painted, setPainted] = useState(false);
  const [inView, setInView] = useState(true);

  // Booting WebGL is the heaviest thing this page does, so it stays off the critical path.
  // It waits for the page to finish loading and then for a quiet moment. If the load
  // itself was slow, the device or the connection is struggling, and the canvas does not
  // boot on its own at all: the poster, which is the same frame, simply stays. A fine
  // pointer that starts moving is a sign of intent and boots it straight away.
  // If this route is hidden by a navigation, the canvas is dropped and built fresh when
  // the route is shown again.
  useEffect(() => {
    let booted = false;
    let timer: number | undefined;
    let idle: number | undefined;

    const boot = () => {
      if (booted) return;
      booted = true;
      window.removeEventListener("pointermove", boot);
      if (supportsWebGL()) setMounted(true);
    };

    const whenIdle = () => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(boot, { timeout: 2000 });
      else boot();
    };

    const arm = () => {
      if (performance.now() > SLOW_LOAD) return;
      timer = window.setTimeout(whenIdle, BOOT_DELAY);
    };

    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", boot, { once: true, passive: true });
    }

    return () => {
      booted = true;
      window.removeEventListener("load", arm);
      window.removeEventListener("pointermove", boot);
      window.clearTimeout(timer);
      if (idle !== undefined && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      setMounted(false);
      setPainted(false);
    };
  }, []);

  // Pause the render loop the moment the hero leaves the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fine pointers steer the beam. On coarse pointers there is no listener: it drifts.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      input.current.x = (event.clientX - box.left) / box.width;
      input.current.y = 1 - (event.clientY - box.top) / box.height;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  // uProgress: 0 at the top of the page, 1 when the hero is fully scrolled past
  useGSAP(
    () => {
      const hero = ref.current?.closest(".hero");
      if (!hero || reduced) return;

      gsap.to(input.current, {
        progress: 1,
        ease: "none", // scrub-eased
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { dependencies: [reduced] },
  );

  return (
    <div ref={ref} className="hero-backdrop" aria-hidden="true">
      <Image src={poster} alt="" fill preload sizes="100vw" className="object-cover" />
      {mounted ? (
        <div className="hero-canvas" data-painted={painted}>
          <CanvasBoundary>
            <BeamCanvas input={input} running={inView} still={reduced} onPainted={() => setPainted(true)} />
          </CanvasBoundary>
        </div>
      ) : null}
    </div>
  );
}
