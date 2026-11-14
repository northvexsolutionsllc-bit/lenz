import { afterAlt, beforeAlt, gallery, galleryAlt, PAIR_FAMILY, pairs, type Pair } from "@/content/media";
import type { GalleryTile } from "@/components/ui/GalleryGrid";
import { resolveSlot, type MediaSlot } from "@/lib/media";

// Server only. Joins the media data in src/content/media.ts with what is actually on
// disk in public/media, ready for the slider and the grid.

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

export function getPairs(): ResolvedPair[] {
  return pairs.map(resolvePair);
}

export function getPair(id: string): ResolvedPair {
  const pair = pairs.find((entry) => entry.id === id);
  if (!pair) throw new Error(`No before and after pair with id ${id}`);
  return resolvePair(pair);
}

/**
 * The pairs shown on a location page: the ones assigned to it, then open slots up to
 * `slots`. An open slot is waiting for the owner to say which pair was done in that city.
 */
export function getLocationPairs(ids: string[], slots = 3): ResolvedPair[] {
  const assigned = ids.slice(0, slots).map(getPair);
  const open = Array.from({ length: slots - assigned.length }, (_, index) => ({
    id: `open-${index + 1}`,
    before: { file: PAIR_FAMILY.before, src: null },
    after: { file: PAIR_FAMILY.after, src: null },
    beforeAlt: "",
    afterAlt: "",
  }));
  return [...assigned, ...open];
}

export function getGalleryTiles(limit?: number): GalleryTile[] {
  return gallery.slice(0, limit).map((item) => ({
    id: item.id,
    slot: resolveSlot(`gallery-${item.id}.jpg`),
    alt: item.vehicle ? galleryAlt(item.vehicle) : "",
    service: item.service,
  }));
}
