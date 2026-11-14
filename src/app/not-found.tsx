import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { TextLink } from "@/components/ui/TextLink";
import { site } from "@/content/site";

const STATUS = "404";

// Next.js marks a not-found response noindex on its own
export const metadata: Metadata = {
  title: `${STATUS} | ${site.name}`,
};

// The page for an address that does not exist. CONTENT.md has no copy for it, so it
// carries none: the status code as its heading, the way to every main page, and the two
// calls to action.
export default function NotFound() {
  return (
    <PageHero
      actions={
        <>
          <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
          <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
        </>
      }
      after={
        <ul className="flex flex-wrap gap-x-32 gap-y-16 pt-32">
          {site.nav.map((item) => (
            <li key={item.href}>
              <TextLink href={item.href} className="body">
                {item.label}
              </TextLink>
            </li>
          ))}
        </ul>
      }
    >
      {STATUS}
    </PageHero>
  );
}
