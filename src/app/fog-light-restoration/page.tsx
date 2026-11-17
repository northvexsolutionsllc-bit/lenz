import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Process } from "@/components/process/Process";
import { AddOnPricing } from "@/components/sections/AddOnPricing";
import { FinalCta } from "@/components/sections/FinalCta";
import { Guarantee } from "@/components/sections/Guarantee";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { pricing, services } from "@/content/home";
import { fog } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const PATH = "/fog-light-restoration";
const service = services.items[1];

export const metadata: Metadata = pageMetadata({ path: PATH });

// The secondary service page. CONTENT.md 5
// Kept short: four sections and a CTA. The process is the still variant, not the pinned
// set piece, for the same reason.
export default function FogLightRestorationPage() {
  return (
    <>
      {/* The add on has no price of its own yet, so the price given is the booking's */}
      <JsonLd
        data={[
          serviceSchema({ path: PATH, name: service.title, addedToBookingFrom: pricing.price.value }),
          breadcrumbSchema(PATH),
        ]}
      />

      <PageHero
        lead={fog.lead}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {fog.title.plain}
      </PageHero>

      <Process band variant="still" />
      <AddOnPricing />
      <Guarantee band />
      <FinalCta />
    </>
  );
}
