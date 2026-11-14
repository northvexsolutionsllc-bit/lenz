// Jump to an element by id, on the route that is on screen.
//
// Recently visited routes stay in the document, hidden, so the same id can be there more
// than once and a plain "#id" link would be answered by whichever comes first, which may
// be one that is not laid out. This finds the one that is.
//
// It answers at once and jumps a moment later, after the browser has drawn the frame that
// shows the press. A jump means drawing a whole new screen, and doing that inside the
// press makes the press itself feel slow on a modest phone.
//
// Keyboard focus goes with the jump, as it does with a native "#id" link, so the next
// press of Tab carries on from the place arrived at, not from the link left behind.
export function jumpToAnchor(id: string): boolean {
  const target = Array.from(document.querySelectorAll<HTMLElement>(`[id="${id}"]`)).find(
    (el) => el.getClientRects().length > 0,
  );
  if (!target) return false;

  requestAnimationFrame(() => {
    window.setTimeout(() => {
      if (!target.isConnected) return;
      target.scrollIntoView({ block: "start" });

      // A section is not focusable by itself. It is made so for as long as it holds focus.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    }, 0);
  });

  return true;
}
