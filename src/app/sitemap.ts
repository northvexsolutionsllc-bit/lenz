import type { MetadataRoute } from "next";
import { routes } from "@/content/routes";
import { builtOn } from "@/generated/build";
import { siteUrl } from "@/lib/site-url";

// A real sitemap, listing every route. The old site answered /sitemap.xml with its home
// page, a soft 404 (AUDIT.md 4, item 8). The list comes from the one route registry, so
// a new page cannot be left out of it.
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: builtOn,
    changeFrequency: "monthly",
    priority: route.path === "/" ? 1 : route.parent ? 0.7 : 0.8,
  }));
}
