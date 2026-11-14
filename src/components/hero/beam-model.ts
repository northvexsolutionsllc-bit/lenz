// The hero beam, as numbers.
//
// Every figure here is taken from the fragment shader in MOTION.md 7, which is kept in
// this folder as beam.frag. The shader is the definition of the look. Two things draw
// from it through this file: the 2D canvas that renders the beam in the browser, and
// the build script that renders the poster. Neither repeats a number of its own.

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * d.y /= 0.62: the beam is squashed vertically, so that it reads as a lamp and not a dot.
 *
 * MOTION.md 7 first gave this line as a multiply, under a comment that says squashed. A
 * multiply stretches the beam instead, to 1.6 times as tall as it is wide, and that took
 * it up behind the header and down onto the heading. What is built is what the comment
 * describes. DECISIONS.md 16
 */
export const SQUASH = 0.62;

/** core * 0.90 + halo * 0.45, from the squared distance to the beam's centre */
export const beamAt = (dist2: number) => Math.exp(-dist2 * 26.0) * 0.9 + Math.exp(-dist2 * 5.0) * 0.45;

/** clamp(beam * 1.6 + uProgress, 0.0, 1.0) */
export const clarityAt = (beam: number, progress: number) => clamp(beam * 1.6 + progress, 0, 1);

/** mix(NIGHT, OXIDE, h * 0.30) */
export const HAZE_MIX = 0.3;

/** mix(haze, NIGHT, clarity * 0.55) */
export const CLEAR_MIX = 0.55;

/** mix(XENON, BEAMW, 0.65) */
export const COOL_MIX = 0.65;

/** col += beam * light * 1.25 */
export const LIGHT_GAIN = 1.25;

/** smoothstep(1.25, 0.25, length(uv - 0.5)) */
export const vignetteAt = (length: number) => smoothstep(1.25, 0.25, length);

/** smoothstep(0.25, 0.95, h), applied to the haze noise */
export const hazeAt = (noise: number) => smoothstep(0.25, 0.95, noise);

/** Where the beam rests before the pointer moves: uMouse = vec2(0.5, 0.62). MOTION.md 2 */
export const REST: [number, number] = [0.5, 0.62];
