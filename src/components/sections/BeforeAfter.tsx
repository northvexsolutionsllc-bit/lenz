import { useId } from "react";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { beforeAfter } from "@/content/home";
import { FEATURED_PAIR } from "@/content/media";
import { getGalleryTiles, getPair } from "@/lib/gallery";

type BeforeAfterProps = {
  /** The id the hero's scroll cue points at. Only the home page sets it. */
  id?: string;
};

// Before and after. CONTENT.md 3.5
// The slider, then a six tile grid, then the way through to the full gallery.
export function BeforeAfter({ id }: BeforeAfterProps) {
  const titleId = useId();
  const pair = getPair(FEATURED_PAIR);

  return (
    <Section id={id} labelledBy={titleId}>
      <div className="shell flex flex-col gap-64">
        <div className="grid gap-x-24 gap-y-48 lg:grid-cols-12 lg:items-end">
          <div className="flex flex-col gap-24 lg:col-span-4">
            <Eyebrow reveal>{beforeAfter.eyebrow}</Eyebrow>
            <h2 id={titleId} className="h2" data-reveal>
              {beforeAfter.title.plain} <span className="accent">{beforeAfter.title.accent}</span>
            </h2>
            <p className="body" data-reveal>
              {beforeAfter.body}
              <TodoChip note={beforeAfter.todo} className="ml-8" />
            </p>
          </div>

          <div className="lg:col-span-8" data-reveal>
            <CompareSlider
              before={pair.before}
              after={pair.after}
              beforeAlt={pair.beforeAlt}
              afterAlt={pair.afterAlt}
              sizes="(min-width: 1024px) 62vw, 100vw"
            />
          </div>
        </div>

        <div data-reveal>
          <GalleryGrid tiles={getGalleryTiles(6)} />
        </div>

        <div data-reveal>
          <SecondaryButton href="/gallery">{beforeAfter.button}</SecondaryButton>
        </div>
      </div>
    </Section>
  );
}
