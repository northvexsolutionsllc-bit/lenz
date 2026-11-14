import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { TodoChip } from "@/components/ui/TodoChip";
import { problem } from "@/content/home";

// Home, the problem. CONTENT.md 3.2
export function Problem() {
  return (
    <Section labelledBy="problem-title">
      <div className="shell flex flex-col gap-64">
        <div className="flex flex-col gap-24">
          <Eyebrow reveal>{problem.eyebrow}</Eyebrow>
          <h2 id="problem-title" className="h2" data-reveal>
            {problem.title.plain} <span className="accent">{problem.title.accent}</span>
          </h2>
          <p className="body" data-reveal>
            {problem.body}
          </p>
        </div>

        <ul className="grid gap-16 lg:grid-cols-3 lg:gap-24">
          {problem.points.map((point) => (
            <li key={point.title} data-reveal>
              <GlassCard className="flex h-full flex-col gap-16">
                <p className="numeral">{point.numeral}</p>
                <h3 className="h3">{point.title}</h3>
                <p className="body">
                  {point.body}
                  {point.todo ? <TodoChip note={point.todo} className="ml-8" /> : null}
                </p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
