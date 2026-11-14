import { Counter } from "@/components/ui/Counter";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { TodoChip } from "@/components/ui/TodoChip";
import { reviews } from "@/content/home";

// Reviews. CONTENT.md 3.11, DECISIONS.md 11
// Built, and kept out of the page order until the client supplies the Google profile
// URL, the rating, the count and three review texts. Until then it only ever renders its
// placeholder state, and only on the styleguide. An empty reviews section on the live
// site would be worse than none.
export function Reviews() {
  const { profileUrl, rating, count, items } = reviews;
  const ready = profileUrl !== null && rating !== null && count !== null && items.length >= 3;

  return (
    <Section band labelledBy="reviews-title">
      <div className="shell flex flex-col gap-48">
        <div className="flex flex-col gap-24">
          <Eyebrow reveal>{reviews.eyebrow}</Eyebrow>
          <h2 id="reviews-title" className="h2" data-reveal>
            {reviews.title.plain} <span className="accent">{reviews.title.accent}</span>
          </h2>
        </div>

        {ready ? (
          <>
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
          </>
        ) : (
          <ReviewPlaceholder />
        )}
      </div>
    </Section>
  );
}

// The state the section holds until real reviews exist: three empty cards and the note
// of what is needed. Never shown on a live page.
export function ReviewPlaceholder() {
  return (
    <div className="flex flex-col gap-24" data-reveal>
      <ul className="grid gap-16 lg:grid-cols-3 lg:gap-24">
        {[1, 2, 3].map((slot) => (
          <li key={slot} className="placeholder-frame review-placeholder">
            <p className="caps">Review {slot}</p>
          </li>
        ))}
      </ul>
      <p className="caps flex items-center gap-8">
        {reviews.link}
        <TodoChip note={reviews.todo} />
      </p>
    </div>
  );
}
