import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FinalCta } from "@/components/sections/FinalCta";
import { Story } from "@/components/sections/Story";
import { PageHero } from "@/components/ui/PageHero";
import { story } from "@/content/home";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

const PATH = "/about";

export const metadata: Metadata = pageMetadata({ path: PATH });

// The story, told once more. CONTENT.md 1 and 3.10, DECISIONS.md 4
// CONTENT.md gives this route a purpose and no copy of its own. The longer telling that
// DECISIONS.md expects here has not been written, so the page carries the story as it
// stands on the home page, word for word, and nothing is added to it.
export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(PATH)} />

      <PageHero eyebrow={story.eyebrow}>
        {story.title.plain} <span className="accent">{story.title.accent}</span>
      </PageHero>
      <Story titled={false} />
      <FinalCta />
    </>
  );
}
