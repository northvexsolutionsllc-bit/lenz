import type { ReactNode } from "react";
import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";

type PageHeroProps = {
  eyebrow?: string;
  /** The heading text, with its one accent span if it has one. */
  children: ReactNode;
  lead?: string;
  /** Anything that follows the lead: buttons, for example. */
  actions?: ReactNode;
};

// The top of every page except the home page: eyebrow, the display heading with its
// line reveal, and a lead paragraph, on the night ground under the transparent header.
export function PageHero({ eyebrow, children, lead, actions }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="shell flex flex-col items-start gap-24">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <DisplayHeading>{children}</DisplayHeading>
        {lead ? <p className="body-l">{lead}</p> : null}
        {actions}
      </div>
    </section>
  );
}
