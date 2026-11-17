import { useId } from "react";
import { Counter } from "@/components/ui/Counter";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { DevNote } from "@/components/ui/DevNote";
import { pricing } from "@/content/home";

// Home, pricing. CONTENT.md 3.8
// The caution callout has an oxide border and an oxide chip. The chip's text is night:
// any text sitting on oxide is night, never beam. DESIGN.md 2.3
type PricingProps = {
  /** Sits on the pine band instead of the night ground. */
  band?: boolean;
};

export function Pricing({ band = true }: PricingProps) {
  const titleId = useId();

  return (
    <Section band={band} labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-6">
          <Eyebrow reveal>{pricing.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            <Counter value={pricing.price.value} prefix={pricing.price.prefix} /> {pricing.title.plain}{" "}
            <span className="accent">{pricing.title.accent}</span>
          </h2>
          <p className="body" data-reveal>
            {pricing.body}
          </p>
        </div>

        <div className="flex flex-col gap-48 lg:col-span-6">
          <ul className="rule-list">
            {pricing.inclusions.map((item) => (
              <li key={item.title} className="check-row" data-reveal>
                <Icon name="check" size={20} className="check-row-icon" />
                <div className="flex flex-col gap-4">
                  <h3 className="h3">{item.title}</h3>
                  <p className="body">
                    {item.body}
                    {item.todo ? <DevNote note={item.todo} className="ml-8" /> : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="caution" data-reveal>
            <p className="caution-chip caps">{pricing.caution.chip}</p>
            <p className="body">{pricing.caution.body}</p>
          </aside>
        </div>
      </div>
    </Section>
  );
}
