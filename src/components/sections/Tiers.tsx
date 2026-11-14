import { MediaFrame } from "@/components/ui/MediaFrame";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { guide } from "@/content/pages";
import { resolveSlot } from "@/lib/media";

// The three tiers of the vehicle guide. CONTENT.md 7
// Each tier carries its assigned accent: xenon for what restores well, beam for what
// takes extra work, oxide for what should be replaced. The accent colours the tier's
// rule and its numeral, and nothing else. Each tier has one photo slot.
//
// Until a photo's subject is known, its alt text is the tier's own name and first
// sentence, which describe the condition the photo is there to show.
export function Tiers() {
  return (
    <Section band>
      <div className="shell flex flex-col gap-24">
        <ol className="flex flex-col gap-24">
          {guide.tiers.map((tier, index) => (
            <li key={tier.title} className="tier" data-accent={tier.accent} data-reveal>
              <div className="tier-copy">
                <p className="numeral tier-numeral" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="h3">{tier.title}</h2>
                <p className="body">{tier.body}</p>
              </div>
              <MediaFrame
                slot={resolveSlot(tier.image)}
                ratio="4/3"
                alt={`${tier.title}. ${tier.body.split(". ")[0]}.`}
                tone={tier.accent === "oxide" ? "before" : tier.accent === "xenon" ? "after" : undefined}
                sizes="(min-width: 1024px) 30vw, 100vw"
              />
            </li>
          ))}
        </ol>
        <p data-reveal>
          <TodoChip note={guide.photosTodo} />
        </p>
      </div>
    </Section>
  );
}
