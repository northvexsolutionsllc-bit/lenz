import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Process } from "@/components/process/Process";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Booking } from "@/components/sections/Booking";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Guarantee } from "@/components/sections/Guarantee";
import { Oxidation } from "@/components/sections/Oxidation";
import { Pricing } from "@/components/sections/Pricing";
import { ProcessPhotos } from "@/components/sections/ProcessPhotos";
import { WontFix } from "@/components/sections/WontFix";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { pricing, services } from "@/content/home";
import { headlight } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";

const PATH = "/headlight-restoration";
const [service] = services.items;

export const metadata: Metadata = pageMetadata({ path: PATH });

// The primary service page. CONTENT.md 4
// Sections in the order CONTENT.md gives: hero, what oxidation actually is, the four
// stages, what it costs, what it will not fix, before and after, guarantee, booking,
// FAQ, CTA.
export default function HeadlightRestorationPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            path: PATH,
            name: service.title,
            minPrice: pricing.price.value,
          }),
          faqSchema(headlight.faq),
          breadcrumbSchema(PATH),
        ]}
      />

      <PageHero
        lead={headlight.lead}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {headlight.title.plain} <span className="accent">{headlight.title.accent}</span>
      </PageHero>

      <Oxidation />
      <Process band after={<ProcessPhotos />} />
      <Pricing band={false} />
      <WontFix band />
      <BeforeAfter />
      <Guarantee band />
      <Booking />
      <Faq
        band
        eyebrow={service.title}
        title={headlight.sections.faq}
        items={headlight.faq}
        links={[{ text: "vehicle guide", href: "/vehicle-guide" }]}
      />
      <FinalCta />
    </>
  );
}
