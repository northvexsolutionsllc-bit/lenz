import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CostAnswers, costQuestions } from "@/components/sections/Cost";
import { FinalCta } from "@/components/sections/FinalCta";
import { NextStep } from "@/components/sections/NextStep";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cost, nextSteps } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const PATH = "/headlight-restoration-cost";

export const metadata: Metadata = pageMetadata({ path: PATH });

// What it costs. docs/SEO.md sections 3 and 9, docs/CONTENT-SEO.md section 12
// The page SEO.md calls the most valuable on the site: the questions about price, with
// real numbers, answered by the business itself. It hands on to the gallery.
export default function HeadlightRestorationCostPage() {
  return (
    <>
      <JsonLd data={[faqSchema(costQuestions()), breadcrumbSchema(PATH)]} />

      <PageHero
        eyebrow={cost.eyebrow}
        lead={cost.lead}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
      >
        {cost.title.plain} <span className="accent">{cost.title.accent}</span>
      </PageHero>

      <CostAnswers />
      <NextStep step={nextSteps.costToGallery} />
      <FinalCta />
    </>
  );
}
