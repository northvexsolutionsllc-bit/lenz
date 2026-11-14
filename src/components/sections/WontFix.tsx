import { useId } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { guide, headlight } from "@/content/pages";
import { site } from "@/content/site";

// /headlight-restoration, "what it will not fix". CONTENT.md 4
// CONTENT.md names this section without writing it, so it carries the honest answer that
// already exists: the third tier of the vehicle guide (CONTENT.md 7), and the way to it.
type WontFixProps = {
  /** Sits on the pine band instead of the night ground. */
  band?: boolean;
};

export function WontFix({ band = false }: WontFixProps) {
  const titleId = useId();
  const replace = guide.tiers[2];
  const guideLink = site.nav.find((item) => item.href === "/vehicle-guide");

  return (
    <Section band={band} labelledBy={titleId}>
      <div className="shell grid gap-x-24 gap-y-32 lg:grid-cols-12">
        <div className="flex flex-col gap-24 lg:col-span-6">
          <Eyebrow reveal>{replace.title}</Eyebrow>
          <h2 id={titleId} className="h2" data-reveal>
            {headlight.sections.wontFix}
          </h2>
        </div>
        <div className="flex flex-col items-start gap-24 lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="body" data-reveal>
            {replace.body}
          </p>
          {guideLink ? (
            <div data-reveal>
              <TextLink href={guideLink.href} className="small">
                {guideLink.label}
              </TextLink>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
