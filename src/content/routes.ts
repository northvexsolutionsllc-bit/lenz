import { locations } from "./locations";

// Every indexable route, in the order of the page map in SEO.md section 3.
// The sitemap, the breadcrumbs and the audits all read this one list.

export type SiteRoute = {
  path: string;
  /** How the page is named in a breadcrumb trail */
  name: string;
  /** The path of the page above it, if that is not the home page */
  parent?: string;
};

export const routes: SiteRoute[] = [
  { path: "/", name: "Home" },
  { path: "/headlight-restoration", name: "Headlight restoration" },
  { path: "/fog-light-restoration", name: "Fog light restoration" },
  { path: "/tail-light-restoration", name: "Tail light restoration" },
  { path: "/marker-light-restoration", name: "Marker light restoration" },
  { path: "/headlight-restoration-cost", name: "Headlight restoration cost", parent: "/headlight-restoration" },
  { path: "/vehicle-guide", name: "Vehicle guide" },
  { path: "/dealer-and-auction", name: "Dealer and auction" },
  { path: "/gallery", name: "Gallery" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  ...locations.map((location) => ({
    path: `/${location.slug}`,
    name: `${location.title.plain} ${location.city}`,
    parent: "/headlight-restoration",
  })),
];

export function getRoute(path: string): SiteRoute {
  const route = routes.find((entry) => entry.path === path);
  if (!route) throw new Error(`No route registered for ${path}`);
  return route;
}
