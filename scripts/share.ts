// The image a shared link shows: one before and after pair, side by side, with the seam
// of the comparison slider between them. docs/SEO.md section 8 asks for the pair to be
// on it, because a link to this business with no picture of the work is a blank preview.
//
// It is drawn as the slider is drawn on the site, at twice the size, which is what a
// link preview asks for: 1200 by 630 for a 600 by 315 picture. The seam is the slider's
// 2px beam line and its 44px knob (MOTION.md 6). It carries no lettering, so it needs no
// font.
//
// The photos get the treatment DESIGN.md 5 gives every work photo. On the site that is
// a filter and two overlays in the stylesheet. A link preview has no stylesheet, so the
// same arithmetic is done here on the pixels: the filter stack, the night overlay, then
// oxide over the before photo and xenon over the after photo.

import sharp from "sharp";

export const WIDTH = 1200;
export const HEIGHT = 630;
const HALF = WIDTH / 2;
/** The picture is drawn at twice the size it is shown at */
const SCALE = 2;

// DESIGN.md 5: filter: saturate(0.88) contrast(1.06) brightness(0.96)
const SATURATE = 0.88;
const CONTRAST = 1.06;
const BRIGHTNESS = 0.96;
// DESIGN.md 5: a night overlay at 18 percent, multiplied
const NIGHT_OVERLAY = 0.18;
// DESIGN.md 5: oxide at 14 percent over a before photo, xenon at 8 percent over an after
// photo, both blended as colour
const BEFORE_TINT = 0.14;
const AFTER_TINT = 0.08;
// MOTION.md 6: the seam is a 2px line and a 44px knob holding two 16px chevrons
const LINE = 2 * SCALE;
const KNOB = 44 * SCALE;
const CHEVRON = 16 * SCALE;
// tokens.css: --beam-12, the hairline, is beam at 12 percent
const HAIRLINE = 0.12;

type Rgb = [number, number, number];
type Tokens = { night: string; smoke: string; beam: string; xenon: string; oxide: string };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function fromHex(value: string): Rgb {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value.trim());
  if (!match) throw new Error(`"${value}" is not a six digit hex colour`);
  return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
}

// The three filters, in the order the stylesheet gives them. Each is the matrix the
// Filter Effects specification defines for it, and each result is kept inside 0 to 1.
function filter([r, g, b]: Rgb): Rgb {
  const s = SATURATE;
  const saturated: Rgb = [
    clamp((0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * b),
    clamp((0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * b),
    clamp((0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * b),
  ];
  return saturated.map((channel) => clamp(clamp((channel - 0.5) * CONTRAST + 0.5) * BRIGHTNESS)) as Rgb;
}

// mix-blend-mode: multiply, at an opacity
function multiply(base: Rgb, over: Rgb, opacity: number): Rgb {
  return base.map((channel, index) => channel * (1 - opacity) + channel * over[index] * opacity) as Rgb;
}

// mix-blend-mode: color, at an opacity. The Compositing and Blending specification: the
// hue and saturation of the colour laid over, at the lightness of what is under it.
const lightness = ([r, g, b]: Rgb) => 0.3 * r + 0.59 * g + 0.11 * b;

function withLightness(colour: Rgb, target: number): Rgb {
  const shift = target - lightness(colour);
  const moved = colour.map((channel) => channel + shift) as Rgb;
  const light = lightness(moved);
  const low = Math.min(...moved);
  const high = Math.max(...moved);
  if (low < 0) return moved.map((channel) => light + ((channel - light) * light) / (light - low)) as Rgb;
  if (high > 1) return moved.map((channel) => light + ((channel - light) * (1 - light)) / (high - light)) as Rgb;
  return moved;
}

function tint(base: Rgb, over: Rgb, opacity: number): Rgb {
  const blended = withLightness(over, lightness(base));
  return base.map((channel, index) => channel * (1 - opacity) + blended[index] * opacity) as Rgb;
}

// One photo, cut to fill half the picture, with the treatment applied
async function half(file: string, tone: Rgb, amount: number, night: Rgb): Promise<Buffer> {
  const { data, info } = await sharp(file).resize(HALF, HEIGHT, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let at = 0; at < data.length; at += info.channels) {
    const raw: Rgb = [data[at] / 255, data[at + 1] / 255, data[at + 2] / 255];
    const treated = tint(multiply(filter(raw), night, NIGHT_OVERLAY), tone, amount);
    out[at] = Math.round(clamp(treated[0]) * 255);
    out[at + 1] = Math.round(clamp(treated[1]) * 255);
    out[at + 2] = Math.round(clamp(treated[2]) * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
}

// The slider's seam: the line down the middle and the knob on it. The chevrons are the
// two the slider's knob holds, src/components/ui/Icon.tsx, drawn on its 24 unit grid.
function seam(tokens: Tokens): Buffer {
  const middle = HEIGHT / 2;
  const unit = CHEVRON / 24;
  const chevron = (d: string, left: number) =>
    `<path d="${d}" transform="translate(${left} ${middle - CHEVRON / 2}) scale(${unit})" fill="none" stroke="${tokens.beam}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<rect x="${HALF - LINE / 2}" y="0" width="${LINE}" height="${HEIGHT}" fill="${tokens.beam}"/>`,
    `<circle cx="${HALF}" cy="${middle}" r="${KNOB / 2}" fill="${tokens.smoke}"/>`,
    `<circle cx="${HALF}" cy="${middle}" r="${KNOB / 2 - SCALE / 2}" fill="none" stroke="${tokens.beam}" stroke-opacity="${HAIRLINE}" stroke-width="${SCALE}"/>`,
    chevron("M14.5 6 8.5 12l6 6", HALF - CHEVRON),
    chevron("m9.5 6 6 6-6 6", HALF),
    "</svg>",
  ].join("");
  return Buffer.from(svg);
}

/**
 * The share image, made from the two photos of a pair. Link previews fetch the file as
 * it is, with no image optimiser in between, so it is a JPEG, to keep it small.
 */
export async function renderPairShare(before: string, after: string, tokens: Tokens): Promise<Buffer> {
  const night = fromHex(tokens.night);
  const [left, right] = await Promise.all([
    half(before, fromHex(tokens.oxide), BEFORE_TINT, night),
    half(after, fromHex(tokens.xenon), AFTER_TINT, night),
  ]);
  return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: tokens.night } })
    .composite([
      { input: left, left: 0, top: 0 },
      { input: right, left: HALF, top: 0 },
      { input: seam(tokens), left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
}
