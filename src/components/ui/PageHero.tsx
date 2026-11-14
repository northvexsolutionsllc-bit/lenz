import type { ReactNode } from "react";
import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";
import { TodoChip } from "./TodoChip";

type PageHeroProps = {
  eyebrow?: string;
  /** The heading text, with its one accent span if it has one. */
  children: ReactNode;
  lead?: string;
  /** The owner note for a lead that is still to be confirmed. Shown as a TODO chip. */
  leadTodo?: string;
  /** What follows the lead: buttons, for example. */
  actions?: ReactNode;
  /** Anything below the actions: a row of figures or a list of places. */
  after?: ReactNode;
};

// The top of every page except the home page: eyebrow, the display heading with its
// line reveal, and a lead paragraph, on the night ground under the transparent header.
// The actions are there from the first frame. They are not part of any reveal.
export function PageHero({ eyebrow, children, lead, leadTodo, actions, after }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="shell flex flex-col items-start gap-24">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <DisplayHeading>{children}</DisplayHeading>
        {lead ? (
          <p className="body-l">
            {lead}
            {leadTodo ? <TodoChip note={leadTodo} className="ml-8" /> : null}
          </p>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-12 pt-8">{actions}</div> : null}
        {after}
      </div>
    </section>
  );
}
