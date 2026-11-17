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
import { tail } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const PATH = "/tail-light-restoration";

export const metadata: Metadata = pageMetadata({ path: PATH });

// An add on service page. docs/SEO.md section 3, docs/CONTENT-SEO.md
// It follows the fog light page: the heading, the process as the still variant, the
// price, the guarantee and the call to action.
export default function TailLightRestorationPage() {
  return (
    <>
      {/* The add on has no price of its own yet, so the price given is the booking's */}
      <JsonLd
        data={[serviceSchema({ path: PATH, name: tail.name, addedToBookingFrom: pricing.price.value }), breadcrumbSchema(PATH)]}
      />

      <PageHero
        lead={tail.lead}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {tail.title.plain} <span className="accent">{tail.title.accent}</span>
      </PageHero>

      <Process band variant="still" />
      <AddOnPricing />
      <Guarantee band />
      <FinalCta />
    </>
  );
}
