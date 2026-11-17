import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Process } from "@/components/process/Process";
import { AddOnPricing } from "@/components/sections/AddOnPricing";
import { FinalCta } from "@/components/sections/FinalCta";
import { Guarantee } from "@/components/sections/Guarantee";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { pricing } from "@/content/home";
import { marker } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const PATH = "/marker-light-restoration";

export const metadata: Metadata = pageMetadata({ path: PATH });

// An add on service page. docs/SEO.md section 3, docs/CONTENT-SEO.md
// It follows the fog light page: the heading, the process as the still variant, the
// price, the guarantee and the call to action.
export default function MarkerLightRestorationPage() {
  return (
    <>
      {/* The add on has no price of its own yet, so the price given is the booking's */}
      <JsonLd
        data={[serviceSchema({ path: PATH, name: marker.name, addedToBookingFrom: pricing.price.value }), breadcrumbSchema(PATH)]}
      />

      <PageHero
        lead={marker.lead}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {marker.title.plain} <span className="accent">{marker.title.accent}</span>
      </PageHero>

      <Process band variant="still" />
      <AddOnPricing />
      <Guarantee band />
      <FinalCta />
    </>
  );
}
