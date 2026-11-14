import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { StepRow } from "@/components/ui/StepRow";
import { booking } from "@/content/home";

// Home, booking. CONTENT.md 3.7
export function Booking() {
  const titleId = useId();

  return (
    <Section labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-5">
          <Eyebrow reveal>{booking.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {booking.title.plain} <span className="accent">{booking.title.accent}</span>
          </h2>
        </div>

        <ol className="rule-list lg:col-span-7">
          {booking.steps.map((step, index) => (
            <StepRow key={step.title} number={index + 1} title={step.title} reveal>
              {step.body}
            </StepRow>
          ))}
        </ol>
      </div>
    </Section>
  );
}
