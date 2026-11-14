// Jump to an element by id, on the route that is on screen.
//
// Recently visited routes stay in the document, hidden, so the same id can be there more
// than once and a plain "#id" link would be answered by whichever comes first, which may
// be one that is not laid out. This finds the one that is.
export function jumpToAnchor(id: string): boolean {
  const target = Array.from(document.querySelectorAll<HTMLElement>(`[id="${id}"]`)).find(
    (el) => el.getClientRects().length > 0,
  );
  if (!target) return false;
  target.scrollIntoView({ block: "start" });
  return true;
}
