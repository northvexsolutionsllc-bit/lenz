import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type StepRowProps = {
  /** 1 based. Rendered as 01, 02, 03 with a leading zero. */
  number: number;
  title: string;
  /** The body copy. A row can also be a number and a title alone. */
  children?: ReactNode;
  as?: "li" | "div";
  /** Anything that follows the copy: a link, for example. */
  action?: ReactNode;
  /** Marks the row that is active, where a sequence steps through its rows. */
  current?: boolean;
  /** Takes part in its section's reveal. MOTION.md 5.5 */
  reveal?: boolean;
  className?: string;
};

// DESIGN.md 6: a numbered process row. Numeral in xenon at 40 percent, h3 title, body copy.
// The numeral is drawn by CSS from data-numeral. Order is carried by the list it sits in.
export function StepRow({ number, title, children, as: Tag = "li", action, current, reveal = false, className }: StepRowProps) {
  return (
    <Tag
      className={cx("step-row", className)}
      data-numeral={String(number).padStart(2, "0")}
      data-current={current === undefined ? undefined : String(current)}
      data-reveal={reveal ? "" : undefined}
    >
      <div className="step-row-copy">
        <h3 className="h3">{title}</h3>
        {children ? <p className="body">{children}</p> : null}
        {action}
      </div>
    </Tag>
  );
}
