import type { ReactNode } from "react";

export type Ground = "night" | "smoke";

const GROUNDS: Ground[] = ["night", "smoke"];

type SpecimenProps = {
  title: string;
  /** The line from DESIGN.md that the specimen is checked against. */
  spec: string;
  /** Rendered twice, once per ground. Use the function form when a ground needs its own labels. */
  children: ReactNode | ((ground: Ground) => ReactNode);
  /** Stack the two grounds instead of placing them side by side. For wide specimens. */
  stacked?: boolean;
};

// One styleguide entry: every specimen is shown on night and again on smoke.
export function Specimen({ title, spec, children, stacked = false }: SpecimenProps) {
  return (
    <article className="flex flex-col gap-16 border-t border-beam-12 pt-32">
      <header className="flex flex-col gap-8">
        <h3 className="h3">{title}</h3>
        <p className="small">{spec}</p>
      </header>
      <div className={stacked ? "grid gap-16" : "grid gap-16 lg:grid-cols-2"}>
        {GROUNDS.map((ground) => (
          <div
            key={ground}
            className={`flex min-w-0 flex-col gap-24 rounded-card border border-beam-12 p-24 ${ground === "night" ? "bg-night" : "bg-smoke"}`}
          >
            <p className="caps">on {ground}</p>
            {typeof children === "function" ? children(ground) : children}
          </div>
        ))}
      </div>
    </article>
  );
}

type StateProps = {
  label: string;
  children: ReactNode;
};

// One labelled state inside a specimen
export function State({ label, children }: StateProps) {
  return (
    <div className="flex flex-col items-start gap-12">
      <p className="caps">{label}</p>
      {children}
    </div>
  );
}
