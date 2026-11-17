import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { nextSteps } from "@/content/pages";

type NextStepProps = {
  /** Where the page hands the reader on to */
  step: { text: string; href: string };
  band?: boolean;
};

// The link that ends a page. docs/SEO.md section 5: every page ends with a next step,
// not a dead end. The guide hands on to the cost page, the cost page to the gallery,
// and the gallery to the contact page. The other pages end with the call to action.
export function NextStep({ step, band = false }: NextStepProps) {
  return (
    <Section band={band}>
      <div className="shell flex flex-col items-start gap-16">
        <p className="caps" data-reveal>
          {nextSteps.label}
        </p>
        <p className="h2" data-reveal>
          <TextLink href={step.href}>{step.text}</TextLink>
        </p>
      </div>
    </Section>
  );
}
