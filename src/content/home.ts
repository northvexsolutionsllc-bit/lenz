// Home page copy. docs/CONTENT.md section 3. Every string is verbatim.
// A `todo` field holds the text that follows TODO(owner) in CONTENT.md, also verbatim. It
// is what the TODO chip beside that item says when it is hovered or read aloud.

// 3.1 Hero
export const hero = {
  eyebrow: "MOBILE SERVICE, EAST CONTRA COSTA",
  title: { plain: "Bring clarity", accent: "back to the road." },
  lead: "Cloudy headlights cut how far you can see at night. We restore the lens you already have, at your driveway, for a fraction of what new assemblies cost.",
  stats: [
    { value: 125, prefix: "$", suffix: "", label: "STARTING PRICE", todo: null },
    { value: 3, prefix: "", suffix: " YR", label: "GUARANTEE", todo: null },
    {
      value: 1,
      prefix: "",
      suffix: " HR",
      label: "TYPICAL VISIT",
      todo: "likely: 45 to 60 minutes for a standard pair",
    },
  ],
  cue: "SEE THE DIFFERENCE",
} as const;

// 3.2 The problem
export const problem = {
  eyebrow: "WHY IT MATTERS",
  title: { plain: "A hazy lens is not", accent: "only a looks problem." },
  body: "Headlight plastic is coated at the factory. Sun and road grit wear that coating off, the plastic underneath oxidizes, and the lens goes yellow and milky. The bulb is still working. The light just cannot get out.",
  points: [
    {
      numeral: "Night",
      title: "You see less of the road",
      body: "A badly oxidized lens scatters light instead of throwing it forward. The part of the road you lose is the part furthest away, which is the part you need.",
      todo: null,
    },
    {
      numeral: "Resale",
      title: "It ages the whole car",
      body: "Yellow headlights read as neglect. On a clean car they are the first thing a buyer or an appraiser notices.",
      todo: null,
    },
    {
      numeral: "Cost",
      title: "New assemblies are expensive",
      body: "Replacement housings on a common SUV run several hundred dollars per side before labor. Restoration is a fraction of that on the same lens.",
      todo: "likely: quote a real replacement price for one common local vehicle so this line has a number in it",
    },
  ],
} as const;

// 3.3 Kinetic line
export const kinetic = ["RESTORE.", "PROTECT.", "REPEAT."] as const;

// 3.4 Services
export const services = {
  eyebrow: "WHAT WE DO",
  title: { plain: "Three services.", accent: "One standard." },
  items: [
    {
      title: "Headlight restoration",
      body: "Multi-step sanding, compound, polish and a UV protective coating, done on the car. This is the job most people book.",
      link: "See the process",
      href: "/headlight-restoration",
    },
    {
      title: "Fog light restoration",
      body: "Added to a headlight booking when the fog lights have gone the same way. Same process, same coating, same guarantee.",
      link: "Add to a quote",
      href: "/fog-light-restoration",
    },
    {
      title: "Dealer and auction",
      body: "Consistent reconditioning before a vehicle goes on the lot or through the lane. We come to you and we work a row, not a car.",
      link: "Trade pricing",
      href: "/dealer-and-auction",
    },
  ],
} as const;

// 3.5 Before and after
export const beforeAfter = {
  eyebrow: "PREVIOUS WORK",
  title: { plain: "Drag it.", accent: "That is the same lens." },
  body: "Every pair here was restored on site, in one visit, with no parts replaced.",
  button: "See the full gallery",
  // CONTENT.md section 9
  todo: "the year, make, model and city for each of the existing five photos.",
} as const;

// 3.6 Process
export const process = {
  eyebrow: "THE CORRECTION",
  title: { plain: "Four stages.", accent: "In that order." },
  stages: [
    {
      title: "Sand",
      body: "Wet sanding through progressive grits takes off the dead factory coating and the oxidized layer under it. This is the step that actually removes the yellow.",
    },
    {
      title: "Compound",
      body: "Machine compounding pulls out the sanding marks and brings the plastic back to a level surface.",
    },
    {
      title: "Polish",
      body: "A finer polish takes the surface from level to optically clear, so light passes straight through instead of scattering.",
    },
    {
      title: "Protect",
      body: "A UV protective coating goes on last. Without it a restored lens yellows again within a year. This is the step cheap jobs skip.",
    },
  ],
  caption: "Skipping stage four is why a thirty dollar kit lasts a season.",
} as const;

// 3.7 Booking
export const booking = {
  eyebrow: "SIMPLE FROM START TO FINISH",
  title: { plain: "Three steps.", accent: "One clear result." },
  steps: [
    {
      title: "Send photos",
      body: "Text clear pictures of both headlights in daylight. That is enough for us to tell you what we are working with.",
    },
    {
      title: "Get your quote",
      body: "A real number, not a range, usually the same day.",
    },
    {
      title: "We come to you",
      body: "Driveway, work parking lot, wherever the car is. You do not have to be there the whole time.",
    },
  ],
} as const;

// 3.8 Pricing
export const pricing = {
  eyebrow: "PRICING",
  price: { value: 125, prefix: "$" },
  title: { plain: "and up, depending on", accent: "the lens." },
  body: "Final price depends on lens size and how far the oxidation has gone. Larger housings and heavily pitted lenses take longer. Send photos and you get a firm number before anyone books anything.",
  inclusions: [
    { title: "Multi-step correction", body: "Sand, compound and polish, not a one-pass wipe", todo: null },
    { title: "UV protective coating", body: "The step that makes it last", todo: null },
    {
      title: "Fog lights can be added",
      body: "Priced per vehicle",
      todo: "likely: a flat add-on such as $40 per pair",
    },
    { title: "3 year guarantee", body: "Free touch-ups inside the coverage period", todo: null },
  ],
  caution: {
    chip: "PLEASE NOTE",
    body: "Results vary with the condition of the plastic. A lens with cracks, internal moisture or damage below the surface may not come back to like new. We will tell you that before we take the job, not after.",
  },
} as const;

// 3.9 Guarantee. The terms themselves are a TODO(owner): see the note.
export const guarantee = {
  eyebrow: "THE GUARANTEE",
  title: { plain: "Three years.", accent: "In writing." },
  body: "If a lens we restored starts hazing inside the coverage period, we come back and touch it up at no charge.",
  todo: "the guarantee has no published terms anywhere. Needed before launch: what is covered, what voids it, whether it transfers with the vehicle, and whether it covers physical damage. likely: covers oxidation and coating failure only, does not cover cracks, impact damage or internal moisture, stays with the original customer.",
} as const;

// 3.10 Story
export const story = {
  eyebrow: "OUR STORY",
  badge: "LOCAL SMALL BUSINESS",
  title: { plain: "Started after school.", accent: "Run like a trade." },
  body: "Lenz Rescue is run by Adain, who started it at seventeen to earn his own money, and who learned the process properly before taking a single paying car. He turns up when he says he will, he tells you honestly when a lens is too far gone, and he does the fourth step every time. When you book Lenz Rescue you are backing a young local tradesman building something real.",
  image: { file: "owner.jpg", alt: "Adain wet sanding a headlight lens at a customer's driveway" },
} as const;

// 3.11 Reviews. Built, and kept out of the page order until real reviews exist.
export const reviews = {
  eyebrow: "WHAT PEOPLE SAY",
  title: { plain: "Ask the", accent: "neighbours." },
  link: "Read all reviews on Google",
  todo: "blocking for launch. The current site has a Google QR code and zero visible reviews. Needed: the Google Business Profile URL, the current star rating and review count, and at least three full review texts with first names and city.",
  // Fill these in to switch the section from its placeholder state to the real thing
  profileUrl: null as string | null,
  rating: null as number | null,
  count: null as number | null,
  items: [] as Array<{ text: string; name: string; city: string }>,
};

// 3.12 Final CTA
export const finalCta = {
  title: { plain: "Let's bring your headlights", accent: "back to life." },
  body: "Text photos of both headlights and you will have a price back today.",
  // The four cities with a location page link to it. The last two have none.
  areas: [
    { label: "Antioch", href: "/headlight-restoration-antioch-ca" },
    { label: "Brentwood", href: "/headlight-restoration-brentwood-ca" },
    { label: "Pittsburg", href: "/headlight-restoration-pittsburg-ca" },
    { label: "Oakley", href: "/headlight-restoration-oakley-ca" },
    { label: "Discovery Bay", href: null },
    { label: "Bay Point", href: null },
  ],
  todo: "confirm the last two are actually served",
} as const;
