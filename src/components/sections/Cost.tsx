import { useId, type ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { cost } from "@/content/pages";

type QuestionProps = {
  /** The question, exactly as people type it. It is the section's heading. */
  title: string;
  band?: boolean;
  /** The answer, beside the question */
  children: ReactNode;
  /** Anything that needs the full width, under the question and its answer */
  below?: ReactNode;
};

// One question of the cost page: the question on the left as the heading, and the
// answer on the right.
function Question({ title, band = false, children, below }: QuestionProps) {
  const titleId = useId();

  return (
    <Section band={band} labelledBy={titleId}>
      <div className="shell flex flex-col gap-48">
        <div className="grid gap-x-24 gap-y-32 lg:grid-cols-12">
          <h2 id={titleId} className="h2 lg:col-span-5" data-reveal>
            {title}
          </h2>
          <div className="flex flex-col items-start gap-24 lg:col-span-6 lg:col-start-7">{children}</div>
        </div>
        {below}
      </div>
    </Section>
  );
}

// /headlight-restoration-cost. docs/CONTENT-SEO.md section 12, docs/SEO.md sections 5 and 9
// The headings are the questions people search for, each with a straight answer under
// it: what it costs, what changes the price, how long it lasts, whether it is worth it
// against new headlights or a kit, and what is turned away. Every answer is on the page
// as plain text, open, for a reader and a search engine alike.
export function CostAnswers() {
  const { price, changes, lasts, worth, declined } = cost;

  return (
    <>
      <Question title={price.question} band>
        <p className="body" data-reveal>
          {price.body}
        </p>
        <ul className="rule-list w-full">
          {price.rows.map((row) => (
            <li key={row.name} className="price-row" data-reveal>
              <h3 className="h3">{row.name}</h3>
              <p className="body">{row.figure}</p>
            </li>
          ))}
        </ul>
      </Question>

      <Question title={changes.question}>
        {changes.body.map((paragraph) => (
          <p key={paragraph} className="body" data-reveal>
            {paragraph}
          </p>
        ))}
      </Question>

      <Question title={lasts.question} band>
        <p className="body" data-reveal>
          {lasts.body}
        </p>
      </Question>

      <Question
        title={worth.question}
        below={
          <div className="flex flex-col gap-24">
            <ul className="grid gap-24 lg:grid-cols-3">
              {worth.options.map((option) => (
                <li key={option.name} className="tier items-start" data-accent={option.accent} data-reveal>
                  <div className="tier-copy">
                    <p className="caps">{option.name}</p>
                    <h3 className="h3">{option.figure}</h3>
                    <p className="body">{option.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="small" data-reveal>
              {worth.caption}
            </p>
          </div>
        }
      >
        <p className="body" data-reveal>
          {worth.body}
        </p>
      </Question>

      <Question title={declined.question} band>
        <p className="body" data-reveal>
          {declined.body}
        </p>
        <p data-reveal>
          <TextLink href={declined.link.href}>{declined.link.label}</TextLink>
        </p>
      </Question>
    </>
  );
}

/** The five questions and their answers as plain text, for the page's structured data. */
export function costQuestions(): Array<{ question: string; answer: string }> {
  const { price, changes, lasts, worth, declined } = cost;
  return [
    { question: price.question, answer: [price.body, ...price.rows.map((row) => `${row.name}: ${row.figure}.`)].join(" ") },
    { question: changes.question, answer: changes.body.join(" ") },
    { question: lasts.question, answer: lasts.body },
    { question: worth.question, answer: [worth.body, ...worth.options.map((option) => `${option.name}: ${option.figure}. ${option.body}`)].join(" ") },
    { question: declined.question, answer: declined.body },
  ];
}
