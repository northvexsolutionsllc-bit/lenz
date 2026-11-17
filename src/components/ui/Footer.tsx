import Image from "next/image";
import { site } from "@/content/site";
import { Icon } from "./Icon";
import { Pill } from "./Pill";
import { SmartLink } from "./SmartLink";
import { TextLink } from "./TextLink";

type FooterProps = {
  /** True once public/media/logo.svg exists. Until then the wordmark is set in type. */
  hasLogo?: boolean;
  /** Accessible name of the footer nav. Only the styleguide specimens override it. */
  navLabel?: string;
};

// The pages that the header nav does not name. Labels are the service names from
// CONTENT.md 3.4 and SEO.md section 6, and the cost page's name. docs/CONTENT-SEO.md 16
const MORE_SERVICES = [
  { label: "Fog light restoration", href: "/fog-light-restoration" },
  { label: "Tail light restoration", href: "/tail-light-restoration" },
  { label: "Marker light restoration", href: "/marker-light-restoration" },
  { label: "Dealer and auction", href: "/dealer-and-auction" },
  { label: "Headlight restoration cost", href: "/headlight-restoration-cost" },
] as const;

// DESIGN.md 6: night ground, three columns on desktop, stacked on mobile. Service areas
// as Pills, the phone and email as TextLinks, Facebook and Instagram icons at 20px in
// beam-54. No payment icons (DECISIONS.md 7). Nothing in here animates (MOTION.md 8).
export function Footer({ hasLogo = false, navLabel = "Footer" }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="shell grid gap-x-24 gap-y-48 py-64 lg:grid-cols-12">
        <div className="flex flex-col gap-16 lg:col-span-5">
          {hasLogo ? (
            // Decorative here: the header logo already names the business. CONTENT.md 9
            <Image src="/media/logo.svg" alt="" width={160} height={32} unoptimized className="h-32 w-auto self-start" />
          ) : (
            <p className="wordmark text-beam">{site.wordmark}</p>
          )}
          <p className="small">{site.tagline}</p>
          <p className="small">{site.serviceAreaLine}</p>
        </div>

        <nav aria-label={navLabel} className="lg:col-span-3">
          <ul className="flex flex-col items-start gap-12">
            {[...site.nav, ...MORE_SERVICES].map((item) => (
              <li key={item.href}>
                <TextLink href={item.href} className="small">
                  {item.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col items-start gap-32 lg:col-span-4">
          <ul className="flex flex-wrap gap-8">
            {site.areas.map((area) => (
              <li key={area.href}>
                <Pill href={area.href}>{area.label}</Pill>
              </li>
            ))}
          </ul>

          <ul className="flex flex-col items-start gap-12">
            <li>
              <TextLink href={site.phone.href} className="body">
                {site.phone.display}
              </TextLink>
            </li>
            <li>
              <TextLink href={site.email.href} className="body">
                {site.email.display}
              </TextLink>
            </li>
          </ul>

          <ul className="flex gap-8">
            <li>
              <SmartLink href={site.social.facebook} className="icon-link">
                <Icon name="facebook" size={20} />
                <span className="sr-only">{`${site.name} on Facebook`}</span>
              </SmartLink>
            </li>
            <li>
              <SmartLink href={site.social.instagram} className="icon-link">
                <Icon name="instagram" size={20} />
                <span className="sr-only">{`${site.name} on Instagram`}</span>
              </SmartLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
