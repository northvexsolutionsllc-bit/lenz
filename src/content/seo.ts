import { locations } from "./locations";

// Titles, descriptions and the one keyword each page is for. docs/SEO.md sections 3 and 4.
//
// Every title and description is verbatim from the table in SEO.md section 4, which is
// written and final: they are not to be paraphrased. The four city pages follow the
// pattern SEO.md gives for Antioch. "npm run audit:seo" reads that table and fails if a
// page's title or description differs from it by a character.

export type PageSeo = {
  title: string;
  description: string;
  /** The page's one primary keyword, from the page map. Null where the map says "brand". */
  keyword: string | null;
};

const pages: Record<string, PageSeo> = {
  "/": {
    title: "Mobile Headlight Restoration, Antioch and Brentwood CA",
    description:
      "We come to your car. Cloudy headlights restored from $125 with a 3 year guarantee. Serving Antioch, Brentwood, Pittsburg and Oakley. Text a photo for a quote.",
    keyword: "mobile headlight restoration",
  },
  "/headlight-restoration": {
    title: "Headlight Restoration From $125, We Come To You",
    description:
      "Four stage sanding, compound, polish and UV coating, done at your car in about an hour. 3 year guarantee. Text photos for a same day quote.",
    keyword: "headlight restoration",
  },
  "/headlight-restoration-cost": {
    title: "How Much Does Headlight Restoration Cost in 2027?",
    description:
      "Real prices from a mobile restorer in East Contra Costa. From $125 a pair, what changes the price, and how it compares to new assemblies.",
    keyword: "headlight restoration cost",
  },
  "/fog-light-restoration": {
    title: "Fog Light Restoration, Added To Any Headlight Job",
    description:
      "Fog lights cloud over before headlights do. Same four stage process, same UV coating, same 3 year guarantee, done in the same visit.",
    keyword: "fog light restoration",
  },
  "/tail-light-restoration": {
    title: "Tail Light Restoration, Mobile, East Contra Costa",
    description:
      "Faded tail lights age a car from behind and cut how well you are seen. Restored on site, same visit as your headlights.",
    keyword: "tail light restoration",
  },
  "/marker-light-restoration": {
    title: "Marker Light Restoration, Done At Your Car",
    description: "Hazy side markers on the same four stage correction and UV coating as the headlights. Added to any booking.",
    keyword: "marker light restoration",
  },
  "/vehicle-guide": {
    title: "Which Headlights Can Be Restored, An Honest Guide",
    description:
      "What restores well, what takes extra work, and what needs replacing instead. Written by the people who would rather turn the job down.",
    keyword: "can foggy headlights be fixed",
  },
  "/dealer-and-auction": {
    title: "Dealer and Auction Headlight Reconditioning, Mobile",
    description: "Per unit pricing, we work your row on site, every unit leaves matching. Serving dealers across East Contra Costa.",
    keyword: "dealer headlight restoration",
  },
  "/gallery": {
    title: "Headlight Restoration Before and After Photos",
    description: "Real lenses restored on site in Antioch, Brentwood, Pittsburg and Oakley. Drag the slider on any pair.",
    keyword: "headlight restoration before and after",
  },
  "/about": {
    title: "About Lenz Rescue, A Family Run Local Business",
    description:
      "Started so a seventeen year old would not have to take a job he hated. Mobile headlight restoration across East Contra Costa.",
    keyword: null,
  },
  "/contact": {
    title: "Contact Lenz Rescue, Text 925 812 5524",
    description: "Text photos of both headlights for a same day quote. Mobile service across Antioch, Brentwood, Pittsburg and Oakley.",
    keyword: null,
  },
  // SEO.md gives Antioch and says to use the same pattern for the other three
  ...Object.fromEntries(
    locations.map((location) => [
      `/${location.slug}`,
      {
        title: `Headlight Restoration in ${location.city} CA, From $125`,
        description: `Mobile headlight restoration in ${location.city}. We come to your driveway, four stage correction, UV coating, 3 year guarantee.`,
        keyword: `headlight restoration ${location.city.toLowerCase()}`,
      } satisfies PageSeo,
    ]),
  ),
};

export function getSeo(path: string): PageSeo {
  const entry = pages[path];
  if (!entry) throw new Error(`docs/SEO.md gives no title and description for ${path}. Add it to src/content/seo.ts.`);
  return entry;
}
