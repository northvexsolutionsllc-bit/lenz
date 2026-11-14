import { cx } from "@/lib/cx";

type MarqueeProps = {
  items: readonly string[];
  /** Accessible name for the list, for example "Service areas". */
  label: string;
  className?: string;
  /** Styleguide only: hold the marquee in a state, for example "hover" to show it paused. */
  preview?: string;
};

// DESIGN.md 6: caps, scrolling horizontally at 40s per loop, beam-54, pauses on hover.
// Under reduced motion it becomes a static wrapped list. That switch is pure CSS.
// The second track is a visual duplicate that makes the loop seamless.
export function Marquee({ items, label, className, preview }: MarqueeProps) {
  return (
    <div className={cx("marquee", className)} data-preview={preview}>
      <ul className="marquee-track" aria-label={label}>
        {items.map((item) => (
          <li key={item} className="caps">
            {item}
          </li>
        ))}
      </ul>
      <ul className="marquee-track" aria-hidden="true">
        {items.map((item) => (
          <li key={item} className="caps">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
