import type { Metadata } from "next";
import { site } from "@/content/site";

// The share image. scripts/generate.ts renders it at build time from the hero shader.
export const SHARE_IMAGE = { url: "/generated/share.jpg", width: 1200, height: 630, alt: site.name };

type PageMetadataInput = {
  /** The route, for the canonical URL */
  path: string;
  title: string;
  description?: string;
};

// One place that turns a page's title and description into its full metadata: the
// canonical URL, and the Open Graph and Twitter tags that make a shared link or a text
// message show a preview. The old site had none of these. AUDIT.md 4, item 11
export function pageMetadata({ path, title, description }: PageMetadataInput): Metadata {
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
