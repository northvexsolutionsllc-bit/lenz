import type { AutoRepair, BreadcrumbList, City, FAQPage, GeoCircle, ImageObject, Service, WithContext } from "schema-dts";
import { cities, serviceCircle, STATE, type CityName } from "@/content/area";
import { getRoute } from "@/content/routes";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

// Structured data, as JSON-LD. CONTENT.md 10
// Everything here is typed against schema.org with schema-dts, so a property that does
// not belong to its type fails the build. "npm run audit:seo" then checks the rendered
// blocks against the schema.org vocabulary itself.

const absolute = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;

/** The business is described once, in the root layout, and referred to by this id elsewhere. */
export const BUSINESS_ID = `${siteUrl}/#business`;

const city = (name: CityName): City => ({
  "@type": "City",
  name,
  containedInPlace: { "@type": "State", name: STATE },
});

const circle: GeoCircle = {
  "@type": "GeoCircle",
  geoMidpoint: { "@type": "GeoCoordinates", latitude: serviceCircle.latitude, longitude: serviceCircle.longitude },
  geoRadius: serviceCircle.radius,
};

// LocalBusiness, as AutoRepair. Four cities and a service circle, and no address,
// because there is no storefront. aggregateRating is added once real reviews exist.
export function businessSchema(): WithContext<AutoRepair> {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": BUSINESS_ID,
    name: site.name,
    description: site.tagline,
    url: siteUrl,
    telephone: site.phone.href.replace("tel:", ""),
    email: site.email.display,
    priceRange: "$$",
    areaServed: [...cities.map((entry) => city(entry.name)), circle],
    sameAs: [site.social.facebook, site.social.instagram],
  };
}

type ServiceInput = {
  path: string;
  name: string;
  /** Defaults to the page's meta description, from docs/SEO.md */
  description?: string;
  /** A location page serves one city. Every other service page serves all four. */
  city?: CityName;
  /** The lowest price, in dollars, where the page states one */
  minPrice?: number;
  /**
   * For an add on: the lowest price of the headlight booking it is added to. The add on
   * has no price of its own yet, so the price is stated of the booking and not of it.
   */
  addedToBookingFrom?: number;
};

const HEADLIGHT_SERVICE = "/headlight-restoration";

const offer = (minPrice: number) =>
  ({
    "@type": "Offer",
    priceSpecification: { "@type": "PriceSpecification", minPrice, priceCurrency: "USD" },
  }) as const;

export function serviceSchema({
  path,
  name,
  description = getSeo(path).description,
  city: only,
  minPrice,
  addedToBookingFrom,
}: ServiceInput): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absolute(path),
    provider: { "@id": BUSINESS_ID },
    areaServed: only ? city(only) : cities.map((entry) => city(entry.name)),
    ...(minPrice === undefined ? {} : { offers: offer(minPrice) }),
    ...(addedToBookingFrom === undefined
      ? {}
      : {
          isRelatedTo: {
            "@type": "Service",
            name: getRoute(HEADLIGHT_SERVICE).name,
            url: absolute(HEADLIGHT_SERVICE),
            offers: offer(addedToBookingFrom),
          },
        }),
  };
}

/** Only questions that have an answer on the page are listed. */
export function faqSchema(items: ReadonlyArray<{ question: string; answer: string | null }>): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((item): item is { question: string; answer: string } => item.answer !== null)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
  };
}

/** The trail from the home page down to this page. */
export function breadcrumbSchema(path: string): WithContext<BreadcrumbList> {
  const trail = [getRoute(path)];
  while (trail[0].path !== "/") trail.unshift(getRoute(trail[0].parent ?? "/"));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((route, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: route.name,
      item: absolute(route.path),
    })),
  };
}

/**
 * The photos of a page, each with its caption. docs/SEO.md section 7 asks for this on the
 * gallery pairs. The caption is the photo's alt text, which says what is in it.
 */
export function imageSchema(images: ReadonlyArray<{ src: string; caption: string }>): WithContext<ImageObject>[] {
  return images.map((image) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `${siteUrl}${image.src}`,
    caption: image.caption,
    creator: { "@id": BUSINESS_ID },
  }));
}
