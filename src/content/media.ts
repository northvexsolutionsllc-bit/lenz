// The before and after pairs and the gallery tiles. DESIGN.md 5, CONTENT.md 9
//
// Slot numbers match the filenames in public/media. A slot with no file renders nothing.
// The first five slots are cut from the client's original composites by scripts/media.ts.
//
// TODO(owner): year, make, model and city for every photo (CONTENT.md 11, item 7). Until
// they are supplied, alt text describes only what can be seen. Fill in the fields below
// and the full CONTENT.md patterns are used automatically.

export type ServiceId = "headlight" | "fog" | "dealer";

// Service names from CONTENT.md 3.4
export const SERVICES: Array<{ id: ServiceId; label: string }> = [
  { id: "headlight", label: "Headlight restoration" },
  { id: "fog", label: "Fog light restoration" },
  { id: "dealer", label: "Dealer and auction" },
];

export type Vehicle = {
  /** What can be seen in the photo, used until the details below are known */
  description: string;
  year?: number;
  make?: string;
  model?: string;
  city?: string;
};

const named = (v: Vehicle) => (v.year && v.make && v.model ? `${v.year} ${v.make} ${v.model}` : v.description);
const makeModel = (v: Vehicle) => (v.make && v.model ? `${v.make} ${v.model}` : v.description);
const inCity = (v: Vehicle) => (v.city ? ` in ${v.city}` : "");
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// The alt text patterns from CONTENT.md 9
export const beforeAlt = (v: Vehicle) => `Oxidized yellow headlight on a ${named(v)} before restoration${inCity(v)}`;
export const afterAlt = (v: Vehicle) => `The same ${makeModel(v)} headlight after multi-step restoration and UV coating`;
export const galleryAlt = (v: Vehicle) => `${capitalise(named(v))} headlights restored on site${inCity(v)}`;

export type Pair = {
  /** Two digit slot number: before-NN.jpg and after-NN.jpg */
  id: string;
  /** Null until the client supplies the pair */
  vehicle: Vehicle | null;
};

export const pairs: Pair[] = [
  { id: "01", vehicle: { description: "red vehicle" } },
  { id: "02", vehicle: null },
  { id: "03", vehicle: { description: "dark red vehicle" } },
  { id: "04", vehicle: { description: "maroon vehicle" } },
  { id: "05", vehicle: { description: "gray vehicle" } },
  { id: "06", vehicle: null },
];

// DESIGN.md 5 lists the pair slots as two families of six. A place on a page that is
// waiting for one of them, without yet knowing which, is labelled with its family.
export const PAIR_FAMILY = { before: "before-01.jpg .. -06.jpg", after: "after-01.jpg .. -06.jpg" } as const;

// The pair shown in the home page slider
export const FEATURED_PAIR = "05";

export type GalleryItem = {
  /** Two digit slot number: gallery-NN.jpg */
  id: string;
  service: ServiceId;
  /** Null until the client supplies the photo */
  vehicle: Vehicle | null;
};

// Slots 06 to 12 are empty. Their service types are provisional, so the filter has
// something to show, and are to be set when the photos arrive.
export const gallery: GalleryItem[] = [
  { id: "01", service: "headlight", vehicle: { description: "red vehicle" } },
  { id: "02", service: "headlight", vehicle: { description: "white vehicle" } },
  { id: "03", service: "headlight", vehicle: { description: "dark red vehicle" } },
  { id: "04", service: "headlight", vehicle: { description: "maroon vehicle" } },
  { id: "05", service: "headlight", vehicle: { description: "gray vehicle" } },
  { id: "06", service: "headlight", vehicle: null },
  { id: "07", service: "headlight", vehicle: null },
  { id: "08", service: "headlight", vehicle: null },
  { id: "09", service: "fog", vehicle: null },
  { id: "10", service: "fog", vehicle: null },
  { id: "11", service: "dealer", vehicle: null },
  { id: "12", service: "dealer", vehicle: null },
];
