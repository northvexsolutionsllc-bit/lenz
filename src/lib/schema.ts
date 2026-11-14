import type { AutoRepair, BreadcrumbList, City, FAQPage, GeoCircle, Service, WithContext } from "schema-dts";
import { cities, serviceCircle, STATE, type CityName } from "@/content/area";
import { getRoute } from "@/content/routes";
import { site } from "@/content/site";

// Structured data, as JSON-LD. CONTENT.md 10
// Everything here is typed against schema.org with schema-dts, so a property that does
// not belong to its type fails the build. "npm run audit:seo" then checks the rendered
// blocks against the schema.org vocabulary itself.

const absolute = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/** The business is described once, in the root layout, and referred to by this id elsewhere. */
export const BUSINESS_ID = `${site.url}/#business`;

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
    url: site.url,
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
  description?: string;
  /** A location page serves one city. Every other service page serves all four. */
  city?: CityName;
  /** The lowest price, in dollars, where the page states one */
  minPrice?: number;
};

export function serviceSchema({ path, name, description, city: only, minPrice }: ServiceInput): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    ...(description ? { description } : {}),
    url: absolute(path),
    provider: { "@id": BUSINESS_ID },
    areaServed: only ? city(only) : cities.map((entry) => city(entry.name)),
    ...(minPrice === undefined
      ? {}
      : {
          offers: {
            "@type": "Offer",
            priceSpecification: { "@type": "PriceSpecification", minPrice, priceCurrency: "USD" },
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
