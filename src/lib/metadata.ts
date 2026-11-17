import type { Metadata } from "next";
import { afterAlt, beforeAlt, pairs } from "@/content/media";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { shareImage, sharePair } from "@/generated/build";

// The share image: a before and after pair, side by side, at 1200 by 630. scripts/generate.ts
// makes it at build time and says which pair it shows. docs/SEO.md section 8
// Its description is the pair's own alt text, CONTENT.md 9.
const shown = pairs.find((pair) => pair.id === sharePair)?.vehicle ?? null;

export const SHARE_IMAGE = {
  url: shareImage,
  width: 1200,
  height: 630,
  alt: shown ? `${beforeAlt(shown)}. ${afterAlt(shown)}.` : site.name,
};

type PageMetadataInput = {
  /** The route, for the canonical URL */
  path: string;
  /** Only for a page that SEO.md does not list, such as the 404 page. */
  title?: string;
  description?: string;
};

// One place that turns a page's title and description into its full metadata: the
// canonical URL, and the Open Graph and Twitter tags that make a shared link or a text
// message show a preview. The old site had none of these. AUDIT.md 4, item 11
//
// The title and the description of a route are the ones docs/SEO.md gives it, held in
// src/content/seo.ts. A page passes only its path.
export function pageMetadata({ path, ...given }: PageMetadataInput): Metadata {
  const { title, description } = given.title ? given : getSeo(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      url: path,
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
