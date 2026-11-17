import { useId } from "react";
import { FinalCta } from "@/components/sections/FinalCta";
import { StagesSummary } from "@/components/sections/StagesSummary";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { Pill } from "@/components/ui/Pill";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Section } from "@/components/ui/Section";
import { Stats } from "@/components/ui/Stats";
import { DevNote } from "@/components/ui/DevNote";
import { beforeAfter, hero } from "@/content/home";
import { openingTodo } from "@/content/locations";
import { site } from "@/content/site";
import { getLocationPairs } from "@/lib/gallery";

type LocationPageProps = {
  /** The heading: the shared words and the city, which is the accent */
  title: { plain: string; accent: string };
  /** 70 to 100 words that are about this city and no other */
  opening: string;
  /** The places in this city that the page names */
  neighbourhoods: ReadonlyArray<string>;
  /** The page's own slug, which decides the work photos it shows. See getLocationPairs. */
  slug: string;
};

// The location page template. CONTENT.md 8
// One template, four fills. What differs comes in as props: the heading, the opening
// paragraph, the neighbourhoods and the three work photos. Nothing here builds a
// sentence around a city name.
//
// In CONTENT.md order: the heading, the opening, three before and after pairs, the four
// stages, price and guarantee, the service area statement, and the call to action.
// Price and guarantee are the two figures from the home page hero. Apart from the
// opening, the page states its facts as headings, figures and lists, so the opening is
// the only body copy that belongs to the page.
export function LocationPage({ title, opening, neighbourhoods, slug }: LocationPageProps) {
  const workId = useId();
  const [price, guarantee] = hero.stats;
  const pairs = getLocationPairs(slug);

  return (
    <>
      <PageHero
        lead={opening}
        leadTodo={openingTodo}
        actions={
          <>
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </>
        }
        after={
          <>
            <ul className="flex flex-wrap gap-8 pt-8">
              {neighbourhoods.map((place) => (
                <li key={place}>
                  <Pill>{place}</Pill>
                </li>
              ))}
            </ul>
            <Stats items={[price, guarantee]} className="pt-32" />
          </>
        }
      >
        {title.plain} <span className="accent">{title.accent}</span>
      </PageHero>

      {pairs.length > 0 ? (
        <Section band labelledBy={workId}>
          <div className="shell flex flex-col gap-48">
            <div className="flex flex-col items-start gap-24">
              <Eyebrow reveal>{beforeAfter.eyebrow}</Eyebrow>
              <h2 id={workId} className="h2" data-reveal>
                {beforeAfter.title.plain} <span className="accent">{beforeAfter.title.accent}</span>
                <DevNote note={beforeAfter.todo} className="ml-16" />
              </h2>
            </div>
            <ul className="location-pairs" data-count={pairs.length}>
              {pairs.map((pair) => (
                <li key={pair.id} data-reveal>
                  <CompareSlider
                    before={pair.before}
                    after={pair.after}
                    beforeAlt={pair.beforeAlt}
                    afterAlt={pair.afterAlt}
                    sizes="(min-width: 1024px) 30vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <StagesSummary />
      <FinalCta serviceArea />
    </>
  );
}
