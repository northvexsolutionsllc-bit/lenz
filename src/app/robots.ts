import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Everything is open to crawlers except the styleguide, which is a build tool and also
// carries a noindex of its own.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/styleguide" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
