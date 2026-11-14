"use client";

import { useState } from "react";
import { SERVICES, type ServiceId } from "@/content/media";
import type { MediaSlot } from "@/lib/media";
import { MediaFrame } from "./MediaFrame";

export type GalleryTile = {
  id: string;
  slot: MediaSlot;
  alt: string;
  service: ServiceId;
};

type GalleryGridProps = {
  tiles: GalleryTile[];
  /** Show the service type filter above the grid. */
  filterable?: boolean;
};

type Filter = ServiceId | "all";

const FILTERS: Array<{ id: Filter; label: string }> = [{ id: "all", label: "All" }, ...SERVICES];

// The gallery grid: 4/3 tiles, optionally filterable by service type. Every tile is a
// MediaFrame, so an empty slot shows its PlaceholderFrame with the expected filename.
export function GalleryGrid({ tiles, filterable = false }: GalleryGridProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? tiles : tiles.filter((tile) => tile.service === filter);

  return (
    <div className="flex flex-col gap-32">
      {filterable ? (
        <div role="group" aria-label="Filter the gallery by service" className="flex flex-wrap gap-8">
          {FILTERS.map((option) => (
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

      <ul className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-24">
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
