import { useId } from "react";
import { Pill } from "@/components/ui/Pill";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { finalCta } from "@/content/home";
import { site } from "@/content/site";

type FinalCtaProps = {
  /** Also state the service area in words: the line from CONTENT.md 2. Location pages do. */
  serviceArea?: boolean;
};

// The final call to action. CONTENT.md 3.12
// This is the contact section: its id is where the clarity curve reaches 1, so it is the
// cleanest, sharpest screen on the page. The two buttons are not part of the reveal.
// They are there, and tappable, from the first frame. MOTION.md 8
export function FinalCta({ serviceArea = false }: FinalCtaProps) {
  const titleId = useId();

  return (
    <Section id="contact" labelledBy={titleId}>
      <div className="shell flex flex-col items-start gap-32">
        <h2 id={titleId} className="h2" data-reveal>
          {finalCta.title.plain} <span className="accent">{finalCta.title.accent}</span>
        </h2>
        <p className="body-l" data-reveal>
          {finalCta.body}
        </p>

        <div className="flex flex-wrap gap-12">
          <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
          <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
        </div>

        {serviceArea ? (
          <p className="body pt-16" data-reveal>
            {site.serviceAreaLine}
          </p>
        ) : null}

        <ul className={serviceArea ? "flex flex-wrap items-center gap-8" : "flex flex-wrap items-center gap-8 pt-16"} data-reveal>
          {finalCta.areas.map((area) => (
            <li key={area.label}>
              <Pill href={area.href ?? undefined}>{area.label}</Pill>
            </li>
          ))}
          <li>
            <TodoChip note={finalCta.todo} />
          </li>
        </ul>
      </div>
    </Section>
  );
}
