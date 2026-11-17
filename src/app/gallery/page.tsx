import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { NextStep } from "@/components/sections/NextStep";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { beforeAfter } from "@/content/home";
import { nextSteps } from "@/content/pages";
import { getGalleryTiles, getPairs } from "@/lib/gallery";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, imageSchema } from "@/lib/schema";

const PATH = "/gallery";

export const metadata: Metadata = pageMetadata({ path: PATH });

// CONTENT.md gives this route a purpose ("Before and after work, filterable") but no copy
// of its own, so it carries the home page's before and after copy, word for word.
// Only the pairs and the tiles that have their photos are shown, and a part with none
// is left out whole.
export default function GalleryPage() {
  const pairs = getPairs();
  const tiles = getGalleryTiles();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(PATH),
          // Every photo of every pair, with its caption. SEO.md 7
          ...imageSchema(
            pairs.flatMap((pair) => [
              { src: pair.before.src ?? "", caption: pair.beforeAlt },
              { src: pair.after.src ?? "", caption: pair.afterAlt },
            ]),
          ),
        ]}
      />

      <PageHero eyebrow={beforeAfter.eyebrow} lead={beforeAfter.body}>
        {beforeAfter.title.plain} <span className="accent">{beforeAfter.title.accent}</span>
      </PageHero>

      {pairs.length > 0 ? (
        <Section band>
          <div className="shell">
            <ul className="grid gap-24 lg:grid-cols-2">
              {pairs.map((pair) => (
                <li key={pair.id} data-reveal>
                  <CompareSlider
                    before={pair.before}
                    after={pair.after}
                    beforeAlt={pair.beforeAlt}
                    afterAlt={pair.afterAlt}
                    sizes="(min-width: 1024px) 46vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      {tiles.length > 0 ? (
        <Section>
          <div className="shell" data-reveal>
            <GalleryGrid tiles={tiles} filterable />
          </div>
        </Section>
      ) : null}

      <NextStep step={nextSteps.galleryToContact} band />
    </>
  );
}
