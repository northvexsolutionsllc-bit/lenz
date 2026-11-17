import { locations } from "@/content/locations";
import { afterAlt, beforeAlt, gallery, galleryAlt, pairs, type Pair } from "@/content/media";
import type { GalleryTile } from "@/components/ui/GalleryGrid";
import { resolveSlot, type MediaSlot } from "@/lib/media";

// Server only. Joins the media data in src/content/media.ts with what is actually on
// disk in public/media, ready for the slider and the grid.
//
// Everything here returns only what exists. A pair missing either photo, or a tile with
// no file, is left out, so nothing downstream ever has an empty slot to draw.

export type ResolvedPair = {
  id: string;
  before: MediaSlot;
  after: MediaSlot;
  beforeAlt: string;
  afterAlt: string;
};

function resolvePair(pair: Pair): ResolvedPair {
  return {
    id: pair.id,
    before: resolveSlot(`before-${pair.id}.jpg`),
    after: resolveSlot(`after-${pair.id}.jpg`),
    beforeAlt: pair.vehicle ? beforeAlt(pair.vehicle) : "",
    afterAlt: pair.vehicle ? afterAlt(pair.vehicle) : "",
  };
}

const complete = (pair: ResolvedPair) => pair.before.src !== null && pair.after.src !== null;

/** Every pair that has both of its photos. */
export function getPairs(): ResolvedPair[] {
  return pairs.map(resolvePair).filter(complete);
}

export function getPair(id: string): ResolvedPair {
  const pair = pairs.find((entry) => entry.id === id);
  if (!pair) throw new Error(`No before and after pair with id ${id}`);
  return resolvePair(pair);
}

/**
 * The pairs shown on a location page, `slots` at most.
 *
 * The pairs assigned to the city come first. Nobody has yet said where each existing
 * pair was done, so until a city has pairs of its own its page shows the work there is:
 * the same set on every city page, each starting one further along, so that no two
 * pages lead with the same photo. Nothing on the page says the photos were taken in
 * that city, and their alt text names no city.
 */
export function getLocationPairs(slug: string, slots = 3): ResolvedPair[] {
  const index = locations.findIndex((entry) => entry.slug === slug);
  const assigned = (locations[index]?.pairs ?? []).map(getPair).filter(complete);
  if (assigned.length > 0) return assigned.slice(0, slots);

  const all = getPairs();
  return Array.from({ length: Math.min(slots, all.length) }, (_, step) => all[(Math.max(index, 0) + step) % all.length]);
}

/** Gallery tiles that have their photo, `limit` at most. */
export function getGalleryTiles(limit?: number): GalleryTile[] {
  return gallery
    .map((item) => ({
      id: item.id,
      slot: resolveSlot(`gallery-${item.id}.jpg`),
      alt: item.vehicle ? galleryAlt(item.vehicle) : "",
      service: item.service,
    }))
    .filter((tile) => tile.slot.src !== null)
    .slice(0, limit);
}
