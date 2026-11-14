import Image from "next/image";
import { cx } from "@/lib/cx";
import type { MediaSlot } from "@/lib/media";
import { PlaceholderFrame, RATIO_CLASS, type MediaRatio } from "./PlaceholderFrame";

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
// MediaFrame rules in components.css. Until the file exists, the slot shows its
// PlaceholderFrame instead.
export function MediaFrame({ slot, ratio, alt, tone, sizes, flush = false, className }: MediaFrameProps) {
  if (!slot.src) {
    return (
      <div
        className={cx("media-frame media-frame-empty", RATIO_CLASS[ratio], className)}
        data-tone={tone}
        data-flush={flush ? "true" : undefined}
      >
        <PlaceholderFrame file={slot.file} ratio={ratio} className="h-full" />
      </div>
    );
  }

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
