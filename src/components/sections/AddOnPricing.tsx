import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { DevNote } from "@/components/ui/DevNote";
import { pricing } from "@/content/home";
import { fog } from "@/content/pages";

// /fog-light-restoration, pricing. CONTENT.md 5
// The add-on price is still owed by the owner, so the section says what is known and
// marks what is not.
export function AddOnPricing() {
  const titleId = useId();

  return (
    <Section labelledBy={titleId}>
      <div className="shell flex flex-col items-start gap-24">
        <Eyebrow reveal>{pricing.eyebrow}</Eyebrow>
        <h2 id={titleId} className="h2" data-reveal>
          {fog.pricing.title}
          <DevNote note={fog.pricing.todo} className="ml-16" />
        </h2>
      </div>
    </Section>
  );
}
