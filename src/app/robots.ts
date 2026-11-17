import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site-url";

// On the production host everything is open to crawlers except the styleguide, which is
// a build tool and also carries a noindex of its own. Anywhere else the whole site is
// closed: a staging copy is not for search engines. See src/lib/site-url.ts.
export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/styleguide" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
