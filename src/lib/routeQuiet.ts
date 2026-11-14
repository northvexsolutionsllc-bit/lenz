// MOTION.md 8: nothing animates during the first 200ms after a route change.
//
// Entrances do not start themselves. They hand their start to afterQuiet(). On a first
// load the gate is open and they start at once. When a navigation begins the gate closes.
// It stays closed until 200ms after the new route is on screen, and then everything that
// asked in the meantime starts together. The page transition panel and the hero beam
// are the two things MOTION.md 5.7 asks to run through that window.

const QUIET = 200; // ms. MOTION.md 8
const STUCK = 4000; // ms. A navigation that never lands must not hold the page for good.

let closed = false;
let navigated = false;
let timer: number | undefined;
const waiting = new Set<() => void>();

function open() {
  closed = false;
  window.clearTimeout(timer);
  document.documentElement.removeAttribute("data-route-quiet");
  const starts = [...waiting];
  waiting.clear();
  starts.forEach((start) => start());
}

/** A navigation is about to replace the page: hold every entrance until it has settled. */
export function beginRouteChange() {
  closed = true;
  navigated = true;
  // Two marks for CSS: one for the quiet window itself, and one that stays, so a later
  // route can be told apart from the first load. See base.css and components.css.
  document.documentElement.setAttribute("data-route-quiet", "");
  document.documentElement.setAttribute("data-navigated", "");
  window.clearTimeout(timer);
  timer = window.setTimeout(open, STUCK);
}

/** The new route is on screen. Entrances may start 200ms from now. */
export function routeChanged() {
  if (!closed) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(open, QUIET);
}

/** True once the visitor has moved between routes without a page load. */
export function hasNavigated(): boolean {
  return navigated;
}

/**
 * Runs `start` now, or as soon as the quiet period after a route change is over.
 * Returns a function that cancels a start that has not happened yet.
 */
export function afterQuiet(start: () => void): () => void {
  if (!closed) {
    start();
    return () => undefined;
  }
  waiting.add(start);
  return () => {
    waiting.delete(start);
  };
}
