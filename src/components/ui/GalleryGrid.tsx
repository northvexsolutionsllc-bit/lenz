"use client";

import { useState } from "react";
import { SERVICES, type ServiceId } from "@/content/media";
import type { MediaSlot } from "@/lib/media";
import { cx } from "@/lib/cx";
import { MediaFrame } from "./MediaFrame";

export type GalleryTile = {
  id: string;
  slot: MediaSlot;
  alt: string;
  service: ServiceId;
};

type GalleryGridProps = {
  /** Tiles whose photo exists. See getGalleryTiles. */
  tiles: GalleryTile[];
  /** Show the service type filter above the grid. */
  filterable?: boolean;
  /**
   * Never end on a short row. Tiles that would start a row they cannot fill are left
   * off, at each width. For a preview that links through to the whole gallery.
   */
  tidy?: boolean;
};

type Filter = ServiceId | "all";

// The gallery grid: 4/3 tiles, optionally filterable by service type. It is given only
// the tiles that have a photo, so it has no empty cell to draw. The filter offers only
// the services that have photos, and is left out when there is nothing to choose
// between.
export function GalleryGrid({ tiles, filterable = false, tidy = false }: GalleryGridProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const present = SERVICES.filter((service) => tiles.some((tile) => tile.service === service.id));
  const filters: Array<{ id: Filter; label: string }> = [{ id: "all", label: "All" }, ...present];
  const shown = filter === "all" ? tiles : tiles.filter((tile) => tile.service === filter);

  if (tiles.length === 0) return null;

  return (
    <div className="flex flex-col gap-32">
      {filterable && present.length > 1 ? (
        <div role="group" aria-label="Filter the gallery by service" className="flex flex-wrap gap-8">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              className="pill caps"
              aria-pressed={filter === option.id}
              data-active={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <ul className={cx("grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-24", tidy && "gallery-tidy")}>
        {shown.map((tile) => (
          <li key={tile.id}>
            <MediaFrame
              slot={tile.slot}
              ratio="4/3"
              alt={tile.alt}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
