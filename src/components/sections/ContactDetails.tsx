import { useId } from "react";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { TodoChip } from "@/components/ui/TodoChip";
import { contact } from "@/content/contact";
import { finalCta } from "@/content/home";
import { site } from "@/content/site";

// /contact: form, phone, service area, hours. CONTENT.md 1 and 2
// This is the page's contact section, so it is where the clarity curve arrives.
export function ContactDetails() {
  const titleId = useId();

  return (
    <Section band id="contact" labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-64 lg:grid-cols-12">
        <div className="flex flex-col gap-48 lg:col-span-5">
          <dl className="rule-list">
            <div className="flex flex-col items-start gap-8" data-reveal>
              <dt className="caps">{contact.labels.phone}</dt>
              <dd>
                <TextLink href={site.phone.href} className="body-l">
                  {site.phone.display}
                </TextLink>
              </dd>
            </div>
            <div className="flex flex-col items-start gap-8" data-reveal>
              <dt className="caps">{contact.labels.email}</dt>
              <dd>
                <TextLink href={site.email.href} className="body-l">
                  {site.email.display}
                </TextLink>
              </dd>
            </div>
            <div className="flex flex-col items-start gap-8" data-reveal>
              <dt className="caps">{contact.labels.hours}</dt>
              <dd>
                <TodoChip note={site.hours.todo} />
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-16" data-reveal>
            <p className="body">{site.serviceAreaLine}</p>
            <ul className="flex flex-wrap items-center gap-8">
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
        </div>

        <div className="flex flex-col gap-32 lg:col-span-6 lg:col-start-7">
          <h2 id={titleId} className="h2" data-reveal>
            {contact.form.title}
          </h2>
          <EnquiryForm subject={contact.form.title} submit={contact.form.title} fields={contact.form.fields} />
        </div>
      </div>
    </Section>
  );
}
