// The four location pages. docs/CONTENT.md section 8.
//
// One template, four different fills. The H1 and the neighbourhoods are from CONTENT.md,
// verbatim. The title and the meta description are in src/content/seo.ts, from SEO.md.
// The pages are not made by swapping a city name into shared text: each has its own
// opening.
//
// THE OPENINGS ARE DRAFTS. CONTENT.md does not contain them. It gives the brief: 70 to
// 100 words that are actually about that city, and the local detail each one must
// mention, kept below as `mustMention`. Each draft is written to that brief in the house
// style. Each uses the page's keyword once, in a sentence, as docs/SEO.md section 5 asks:
// "headlight restoration in" and the city. Under "npm run dev" each shows a note beside
// it carrying the owner note. Replace the text here once the owner has confirmed or
// rewritten it.

import type { CityName } from "./area";

// CONTENT.md 8, the TODO(owner) under the table
export const openingTodo =
  process.env.NODE_ENV === "development"
    ? "confirm the local detail in each opening line is accurate before publishing. A location page with a wrong neighbourhood name is worse than no location page."
    : null;

export type LocationContent = {
  /** The route, without the leading slash */
  slug: string;
  city: CityName;
  title: { plain: string; accent: string };
  /** CONTENT.md 8: what the opening line must mention */
  mustMention: string;
  /** Draft, 70 to 100 words, awaiting owner confirmation */
  opening: string;
  /** The places named in the brief, shown as the neighbourhood list */
  neighbourhoods: string[];
  /**
   * Ids of the before and after pairs from work done in this city, three at most.
   * TODO(owner): nobody has yet said where each existing pair was done, so these are
   * empty and each page shows three of the pairs there are. See src/lib/gallery.ts.
   */
  pairs: string[];
};

export const locations: LocationContent[] = [
  {
    slug: "headlight-restoration-antioch-ca",
    city: "Antioch",
    title: { plain: "Headlight restoration in", accent: "Antioch." },
    mustMention: "Highway 4 commuting, Somersville, Deer Valley, Hillcrest",
    opening:
      "Antioch headlights take a beating from the commute. Highway 4 puts grit and road film on the lens every morning and every evening, and the sun finishes the job while the car sits in the driveway. Our headlight restoration in Antioch is mobile: whether you are off Somersville, in Deer Valley or near Hillcrest, we come to your driveway or your work parking lot and restore the lenses you already have. Send photos first and you get a firm number before anyone books anything.",
    neighbourhoods: ["Somersville", "Deer Valley", "Hillcrest"],
    pairs: [],
  },
  {
    slug: "headlight-restoration-brentwood-ca",
    city: "Brentwood",
    title: { plain: "Headlight restoration in", accent: "Brentwood." },
    mustMention: "Vineyard and orchard road dust, Balfour, Shadow Lakes, Brentwood Blvd",
    opening:
      "Brentwood still has working farm roads, and the dust that comes off the vineyards and orchards is fine enough to scour a headlight a little more every season. Over a few years that wears the factory coating thin, and the plastic underneath starts to yellow. For headlight restoration in Brentwood you do not have to drive anywhere. We restore lenses on site across town, from Balfour to Shadow Lakes and along Brentwood Blvd. Text photos of both headlights and we will tell you what we are working with.",
    neighbourhoods: ["Balfour", "Shadow Lakes", "Brentwood Blvd"],
    pairs: [],
  },
  {
    slug: "headlight-restoration-pittsburg-ca",
    city: "Pittsburg",
    title: { plain: "Headlight restoration in", accent: "Pittsburg." },
    mustMention: "Delta humidity and salt air, Railroad Ave, Bay Point edge, Los Medanos",
    opening:
      "Pittsburg sits on the Delta, and the humidity and salt air that come off the water are hard on headlight plastic. Once the factory coating wears through, the lens underneath clouds over fast. We do headlight restoration in Pittsburg across the whole city, from Railroad Ave and the streets around Los Medanos out to the Bay Point edge. The job is done where the car is parked, in one visit, and the UV coating that goes on last is what keeps the haze from coming straight back.",
    neighbourhoods: ["Railroad Ave", "Bay Point edge", "Los Medanos"],
    pairs: [],
  },
  {
    slug: "headlight-restoration-oakley-ca",
    city: "Oakley",
    title: { plain: "Headlight restoration in", accent: "Oakley." },
    mustMention: "Delta sun exposure, Main Street, Summer Lake, Laurel Rd",
    opening:
      "In Oakley the problem is mostly sun. Cars here sit outside through long Delta summers, and UV is what breaks down the factory coating on a headlight before anything else does. If your lenses have gone yellow, the bulb is probably fine and the plastic is not. We come to homes and workplaces around Main Street, Summer Lake and Laurel Rd, and headlight restoration in Oakley always finishes with a UV protective coating, because in this much sun a lens without one does not stay clear.",
    neighbourhoods: ["Main Street", "Summer Lake", "Laurel Rd"],
    pairs: [],
  },
];

export function getLocation(slug: string): LocationContent {
  const location = locations.find((entry) => entry.slug === slug);
  if (!location) throw new Error(`No location page with slug ${slug}`);
  return location;
}
