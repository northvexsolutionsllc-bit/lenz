import { useId, type ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { DevNote } from "@/components/ui/DevNote";

export type FaqItem = {
  question: string;
  /** Null while the owner has still to supply it */
  answer: string | null;
  todo: string | null;
};

type FaqProps = {
  eyebrow: string;
  title: string;
  items: ReadonlyArray<FaqItem>;
  /** Words inside an answer that should link somewhere, and where to */
  links?: ReadonlyArray<{ text: string; href: string }>;
  band?: boolean;
};

// Turns the first linked phrase found in an answer into a link. The words do not change.
function withLinks(answer: string, links: FaqProps["links"]): ReactNode {
  const link = links?.find((entry) => answer.includes(entry.text));
  if (!link) return answer;
  const [before, after] = answer.split(link.text);
  return (
    <>
      {before}
      <TextLink href={link.href}>{link.text}</TextLink>
      {after}
    </>
  );
}

// Questions and answers, always open: nothing to expand, so every answer is on the page
// for a reader, a search engine and a visitor without script alike.
//
// A question whose answer is still owed by the owner is not asked: it is left out until
// the answer exists. (In development it shows, with its note in the answer's place.)
export function Faq({ eyebrow, title, items, links, band = false }: FaqProps) {
  const titleId = useId();
  const answered = items.filter((item) => item.answer !== null || item.todo !== null);

  return (
    <Section band={band} labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-48 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-4">
          <Eyebrow reveal>{eyebrow}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {title}
          </h2>
        </div>

        <ul className="rule-list lg:col-span-8">
          {answered.map((item) => (
            <li key={item.question} className="flex flex-col gap-8" data-reveal>
              <h3 className="h3">{item.question}</h3>
              <p className="body">
                {item.answer ? withLinks(item.answer, links) : null}
                {item.todo ? <DevNote note={item.todo} className={item.answer ? "ml-8" : undefined} /> : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
