import { useId } from "react";
import { Counter } from "@/components/ui/Counter";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { reviews } from "@/content/home";

// Reviews. CONTENT.md 3.11, DECISIONS.md 11
// Built, and kept out of the page order until the client supplies the Google profile
// URL, the rating, the count and three review texts. Until all four exist it renders
// nothing at all. An empty reviews section on the live site would be worse than none.
export function Reviews() {
  const titleId = useId();
  const { profileUrl, rating, count, items } = reviews;
  if (profileUrl === null || rating === null || count === null || items.length < 3) return null;

  return (
    <Section band labelledBy={titleId}>
      <div className="shell flex flex-col gap-48">
        <div className="flex flex-col gap-24">
          <Eyebrow reveal>{reviews.eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {reviews.title.plain} <span className="accent">{reviews.title.accent}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-24" data-reveal>
          <Counter value={rating} decimals={1} />
          <div className="flex flex-col gap-8">
            <p className="review-stars" role="img" aria-label={`${rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, index) => (
                <Icon key={index} name="star" size={20} />
              ))}
            </p>
            <TextLink href={profileUrl} className="small">
              {reviews.link}
            </TextLink>
          </div>
        </div>

        <ul className="grid gap-16 lg:grid-cols-3 lg:gap-24">
          {items.slice(0, 3).map((item) => (
            <li key={`${item.name}-${item.city}`} data-reveal>
              <GlassCard className="flex h-full flex-col justify-between gap-24">
                <p className="body">{item.text}</p>
                <p className="caps">
                  {item.name}, {item.city}
                </p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
