// Home page copy. docs/CONTENT.md section 3. Every string is verbatim.

export const hero = {
  eyebrow: "MOBILE SERVICE, EAST CONTRA COSTA",
  title: { plain: "Bring clarity", accent: "back to the road." },
  lead: "Cloudy headlights cut how far you can see at night. We restore the lens you already have, at your driveway, for a fraction of what new assemblies cost.",
  stats: [
    { value: 125, prefix: "$", suffix: "", label: "STARTING PRICE" },
    { value: 3, prefix: "", suffix: " YR", label: "GUARANTEE" },
    { value: 1, prefix: "", suffix: " HR", label: "TYPICAL VISIT" },
  ],
  cue: "SEE THE DIFFERENCE",
} as const;

// 3.5 Before and after
export const beforeAfter = {
  eyebrow: "PREVIOUS WORK",
  title: { plain: "Drag it.", accent: "That is the same lens." },
  body: "Every pair here was restored on site, in one visit, with no parts replaced.",
  button: "See the full gallery",
} as const;
