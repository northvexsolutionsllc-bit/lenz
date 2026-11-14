// Copy for the inner pages. docs/CONTENT.md sections 4 to 7. Every string is verbatim.
// A `todo` field holds the text that follows TODO(owner) in CONTENT.md, also verbatim.
//
// CONTENT.md lists the sections of a page by name without always giving them a display
// heading. Where it gives none, the heading is that section name, in sentence case.

// 4. /headlight-restoration
export const headlight = {
  title: { plain: "Headlight restoration,", accent: "done at your car." },
  meta: {
    title: "Headlight Restoration in Antioch and Brentwood CA | Lenz Rescue",
    description:
      "Mobile headlight restoration from $125 with a 3 year guarantee. We come to you in Antioch, Brentwood, Pittsburg and Oakley. Text photos for a same day quote.",
  },
  // From "Sections, in order": the three that have no heading of their own in CONTENT.md
  sections: {
    oxidation: "What oxidation actually is",
    wontFix: "What it will not fix",
    faq: "FAQ",
  },
  faq: [
    { question: "How long does it take?", answer: "A standard pair takes about an hour.", todo: "confirm" },
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
      todo: "likely: cash, Venmo and card via Square, since both appear in the current footer",
    },
  ],
} as const;

// 5. /fog-light-restoration
export const fog = {
  title: { plain: "Fog lights go cloudy too.", accent: null },
  meta: {
    title: "Fog Light Restoration | Lenz Rescue, East Contra Costa",
    description:
      "Cloudy fog lights restored on site, added to any headlight booking. Same multi-step process, same UV coating, same 3 year guarantee.",
  },
  lead: "Fog lights sit lower, take more road spray and more grit, and usually go before the headlights do. They use the same plastic, so they take the same correction.",
  pricing: {
    title: "Added to a headlight booking.",
    todo: "the add-on price",
  },
} as const;

// 6. /dealer-and-auction. Different audience: no story, no charm, no first names.
export const dealer = {
  title: { plain: "Reconditioning that", accent: "holds up on the lot." },
  meta: {
    title: "Dealer and Auction Headlight Reconditioning | Lenz Rescue",
    description:
      "Mobile headlight reconditioning for dealers and auction lots in East Contra Costa. Per unit pricing, we work your row on site, consistent finish across the inventory.",
  },
  lead: "Yellow headlights take money off a windshield price before anyone opens the door. We come to the lot, work the row, and leave every unit matching.",
  points: ["Per unit pricing", "We work on your lot", "Consistent across the row"],
  volume: {
    title: "Volume pricing",
    todo: "blocking for this page. Needed: per unit price at 5, 10 and 20+ units, minimum booking, and typical turnaround for a 20 car row.",
  },
  cta: "Request trade pricing",
  // The short form the CTA routes to
  form: ["Dealership", "Contact", "Lot address", "Approximate units per month"],
} as const;

// 7. /vehicle-guide. The trust page.
export const guide = {
  title: { plain: "Some lenses need more.", accent: null },
  meta: {
    title: "Which Headlights Can Be Restored | Lenz Rescue Vehicle Guide",
    description:
      "An honest guide to what restores well, what takes extra work, and what needs replacing. Plastic type, age, prior repairs and damage all change the result.",
  },
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
  photosTodo: "three photos needed, one per tier.",
  // The closing callout, one string in CONTENT.md, shown as its question and its answer
  closing: {
    question: "Not sure which one you have?",
    answer: "Text a photo. It takes us about ten seconds to tell.",
  },
} as const;

export type TierAccent = (typeof guide.tiers)[number]["accent"];
