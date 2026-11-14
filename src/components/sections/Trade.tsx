import { useId } from "react";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { pricing } from "@/content/home";
import { dealer } from "@/content/pages";

// The sections of /dealer-and-auction. CONTENT.md 6
// A different audience: volume, consistency, turnaround. No story and no first names.

/** The id of the form the call to action leads to. It is this page's contact section. */
export const TRADE_FORM_ID = "contact";

// The three points. CONTENT.md gives each a title and nothing more.
export function TradePoints() {
  return (
    <Section band>
      <div className="shell">
        <ol className="grid gap-16 lg:grid-cols-3 lg:gap-24">
          {dealer.points.map((point, index) => (
            <li key={point} data-reveal>
              <GlassCard className="flex h-full flex-col gap-16">
                <p className="numeral" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="h3">{point}</h2>
              </GlassCard>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

// Volume pricing. Blocked on the owner: the section holds its place and says so.
export function VolumePricing() {
  const titleId = useId();

  return (
    <Section labelledBy={titleId}>
      <div className="shell flex flex-col items-start gap-24">
        <Eyebrow reveal>{pricing.eyebrow}</Eyebrow>
        <h2 id={titleId} className="h2" data-reveal>
          {dealer.volume.title}
          <TodoChip note={dealer.volume.todo} className="ml-16" />
        </h2>
      </div>
    </Section>
  );
}

// The short form the call to action leads to: the four fields CONTENT.md lists
export function TradeForm() {
  const titleId = useId();
  const [dealership, contact, address, units] = dealer.form;

  return (
    <Section band id={TRADE_FORM_ID} labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <h2 id={titleId} className="h2 lg:col-span-5" data-reveal>
          {dealer.cta}
        </h2>
        <div className="lg:col-span-6 lg:col-start-7">
          <EnquiryForm
            subject={dealer.cta}
            submit={dealer.cta}
            fields={[
              { label: dealership, autoComplete: "organization" },
              { label: contact, autoComplete: "name" },
              { label: address, autoComplete: "street-address" },
              { label: units, type: "number" },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
