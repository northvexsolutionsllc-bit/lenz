import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { LocationPage } from "@/components/sections/LocationPage";
import { pricing } from "@/content/home";
import { getLocation } from "@/content/locations";
import { getRoute } from "@/content/routes";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

// Headlight restoration in Oakley. CONTENT.md 8
// The page is the shared location template, filled with this city's own heading,
// opening, neighbourhoods and work photos from src/content/locations.ts.
const content = getLocation("headlight-restoration-oakley-ca");
const PATH = `/${content.slug}`;

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: content.metaTitle,
  description: content.opening,
});

export default function OakleyPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            path: PATH,
            name: getRoute(PATH).name,
            description: content.opening,
            city: content.city,
            minPrice: pricing.price.value,
          }),
          breadcrumbSchema(PATH),
        ]}
      />
      <LocationPage
        title={content.title}
        opening={content.opening}
        neighbourhoods={content.neighbourhoods}
        pairs={content.pairs}
      />
    </>
  );
}
