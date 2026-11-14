"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { EASE } from "@/lib/gsap";
import { beginRouteChange, routeChanged } from "@/lib/routeQuiet";
import { useReducedMotion } from "@/lib/useReducedMotion";

// MOTION.md 5.7. These two are the literal values from that section.
const WIPE = 0.52; // seconds, each way
const HOLD = 0.12; // seconds

// How long the panel will wait, fully covering, before it carries on regardless: first
// for smooth scrolling to come to rest, then for a route that is slow to arrive.
const REST_LIMIT = 1200; // ms
const ARRIVE_LIMIT = 8000; // ms

type Navigate = (href: string) => void;

const PageTransitionContext = createContext<Navigate | null>(null);

/** The transition's navigate function, or null outside the provider. */
export function usePageTransition(): Navigate | null {
  return useContext(PageTransitionContext);
}

// Scrolling is held while the panel is up, so the page underneath cannot be moved and
// smooth scrolling is not fed anything new.
function holdScroll(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

// The page transition. MOTION.md 5.7
// A single beam panel wipes up from the bottom, holds 120ms, and wipes off the top, 520ms
// each way on ease-swap. The route changes while the panel covers the screen. There is no
// spinner, no loader and no logo. Under reduced motion there is no panel: the route simply
// changes.
//
// Browser back and forward are not intercepted. The page has already changed by the time
// the browser reports them.
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const phase = useRef<"idle" | "covering" | "waiting" | "leaving">("idle");
  const failsafe = useRef<number | undefined>(undefined);

  const release = useCallback(() => {
    window.removeEventListener("wheel", holdScroll, { capture: true });
    window.removeEventListener("touchmove", holdScroll, { capture: true });
  }, []);

  const lift = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    window.clearTimeout(failsafe.current);
    phase.current = "leaving";
    gsap.to(panel, {
      yPercent: -100,
      duration: WIPE,
      ease: EASE.swap,
      delay: HOLD,
      onComplete: () => {
        panel.dataset.active = "false";
        gsap.set(panel, { clearProps: "transform" });
        phase.current = "idle";
        release();
      },
    });
  }, [release]);

  const navigate = useCallback<Navigate>(
    (href) => {
      if (phase.current !== "idle") return;

      // Same page: a hash or a query change. There is nothing to cover.
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) {
        router.push(href);
        return;
      }

      const panel = panelRef.current;
      if (reduced || !panel) {
        beginRouteChange();
        router.push(href);
        return;
      }

      // MOTION.md 5.7: by the time the panel lifts, the home page's beam is already running
      if (target.pathname === "/") void import("@/components/hero/BeamCanvas");

      phase.current = "covering";
      window.addEventListener("wheel", holdScroll, { capture: true, passive: false });
      window.addEventListener("touchmove", holdScroll, { capture: true, passive: false });
      panel.dataset.active = "true";

      gsap.fromTo(
        panel,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: WIPE,
          ease: EASE.swap,
          onComplete: () => {
            // Smooth scrolling still gliding would carry its old position onto the new
            // page, so the route waits, covered, for it to come to rest.
            const covered = performance.now();
            const go = () => {
              const gliding = document.documentElement.classList.contains("lenis-scrolling");
              if (gliding && performance.now() - covered < REST_LIMIT) {
                requestAnimationFrame(go);
                return;
              }
              phase.current = "waiting";
              beginRouteChange();
              router.push(href);
              failsafe.current = window.setTimeout(lift, ARRIVE_LIMIT);
            };
            go();
          },
        },
      );
    },
    [reduced, router, lift],
  );

  // The new route is on screen
  useEffect(() => {
    routeChanged();
    if (phase.current === "waiting") lift();
  }, [pathname, lift]);

  useEffect(
    () => () => {
      window.clearTimeout(failsafe.current);
      release();
    },
    [release],
  );

  return (
    <PageTransitionContext.Provider value={navigate}>
      {children}
      <div ref={panelRef} className="page-transition" data-active="false" aria-hidden="true" />
    </PageTransitionContext.Provider>
  );
}
