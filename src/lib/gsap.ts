// GSAP equivalents of the motion tokens in src/styles/tokens.css. MOTION.md 1
// Defined once here and imported everywhere. Nothing else may name an ease or a duration.

export const EASE = {
  beam: "expo.out",
  swap: "power2.inOut",
  snap: "back.out(1.7)",
} as const;

export const DUR = { d1: 0.16, d2: 0.32, d3: 0.64, d4: 1.2 } as const;
