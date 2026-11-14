import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { StepRow } from "@/components/ui/StepRow";
import { TextLink } from "@/components/ui/TextLink";
import { services } from "@/content/home";

// Home, services. CONTENT.md 3.4
export function Services() {
  return (
    <Section band labelledBy="services-title">
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-5">
          <Eyebrow reveal>{services.eyebrow}</Eyebrow>
          <h2 id="services-title" className="h2" data-reveal>
            {services.title.plain} <span className="accent">{services.title.accent}</span>
          </h2>
        </div>

        <ol className="rule-list lg:col-span-7">
          {services.items.map((item, index) => (
            <StepRow
              key={item.title}
              number={index + 1}
              title={item.title}
              reveal
              action={
                <TextLink href={item.href} className="small self-start">
                  {item.link}
                </TextLink>
              }
            >
              {item.body}
            </StepRow>
          ))}
        </ol>
      </div>
    </Section>
  );
}
