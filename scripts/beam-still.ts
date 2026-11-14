// A CPU port of src/components/hero/beam.frag, used to render still frames of the hero
// beam at build time. It follows the GLSL line for line. The four colours are not
// repeated here: they are read from the constants in the shader file itself. The beam's
// own figures come from beam-model.ts, the same file the browser's canvas draws from, so
// the poster and the live beam cannot drift apart.

import fs from "node:fs";
import path from "node:path";
import {
  beamAt,
  clarityAt,
  CLEAR_MIX,
  COOL_MIX,
  HAZE_MIX,
  hazeAt,
  LIGHT_GAIN,
  SQUASH,
  vignetteAt,
} from "../src/components/hero/beam-model";

type Vec3 = [number, number, number];

export type BeamFrame = {
  width: number;
  height: number;
  /** uMouse: 0 to 1, origin bottom left */
  mouse: [number, number];
  /** uTime, in seconds */
  time: number;
  /** uProgress: 0 hazy to 1 clear */
  progress: number;
  /** Include the per-pixel grain term. Left out for the poster so it compresses well. */
  grain: boolean;
  /**
   * "haze" renders the haze alone: no beam, no clearing and no vignette. It is the
   * layer the browser's canvas starts from. Defaults to the whole frame.
   */
  layer?: "frame" | "haze";
};

function readShaderColours(): Record<"NIGHT" | "OXIDE" | "XENON" | "BEAMW", Vec3> {
  const source = fs.readFileSync(path.join(process.cwd(), "src/components/hero/beam.frag"), "utf8");
  const read = (name: string): Vec3 => {
    const match = source.match(new RegExp(`const vec3 ${name}\\s*=\\s*vec3\\(([^)]+)\\)`));
    if (!match) throw new Error(`Colour constant ${name} not found in beam.frag`);
    const [r, g, b] = match[1].split(",").map(Number);
    return [r, g, b];
  };
  return { NIGHT: read("NIGHT"), OXIDE: read("OXIDE"), XENON: read("XENON"), BEAMW: read("BEAMW") };
}

const fract = (x: number) => x - Math.floor(x);
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const hash = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

function noise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return mix(mix(hash(ix, iy), hash(ix + 1, iy), ux), mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), ux), uy);
}

function fbm(x: number, y: number): number {
  let v = 0, a = 0.5;
  for (let i = 0; i < 5; i += 1) {
    v += a * noise(x, y);
    x *= 2.03;
    y *= 2.03;
    a *= 0.5;
  }
  return v;
}

/** Renders one frame. Returns 8-bit RGB rows, top to bottom. */
export function renderBeam(frame: BeamFrame): Uint8Array {
  const { width, height, mouse, time, progress, grain, layer = "frame" } = frame;
  const { NIGHT, OXIDE, XENON, BEAMW } = readShaderColours();
  const coolWhite = mix3(XENON, BEAMW, COOL_MIX);
  const hazeOnly = layer === "haze";
  const aspect = width / height;
  const out = new Uint8Array(width * height * 3);

  // A fixed-seed generator for the rounding dither, so every build writes the same file
  let seed = 0x9e3779b9;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let row = 0; row < height; row += 1) {
    // gl_FragCoord has its origin at the bottom left and samples pixel centres
    const fy = height - 1 - row + 0.5;
    for (let column = 0; column < width; column += 1) {
      const fx = column + 0.5;
      const uvx = fx / width, uvy = fy / height;
      const px = uvx * aspect, py = uvy;
      const mx = mouse[0] * aspect, my = mouse[1];

      // drifting haze, the oxidised lens
      const h = hazeAt(fbm(px * 2.4 + time * 0.02, py * 2.4 + time * 0.013));

      // the beam
      const dx = px - mx;
      const dy = (py - my) / SQUASH;
      const beam = hazeOnly ? 0 : beamAt(dx * dx + dy * dy);

      // clarity burns off inside the beam and as the hero scrolls away
      const clarity = hazeOnly ? 0 : clarityAt(beam, progress);

      const haze = mix3(NIGHT, OXIDE, h * HAZE_MIX);
      const col = mix3(haze, NIGHT, clarity * CLEAR_MIX);
      const light = mix3(OXIDE, coolWhite, clarity);

      const vignette = hazeOnly ? 1 : vignetteAt(Math.hypot(uvx - 0.5, uvy - 0.5));
      const grainTerm = grain ? (hash(fx + time, fy + time) - 0.5) * 0.035 : 0;

      const at = (row * width + column) * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        const value = (col[channel] + beam * light[channel] * LIGHT_GAIN) * vignette + grainTerm;
        // Round with a little noise so smooth dark gradients do not band at 8 bits
        out[at + channel] = clamp(Math.floor(clamp(value, 0, 1) * 255 + random()), 0, 255);
      }
    }
  }

  return out;
}
