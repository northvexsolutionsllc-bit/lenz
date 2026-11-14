// Global strings. docs/CONTENT.md section 2. Every string is verbatim.

const SMS_BODY = "Hi, I'd like a quote. Here are photos of both headlights.";

export const site = {
  // The production origin, from docs/AUDIT.md section 1
  url: "https://lenzrescue.com",
  name: "Lenz Rescue",
  wordmark: "LENZ RESCUE",
  tagline: "Mobile headlight restoration",
  cta: {
    primary: "Text a photo for a quote",
    secondary: "Call 925-812-5524",
  },
  phone: {
    display: "925-812-5524",
    href: "tel:+19258125524",
  },
  sms: {
    // The "?&body=" form is the one that opens a prefilled message on both iOS and Android
    href: `sms:+19258125524?&body=${encodeURIComponent(SMS_BODY)}`,
  },
  email: {
    display: "LenzRescue@gmail.com",
    href: "mailto:LenzRescue@gmail.com",
  },
  serviceAreaLine:
    "Serving Antioch, Brentwood, Pittsburg, Oakley and the surrounding East County area",
  // The hours themselves are a TODO(owner). This is the note that goes with it.
  hours: { todo: "likely: after school weekdays, with full availability Saturday and Sunday" },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61593077793567",
    instagram: "https://www.instagram.com/lenz_rescue2026/",
  },
  // Header nav, in order. "Services" opens the primary service page.
  nav: [
    { label: "Services", href: "/headlight-restoration" },
    { label: "Gallery", href: "/gallery" },
    { label: "Vehicle guide", href: "/vehicle-guide" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  // The four cities with their own location page
  areas: [
    { label: "Antioch", href: "/headlight-restoration-antioch-ca" },
    { label: "Brentwood", href: "/headlight-restoration-brentwood-ca" },
    { label: "Pittsburg", href: "/headlight-restoration-pittsburg-ca" },
    { label: "Oakley", href: "/headlight-restoration-oakley-ca" },
  ],
} as const;
