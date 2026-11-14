import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { GuideClosing } from "@/components/sections/GuideClosing";
import { Tiers } from "@/components/sections/Tiers";
import { PageHero } from "@/components/ui/PageHero";
import { guide } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const PATH = "/vehicle-guide";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: guide.meta.title,
  description: guide.meta.description,
});

// The honesty page: what restores well and what does not. CONTENT.md 7
export default function VehicleGuidePage() {
  return (
    <>
      {/* The page's one question and answer is its closing callout */}
      <JsonLd data={[faqSchema([guide.closing]), breadcrumbSchema(PATH)]} />

      <PageHero lead={guide.lead}>{guide.title.plain}</PageHero>
      <Tiers />
      <GuideClosing />
    </>
  );
}
