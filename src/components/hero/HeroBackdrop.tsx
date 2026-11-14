"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { hasNavigated } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { BeamInput } from "./BeamCanvas";
import { REST } from "./beam-model";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The canvas is loaded on its own, after the page is interactive, and never on the server
const BeamCanvas = dynamic(() => import("./BeamCanvas").then((module) => module.BeamCanvas), { ssr: false });

// How long after the load event the canvas waits before it boots on its own, in ms
const BOOT_DELAY = 400;

// A page that took longer than this to load, in ms, does not boot the canvas on its own
const SLOW_LOAD = 4000;

// What the beam gives way to. Its centre is bright enough to wash out anything set over
// it, and it goes where the pointer goes, so left alone it would sit behind whatever is
// being pointed at: the navigation, the phone number, the two buttons. MOTION.md 8 keeps
// the phone number and the call to action usable at all times, and DESIGN.md 2.3 holds
// text to its contrast. So over the things that are read or pressed the beam does not
// follow. It heads back to where it rests, which the layout keeps clear.
// The heading is not in this list: MOTION.md 5.1 wants the beam to light its letterforms.
const GIVES_WAY_TO = ".site-header, .hero-pitch, .hero-stats, .hero-cue";

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
  /** The image behind the canvas. It is what shows before the canvas and without script. */
  poster: string;
};

// The hero's canvas zone. MOTION.md 5.1 and 7
// A poster image with the beam canvas over it, exactly one viewport tall. The canvas
// mounts once the browser is idle, runs only while the hero is on screen, and fades in
// over the poster once its first frame is drawn.
export function HeroBackdrop({ poster }: HeroBackdropProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<BeamInput>({ x: REST[0], y: REST[1], progress: 0 });
  const [mounted, setMounted] = useState(false);
  const [painted, setPainted] = useState(false);
  const [inView, setInView] = useState(true);

  // A full-screen canvas redrawn every frame is the heaviest thing this page does, so it
  // stays off the critical path. It waits for the page to finish loading and then for a
  // quiet moment. If the load itself was slow, the device or the connection is
  // struggling, and the canvas does not boot on its own at all: the poster, which is the
  // same frame, simply stays. A fine pointer that starts moving is a sign of intent and
  // boots it straight away.
  // Arriving from another page of the site is different: the page is long since loaded,
  // and the canvas boots at once, so the beam is already running under the transition
  // panel before it lifts (MOTION.md 5.7).
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
      setMounted(true);
    };

    const whenIdle = () => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(boot, { timeout: 2000 });
      else boot();
    };

    const arm = () => {
      if (performance.now() > SLOW_LOAD) return;
      timer = window.setTimeout(whenIdle, BOOT_DELAY);
    };

    if (hasNavigated()) boot();
    else if (document.readyState === "complete") arm();
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

  // Fine pointers steer the beam, except over what it gives way to. On coarse pointers
  // there is no listener: it drifts.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(GIVES_WAY_TO)) {
        [input.current.x, input.current.y] = REST;
        return;
      }
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
