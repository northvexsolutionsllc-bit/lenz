import type { Metadata } from "next";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { beforeAfter } from "@/content/home";
import { site } from "@/content/site";
import { getGalleryTiles, getPairs } from "@/lib/gallery";

export const metadata: Metadata = {
  title: `Gallery | ${site.name}`,
  description: beforeAfter.body,
};

// CONTENT.md gives this route a purpose ("Before and after work, filterable") but no copy
// of its own, so it carries the home page's before and after copy, word for word.
export default function GalleryPage() {
  return (
    <>
      <PageHero eyebrow={beforeAfter.eyebrow} lead={beforeAfter.body}>
        {beforeAfter.title.plain} <span className="accent">{beforeAfter.title.accent}</span>
      </PageHero>

      <Section band>
        <div className="shell">
          <ul className="grid gap-24 lg:grid-cols-2">
            {getPairs().map((pair) => (
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

      <Section>
        <div className="shell" data-reveal>
          <GalleryGrid tiles={getGalleryTiles()} filterable />
        </div>
      </Section>
    </>
  );
}
