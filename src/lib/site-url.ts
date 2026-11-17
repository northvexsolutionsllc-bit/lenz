// Where this build is served from, and whether search engines may index it.
//
// The address comes from NEXT_PUBLIC_SITE_URL, set wherever the site is deployed:
//
//   production   NEXT_PUBLIC_SITE_URL=https://lenzrescue.com
//   staging      NEXT_PUBLIC_SITE_URL=https://the-staging-host
//
// Without it, the address the host itself reports is used: Netlify's URL, or Vercel's
// VERCEL_PROJECT_PRODUCTION_URL. Failing both, the build is taken to be a local one.
//
// Only the production host is indexable. Anything else is staging. There, every page
// says noindex and nofollow, robots.txt turns crawlers away, and the canonical address
// is the staging host's own. A staging copy must never be indexed, and it must never
// point at a domain that does not have these pages yet.
//
// The value is read when the site is built, so changing it means building again.

/** The one host that search engines may index. From docs/AUDIT.md section 1. */
export const PRODUCTION_HOST = "lenzrescue.com";

const LOCAL = "http://localhost:3000";

function address(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/** The origin every canonical, sitemap and share address is built on. No trailing slash. */
export const siteUrl: string =
  address(process.env.NEXT_PUBLIC_SITE_URL) ??
  (process.env.NETLIFY ? address(process.env.URL) : null) ??
  address(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  LOCAL;

/** True only on the production host, with or without www. */
export const indexable: boolean = new URL(siteUrl).hostname.replace(/^www\./, "") === PRODUCTION_HOST;
