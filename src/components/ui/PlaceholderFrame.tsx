import { cx } from "@/lib/cx";

export type MediaRatio = "16/9" | "4/3" | "3/2" | "4/5";

// The four ratios in DESIGN.md 5, mapped to the aspect utilities defined in tokens.css
export const RATIO_CLASS: Record<MediaRatio, string> = {
  "16/9": "aspect-hero",
  "4/3": "aspect-tile",
  "3/2": "aspect-pair",
  "4/5": "aspect-portrait",
};

type PlaceholderFrameProps = {
  /** The filename the client must supply, exactly as listed in DESIGN.md 5. */
  file: string;
  ratio: MediaRatio;
  className?: string;
};

// DESIGN.md 6: correct aspect ratio, smoke fill, beam-12 dashed hairline, and a centred
// caps label showing the expected filename and ratio. Stands in for a media slot until
// the real file lands in public/media. The filename keeps its real letter case, because
// that is the name the file has to be saved under.
export function PlaceholderFrame({ file, ratio, className }: PlaceholderFrameProps) {
  return (
    <div className={cx("placeholder-frame w-full", RATIO_CLASS[ratio], className)}>
      <p className="caps flex flex-col gap-4">
        <span className="normal-case">{file}</span>
        <span>{ratio}</span>
      </p>
    </div>
  );
}
