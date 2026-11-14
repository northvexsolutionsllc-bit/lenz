// The service area, for structured data. CONTENT.md 10
//
// The four cities are the ones CONTENT.md names. Their centre points are public
// geographic data, to four decimal places.
//
// TODO(owner): the service circle below is worked out from those four points, because
// nobody has stated a service radius. It is centred on their midpoint and reaches the
// furthest city centre plus a margin, so that it takes in the cities themselves and not
// only their centre points. Confirm the real radius, then set it here.

export const STATE = "California";

export const cities = [
  { name: "Antioch", latitude: 38.0049, longitude: -121.8058 },
  { name: "Brentwood", latitude: 37.9319, longitude: -121.6958 },
  { name: "Pittsburg", latitude: 38.028, longitude: -121.8847 },
  { name: "Oakley", latitude: 37.9974, longitude: -121.7125 },
] as const;

export type CityName = (typeof cities)[number]["name"];

// Added to the distance of the furthest city centre, in metres
const MARGIN = 5000;
const EARTH_RADIUS = 6371000;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

function distance(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;

const midpoint = {
  latitude: round(cities.reduce((sum, city) => sum + city.latitude, 0) / cities.length, 4),
  longitude: round(cities.reduce((sum, city) => sum + city.longitude, 0) / cities.length, 4),
};

const furthest = Math.max(...cities.map((city) => distance(midpoint, city)));

/** The service circle: its centre, and its radius in metres, rounded up to a whole kilometre. */
export const serviceCircle = {
  ...midpoint,
  radius: Math.ceil((furthest + MARGIN) / 1000) * 1000,
};
