// Copy for the inner pages. docs/CONTENT.md sections 4 to 7, and docs/CONTENT-SEO.md
// sections 12 to 15 for the pages SEO.md adds. Every string is verbatim.
// A `todo` field holds the text that follows TODO(owner) in CONTENT.md, also verbatim.
// Titles and meta descriptions are not here: they are in src/content/seo.ts.
//
// CONTENT.md lists the sections of a page by name without always giving them a display
// heading. Where it gives none, the heading is that section name, in sentence case.

// Owner notes are working notes. They exist in development only: this is false in a
// production build, so every note below becomes null there and its text is not shipped.
const DEV = process.env.NODE_ENV === "development";

// 4. /headlight-restoration
export const headlight = {
  title: { plain: "Headlight restoration,", accent: "done at your car." },
  // CONTENT.md 4 wrote this as the page's description. docs/SEO.md section 4 now gives
  // every page its description, so the sentence leads the page instead. It says what the
  // service is, what it starts at and where, and it puts the page's keyword in its first
  // words, which SEO.md section 5 asks of every page.
  lead: "Mobile headlight restoration from $125 with a 3 year guarantee. We come to you in Antioch, Brentwood, Pittsburg and Oakley. Text photos for a same day quote.",
  // From "Sections, in order": the three that have no heading of their own in CONTENT.md
  sections: {
    oxidation: "What oxidation actually is",
    wontFix: "What it will not fix",
    faq: "FAQ",
  },
  faq: [
    { question: "How long does it take?", answer: "A standard pair takes about an hour.", todo: DEV ? "confirm" : null },
    {
      question: "Do I need to be there?",
      answer:
        "No. We need access to the front of the car and that is it. Most people leave it in the driveway and we text when it is done.",
      todo: null,
    },
    {
      question: "Will it come back yellow?",
      answer:
        "Not inside the guarantee period. Yellowing returns when a restoration skips the UV coating. Ours does not, and if it hazes inside three years we come back.",
      todo: null,
    },
    {
      question: "Can you do it in the rain?",
      answer: "No. Sanding and coating both need a dry lens and a dry surface. We reschedule, at no charge.",
      todo: null,
    },
    {
      question: "Is this better than a kit from the parts store?",
      answer:
        "A kit will take the yellow off for a few months. The difference is the machine polish and the coating. Without those the plastic is left open and oxidizes faster than before.",
      todo: null,
    },
    {
      question: "What if my lens is cracked?",
      answer: "Then we tell you to replace it. A crack is below the surface we work on. See the vehicle guide.",
      todo: null,
    },
    // No answer yet: the owner has to confirm the payment methods
    {
      question: "How do I pay?",
      answer: null,
      todo: DEV ? "likely: cash, Venmo and card via Square, since both appear in the current footer" : null,
    },
  ],
} as const;

// 5. /fog-light-restoration
export const fog = {
  title: { plain: "Fog lights go cloudy too.", accent: null },
  lead: "Fog lights sit lower, take more road spray and more grit, and usually go before the headlights do. They use the same plastic, so they take the same correction.",
  pricing: {
    title: "Added to a headlight booking.",
    todo: DEV ? "the add-on price" : null,
  },
} as const;

// 6. /dealer-and-auction. Different audience: no story, no charm, no first names.
export const dealer = {
  title: { plain: "Reconditioning that", accent: "holds up on the lot." },
  lead: "Yellow headlights take money off a windshield price before anyone opens the door. We come to the lot, work the row, and leave every unit matching.",
  points: ["Per unit pricing", "We work on your lot", "Consistent across the row"],
  volume: {
    title: "Volume pricing",
    todo: DEV ? "blocking for this page. Needed: per unit price at 5, 10 and 20+ units, minimum booking, and typical turnaround for a 20 car row." : null,
  },
  cta: "Request trade pricing",
  // The short form the CTA routes to
  form: ["Dealership", "Contact", "Lot address", "Approximate units per month"],
} as const;

// 7. /vehicle-guide. The trust page.
export const guide = {
  title: { plain: "Some lenses need more.", accent: null },
  lead: "We would rather talk you out of a job than take your money for a lens that was never coming back. Here is how we read a headlight from a photo.",
  // Each tier has its assigned accent colour and one photo slot
  tiers: [
    {
      accent: "xenon",
      title: "Restores well",
      body: "Light to moderate yellowing. Smooth plastic with no pitting, no cracking and no previous coating peeling off. This is most cars between six and twelve years old, and these come back close to new.",
      image: "guide-01.jpg",
    },
    {
      accent: "beam",
      title: "Takes extra work",
      body: "Heavy oxidation, deep scratches, surface pitting, hard coat that is peeling in sheets, light moisture staining, or a previous restoration that was done without a coating. These still restore, they just take longer and the price reflects it.",
      image: "guide-02.jpg",
    },
    {
      accent: "oxide",
      title: "Replace instead",
      body: "Cracks through the lens, broken mounting tabs, heavy internal moisture or condensation, or damage below the surface of the plastic. Polishing the outside of these does nothing. We will tell you and we will not charge you for looking.",
      image: "guide-03.jpg",
    },
  ],
  photosTodo: DEV ? "three photos needed, one per tier." : null,
  // The closing callout, one string in CONTENT.md, shown as its question and its answer
  closing: {
    question: "Not sure which one you have?",
    answer: "Text a photo. It takes us about ten seconds to tell.",
  },
} as const;

export type TierAccent = (typeof guide.tiers)[number]["accent"];

// The price list. docs/CONTENT-SEO.md 12
// Three lines: what each service costs, as far as it is known. The cost page shows all
// three. An add on page shows the first two: the booking it is added to, and itself.
export const priceList = {
  headlight: { name: "Headlight restoration", figure: "From $125 a pair" },
  addOns: { name: "Fog, marker and tail lights", figure: "Added to the same visit, priced per vehicle" },
  dealer: { name: "Dealer and auction", figure: "Per unit pricing" },
} as const;

// 12. /headlight-restoration-cost. docs/CONTENT-SEO.md
// The headings are the questions people type. Each answer is also what the page's
// structured data gives for that question, so `answer` is the whole of it as plain text.
export const cost = {
  eyebrow: "PRICING",
  title: { plain: "What headlight restoration", accent: "costs." },
  lead: "Headlight restoration cost comes down to two things: the size of the lens and how far the oxidation has gone. It starts at $125 for the pair, done at your car, and you get a firm number from photos before anyone books anything.",
  price: {
    question: "What does it cost?",
    body: "The price covers the whole job: sanding, compound, polish and the UV protective coating, with a 3 year guarantee.",
    rows: [priceList.headlight, priceList.addOns, priceList.dealer],
  },
  changes: {
    question: "What changes the price?",
    body: [
      "Final price depends on lens size and how far the oxidation has gone. Larger housings and heavily pitted lenses take longer. Send photos and you get a firm number before anyone books anything.",
      "Heavy oxidation, deep scratches, surface pitting, hard coat that is peeling in sheets, light moisture staining, or a previous restoration that was done without a coating. These still restore, they just take longer and the price reflects it.",
    ],
  },
  lasts: {
    question: "How long does it last?",
    body: "It is guaranteed for three years, in writing. A UV protective coating goes on last, because without it a restored lens yellows again within a year. If a lens we restored starts hazing inside the coverage period, we come back and touch it up at no charge.",
  },
  worth: {
    question: "Is it worth it versus new headlights?",
    body: "If the lens is sound, restoration gives you the same clear light for a fraction of what new assemblies cost. If it is cracked or wet inside, it does not, and we will say so.",
    options: [
      {
        accent: "xenon",
        name: "Restore",
        figure: "From $125 a pair",
        body: "About an hour at your car, with a UV protective coating and a 3 year guarantee.",
      },
      {
        accent: "beam",
        name: "Replace",
        figure: "Several hundred dollars per side",
        body: "Replacement housings on a common SUV run several hundred dollars per side before labor. Restoration is a fraction of that on the same lens.",
      },
      {
        accent: "oxide",
        name: "Parts store kit",
        figure: "About thirty dollars",
        body: "A kit will take the yellow off for a few months. The difference is the machine polish and the coating. Without those the plastic is left open and oxidizes faster than before.",
      },
    ],
    caption: "Skipping stage four is why a thirty dollar kit lasts a season.",
  },
  declined: {
    question: "What we will not take on",
    body: "Cracks through the lens, broken mounting tabs, heavy internal moisture or condensation, or damage below the surface of the plastic. Polishing the outside of these does nothing. We will tell you and we will not charge you for looking.",
    link: { label: "Vehicle guide", href: "/vehicle-guide" },
  },
} as const;

// 13. /tail-light-restoration and 14. /marker-light-restoration. docs/CONTENT-SEO.md
// Two add on pages on the fog light template.
export const tail = {
  name: "Tail light restoration",
  title: { plain: "Tail light restoration,", accent: "in the same visit." },
  lead: "Faded tail lights age a car from behind and cut how well you are seen. Tail light restoration is done on site, in the same visit as your headlights.",
} as const;

export const marker = {
  name: "Marker light restoration",
  title: { plain: "Marker light restoration,", accent: "added to any booking." },
  lead: "Hazy side markers go on the same four stage correction and UV coating as the headlights. Marker light restoration is done at your car, in the same visit.",
} as const;

// 15. Next steps. docs/CONTENT-SEO.md, SEO.md section 5
// Three pages end with a link to the page that follows them.
export const nextSteps = {
  label: "NEXT",
  guideToCost: { text: "What headlight restoration costs", href: "/headlight-restoration-cost" },
  costToGallery: { text: "See the full gallery", href: "/gallery" },
  galleryToContact: { text: "Get your quote", href: "/contact" },
} as const;

