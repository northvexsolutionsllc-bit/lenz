import { Eyebrow } from "@/components/ui/Eyebrow";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { story } from "@/content/home";
import { resolveSlot } from "@/lib/media";

// Home, the story. CONTENT.md 3.10
// It is told once, here, and once more on /about. Nowhere else. DECISIONS.md 4
export function Story() {
  return (
    <Section band labelledBy="story-title">
      <div className="shell grid items-center gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="lg:col-span-4" data-reveal>
          <MediaFrame
            slot={resolveSlot(story.image.file)}
            ratio="4/5"
            alt={story.image.alt}
            sizes="(min-width: 1024px) 30vw, 100vw"
          />
        </div>

        <div className="flex flex-col items-start gap-24 lg:col-span-7 lg:col-start-6">
          <Eyebrow reveal>{story.eyebrow}</Eyebrow>
          <div data-reveal>
            <Pill>{story.badge}</Pill>
          </div>
          <h2 id="story-title" className="h2" data-reveal>
            {story.title.plain} <span className="accent">{story.title.accent}</span>
          </h2>
          <p className="body" data-reveal>
            {story.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
