import { AnchorLink } from "@/components/ui/AnchorLink";
import { Counter } from "@/components/ui/Counter";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { TodoChip } from "@/components/ui/TodoChip";
import { hero } from "@/content/home";
import { site } from "@/content/site";
import { heroStill } from "@/generated/build";
import { hasMedia, mediaSrc } from "@/lib/media";
import { HeroBackdrop } from "./HeroBackdrop";

// The client's night shot when it exists, otherwise one frame of the beam shader that
// scripts/generate.ts renders at build time. DESIGN.md 5
function posterSrc(): string {
  return hasMedia("hero-poster.jpg") ? mediaSrc("hero-poster.jpg") : heroStill;
}

// The home hero. CONTENT.md 3.1, MOTION.md 5.1 and 5.2
// The beam canvas fills the first viewport. The heading sits over it on a wrapper with
// mix-blend-mode: plus-lighter, so the beam lights the letterforms. The layout keeps
// everything clear of where the beam rests: see the hero rules in components.css.
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroBackdrop poster={posterSrc()} />

      <div className="hero-layout shell">
        <div className="hero-title">
          <div className="hero-title-blend">
            <DisplayHeading id="hero-title">
              <span className="block">{hero.title.plain}</span>{" "}
              <span className="accent block">{hero.title.accent}</span>
            </DisplayHeading>
          </div>
        </div>

        <div className="hero-pitch">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <p className="body-l">{hero.lead}</p>
          <div className="hero-actions">
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </div>
        </div>

        <dl className="hero-stats">
          {hero.stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <dt className="caps flex items-center gap-8">
                {stat.label}
                {stat.todo ? <TodoChip note={stat.todo} /> : null}
              </dt>
              <dd>
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>

        <AnchorLink target="before-after" className="hero-cue caps">
          {hero.cue}
          <Icon name="arrow-down" size={16} />
        </AnchorLink>
      </div>
    </section>
  );
}
