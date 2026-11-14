import { useId } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Section } from "@/components/ui/Section";
import { guide } from "@/content/pages";
import { site } from "@/content/site";

// /vehicle-guide, the closing callout. CONTENT.md 7
// One line in CONTENT.md, set as the question it asks and the answer it gives. It is
// this page's contact section, so it is where the clarity curve arrives. The button is
// not part of the reveal: it is there from the first frame.
export function GuideClosing() {
  const titleId = useId();

  return (
    <Section id="contact" labelledBy={titleId}>
      <div className="shell flex flex-col items-start gap-32">
        <h2 id={titleId} className="h2" data-reveal>
          {guide.closing.question}
        </h2>
        <p className="body-l" data-reveal>
          {guide.closing.answer}
        </p>
        <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
      </div>
    </Section>
  );
}
