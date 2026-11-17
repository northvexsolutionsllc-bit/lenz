import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { story } from "@/content/home";
import { cx } from "@/lib/cx";
import { resolveSlot } from "@/lib/media";

type StoryProps = {
  /** False where the page hero already carries the eyebrow and the heading, as on /about. */
  titled?: boolean;
};

// The story. CONTENT.md 3.10
// It is told once on the home page and once more on /about. Nowhere else. DECISIONS.md 4
//
// The owner's photo sits beside it once the file exists. Until then the story stands by
// itself, in one column.
export function Story({ titled = true }: StoryProps) {
  const titleId = useId();
  const photo = resolveSlot(story.image.file);

  return (
    <Section band labelledBy={titled ? titleId : undefined}>
      <div className={cx("shell grid items-center gap-x-24 gap-y-48", photo.src && "lg:grid-cols-12")}>
        {photo.src ? (
          <div className="lg:col-span-4" data-reveal>
            <MediaFrame slot={photo} ratio="4/5" alt={story.image.alt} sizes="(min-width: 1024px) 30vw, 100vw" />
          </div>
        ) : null}

        <div className={cx("flex flex-col items-start gap-24", photo.src && "lg:col-span-7 lg:col-start-6")}>
          {titled ? <Eyebrow reveal>{story.eyebrow}</Eyebrow> : null}
          <div data-reveal>
            <Pill>{story.badge}</Pill>
          </div>
          {titled ? (
            <h2 id={titleId} className="h2" data-reveal>
              {story.title.plain} <span className="accent">{story.title.accent}</span>
            </h2>
          ) : null}
          <p className="body" data-reveal>
            {story.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
