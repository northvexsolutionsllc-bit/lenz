import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { problem } from "@/content/home";
import { headlight } from "@/content/pages";

// /headlight-restoration, "what oxidation actually is". CONTENT.md 4
// CONTENT.md names this section without writing it, so it carries the account of
// oxidation that already exists: the eyebrow and the body of the home page's 3.2.
export function Oxidation() {
  const titleId = useId();

  return (
    <Section labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-32 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-6">
          <Eyebrow reveal>{problem.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {headlight.sections.oxidation}
          </h2>
        </div>
        <p className="body lg:col-span-5 lg:col-start-8 lg:self-end" data-reveal>
          {problem.body}
        </p>
      </div>
    </Section>
  );
}
