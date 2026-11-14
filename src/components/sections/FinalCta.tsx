import { Pill } from "@/components/ui/Pill";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { finalCta } from "@/content/home";
import { site } from "@/content/site";

// The final call to action. CONTENT.md 3.12
// This is the contact section: its id is where the clarity curve reaches 1, so it is the
// cleanest, sharpest screen on the page. The two buttons are not part of the reveal.
// They are there, and tappable, from the first frame. MOTION.md 8
export function FinalCta() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="shell flex flex-col items-start gap-32">
        <h2 id="contact-title" className="h2" data-reveal>
          {finalCta.title.plain} <span className="accent">{finalCta.title.accent}</span>
        </h2>
        <p className="body-l" data-reveal>
          {finalCta.body}
        </p>

        <div className="flex flex-wrap gap-12">
          <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
          <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
        </div>

        <ul className="flex flex-wrap items-center gap-8 pt-16" data-reveal>
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
