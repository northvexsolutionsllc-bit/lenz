import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { guarantee } from "@/content/home";

// Home, the guarantee. CONTENT.md 3.9
// The written terms do not exist yet. The chip after the body marks where they are owed.
export function Guarantee() {
  return (
    <Section labelledBy="guarantee-title">
      <div className="shell grid gap-x-24 gap-y-32 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-7">
          <Eyebrow reveal>{guarantee.eyebrow}</Eyebrow>
          <h2 id="guarantee-title" className="h2" data-reveal>
            {guarantee.title.plain} <span className="accent">{guarantee.title.accent}</span>
          </h2>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:justify-end">
          <p className="body-l" data-reveal>
            {guarantee.body}
            <TodoChip note={guarantee.todo} className="ml-8" />
          </p>
        </div>
      </div>
    </Section>
  );
}
