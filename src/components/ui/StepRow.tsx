import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type StepRowProps = {
  /** 1 based. Rendered as 01, 02, 03 with a leading zero. */
  number: number;
  title: string;
  children: ReactNode;
  as?: "li" | "div";
  className?: string;
};

// DESIGN.md 6: a numbered process row. Numeral in xenon at 40 percent, h3 title, body copy.
// The numeral is drawn by CSS from data-numeral. Order is carried by the list it sits in.
export function StepRow({ number, title, children, as: Tag = "li", className }: StepRowProps) {
  return (
    <Tag className={cx("step-row", className)} data-numeral={String(number).padStart(2, "0")}>
      <div className="flex flex-col gap-8">
        <h3 className="h3">{title}</h3>
        <p className="body">{children}</p>
      </div>
    </Tag>
  );
}
