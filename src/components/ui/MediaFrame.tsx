import Image from "next/image";
import { cx } from "@/lib/cx";
import type { MediaSlot } from "@/lib/media";

export type MediaRatio = "16/9" | "4/3" | "3/2" | "4/5";

// The four ratios in DESIGN.md 5, mapped to the aspect utilities defined in tokens.css
export const RATIO_CLASS: Record<MediaRatio, string> = {
  "16/9": "aspect-hero",
  "4/3": "aspect-tile",
  "3/2": "aspect-pair",
  "4/5": "aspect-portrait",
};

export type MediaTone = "before" | "after";

type MediaFrameProps = {
  slot: MediaSlot;
  ratio: MediaRatio;
  /** Real alt text describing the vehicle and its state. CONTENT.md 9 */
  alt: string;
  /** Before images carry the oxide tint, after images the xenon tint. */
  tone?: MediaTone;
  /** The sizes attribute for the responsive image. */
  sizes: string;
  /** Inside a CompareSlider the layer has no frame of its own. */
  flush?: boolean;
  className?: string;
};

// The image treatment from DESIGN.md 5. A 10px frame with a beam-12 hairline and no
// shadow. The photo is never shown raw: a filter stack and a night multiply overlay sit
// mixed phone photos together, and a tint marks before and after. On hover the overlay
// lifts and the filter relaxes over 640ms: clarity on hover. All of it is CSS, see the
// MediaFrame rules in components.css.
//
// A slot whose file has not been supplied renders nothing at all: no box, no frame and
// no filename. Whatever holds it closes up around the gap, so the page looks finished
// with the photos it has. The file drops in later under its name, with no code change.
export function MediaFrame({ slot, ratio, alt, tone, sizes, flush = false, className }: MediaFrameProps) {
  if (!slot.src) return null;

  return (
    <div
      className={cx("media-frame", RATIO_CLASS[ratio], className)}
      data-tone={tone}
      data-flush={flush ? "true" : undefined}
      data-cursor="media"
    >
      <Image src={slot.src} alt={alt} fill sizes={sizes} draggable={false} />
    </div>
  );
}
