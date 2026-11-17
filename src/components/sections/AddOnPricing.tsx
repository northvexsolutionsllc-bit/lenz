import { useId } from "react";
import { DevNote } from "@/components/ui/DevNote";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { pricing } from "@/content/home";
import { fog, nextSteps, priceList } from "@/content/pages";

// The pricing section of an add on page: fog, tail and marker lights. CONTENT.md 5,
// docs/CONTENT-SEO.md 13 and 14
//
// An add on has no price of its own yet. What is known is said: it is added to a
// headlight booking, what that booking starts at, and that the add on is priced per
// vehicle. Those are two lines of the price list on the cost page, which is one link
// away. The add on price itself is still owed by the owner.
export function AddOnPricing() {
  const titleId = useId();
  const rows = [priceList.headlight, priceList.addOns];

  return (
    <Section labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-32 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-24 lg:col-span-5">
          <Eyebrow reveal>{pricing.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {fog.pricing.title}
            <DevNote note={fog.pricing.todo} className="ml-16" />
          </h2>
        </div>

        <div className="flex flex-col items-start gap-24 lg:col-span-6 lg:col-start-7">
          <ul className="rule-list w-full">
            {rows.map((row) => (
              <li key={row.name} className="price-row" data-reveal>
                <h3 className="h3">{row.name}</h3>
                <p className="body">{row.figure}</p>
              </li>
            ))}
          </ul>
          <p data-reveal>
            <TextLink href={nextSteps.guideToCost.href}>{nextSteps.guideToCost.text}</TextLink>
          </p>
        </div>
      </div>
    </Section>
  );
}
