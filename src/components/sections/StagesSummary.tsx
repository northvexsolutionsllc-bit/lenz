import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { StepRow } from "@/components/ui/StepRow";
import { TextLink } from "@/components/ui/TextLink";
import { process, services } from "@/content/home";

// The four stages, named. CONTENT.md 3.6
// The short form of the process, for the location pages: the heading, the four stage
// names, and the way through to the full account on the service page. The link is the
// one the home page uses for the same journey (CONTENT.md 3.4).
export function StagesSummary() {
  const titleId = useId();
  const [headlight] = services.items;

  return (
    <Section labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-24 lg:col-span-5">
          <Eyebrow reveal>{process.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {process.title.plain} <span className="accent">{process.title.accent}</span>
          </h2>
          <div data-reveal>
            <TextLink href={headlight.href} className="small">
              {headlight.link}
            </TextLink>
          </div>
        </div>

        <ol className="rule-list lg:col-span-7">
          {process.stages.map((stage, index) => (
            <StepRow key={stage.title} number={index + 1} title={stage.title} reveal />
          ))}
        </ol>
      </div>
    </Section>
  );
}
