import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { finalCta } from "@/content/home";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

const PATH = "/contact";

export const metadata: Metadata = pageMetadata({ path: PATH });

// Form, phone, service area, hours. CONTENT.md 1
// CONTENT.md gives this route a purpose and no copy of its own, so the page opens with
// the site's final call to action (CONTENT.md 3.12), word for word.
export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(PATH)} />

      <PageHero
        lead={finalCta.body}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {finalCta.title.plain} <span className="accent">{finalCta.title.accent}</span>
      </PageHero>
      <ContactDetails />
    </>
  );
}
