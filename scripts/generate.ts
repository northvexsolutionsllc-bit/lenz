// Build-time generation. Runs before dev, build and lint (see package.json).
// Everything written here is derived from files in the repository and is not committed.
//
//   src/generated/tokens.ts          the six colour tokens, read from src/styles/tokens.css,
//                                    for the few places that need a colour outside CSS
//   public/noise.png                 the 128x128 tiling grain used by the page overlay
//                                    (MOTION.md 4)
//   public/generated/hero-still.<hash>.png
//                                    one frame of the hero shader, used as the poster
//                                    behind the canvas until the client supplies
//                                    public/media/hero-poster.jpg (DESIGN.md 5)
//   public/generated/hero-haze.webp  the haze layer of the same frame on its own, which the
//                                    hero canvas draws under the live beam
//   public/generated/share.*.jpg     the image a shared link or a text message shows, at
//                                    1200x630: a before and after pair, side by side
//                                    (AUDIT.md 4, item 11, and SEO.md section 8)
//   public/generated/icon.svg        the browser tab icon: a stand-in mark in the token
//                                    colours until the logo is redrawn (AUDIT.md 5)
//   src/generated/build.ts           the date of this build, for the sitemap, and the
//                                    addresses of the poster and the share image

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { REST } from "../src/components/hero/beam-model";
import { FEATURED_PAIR, pairs } from "../src/content/media";
import { indexable, PRODUCTION_HOST, siteUrl } from "../src/lib/site-url";
import { renderBeam } from "./beam-still";
import { encodePng } from "./png";
import { HEIGHT as SHARE_HEIGHT, renderPairShare, WIDTH as SHARE_WIDTH } from "./share";

const root = process.cwd();

const COLOUR_TOKENS = ["night", "pine", "smoke", "beam", "xenon", "oxide"] as const;

function readColourTokens(): Record<(typeof COLOUR_TOKENS)[number], string> {
  const css = fs.readFileSync(path.join(root, "src/styles/tokens.css"), "utf8");
  const entries = COLOUR_TOKENS.map((name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    if (!match) throw new Error(`Token --${name} is missing from src/styles/tokens.css`);
    return [name, match[1].trim()] as const;
  });
  return Object.fromEntries(entries) as Record<(typeof COLOUR_TOKENS)[number], string>;
}

// The haze without the beam: what the hero canvas starts each frame from. Haze is soft,
// so it is rendered small and written as WebP. The canvas scales it to cover.
async function writeHeroHaze() {
  const width = 960;
  const height = 540;
  const pixels = renderBeam({ width, height, mouse: REST, time: 0, progress: 0, grain: false, layer: "haze" });
  const dir = path.join(root, "public/generated");
  fs.mkdirSync(dir, { recursive: true });
  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 3 } })
    .webp({ quality: 82 })
    .toFile(path.join(dir, "hero-haze.webp"));
}

// A file under public/generated whose name carries a hash of its contents. Link previews
// and the image optimiser both keep what they fetched for a long time, under the address
// they fetched it from, so a picture that changed and kept its name would go on being
// shown as it used to be. Older files of the same family are removed. Returns the address.
function writeHashed(family: string, extension: string, contents: Buffer | Uint8Array): string {
  const name = `${family}.${crypto.createHash("sha256").update(contents).digest("hex").slice(0, 8)}.${extension}`;
  const dir = path.join(root, "public/generated");
  fs.mkdirSync(dir, { recursive: true });
  const stale = new RegExp(`^${family}\\b.*\\.${extension}$`);
  for (const file of fs.readdirSync(dir)) {
    if (stale.test(file) && file !== name) fs.rmSync(path.join(dir, file));
  }
  fs.writeFileSync(path.join(dir, name), contents);
  return `/generated/${name}`;
}

// The image for link previews: a before and after pair, side by side. SEO.md section 8
// It is the pair the home page slider leads with, or the first pair that has both of its
// photos. With no pair at all it falls back to the beam at rest, so a clone of the
// repository without the photos still builds. Returns the address and the pair used.
async function writeShareImage(): Promise<{ url: string; pair: string | null }> {
  const media = path.join(root, "public/media");
  const files = (id: string) => ({ before: path.join(media, `before-${id}.jpg`), after: path.join(media, `after-${id}.jpg`) });
  const complete = (id: string) => fs.existsSync(files(id).before) && fs.existsSync(files(id).after);
  const pair = [FEATURED_PAIR, ...pairs.map((entry) => entry.id)].find(complete) ?? null;

  if (pair) {
    const { before, after } = files(pair);
    return { url: writeHashed("share", "jpg", await renderPairShare(before, after, readColourTokens())), pair };
  }

  const pixels = renderBeam({ width: SHARE_WIDTH, height: SHARE_HEIGHT, mouse: [0.5, 0.5], time: 0, progress: 0.35, grain: false });
  const still = await sharp(Buffer.from(pixels), { raw: { width: SHARE_WIDTH, height: SHARE_HEIGHT, channels: 3 } })
    .jpeg({ quality: 84 })
    .toBuffer();
  return { url: writeHashed("share", "jpg", still), pair: null };
}

// A lens seen head on: a beam disc inside a xenon ring, on night. It is a stand-in. The
// real mark comes from the vector redraw of the logo that AUDIT.md 5 asks for.
function writeIcon() {
  const tokens = readColourTokens();
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">',
    `<rect width="32" height="32" fill="${tokens.night}"/>`,
    `<circle cx="16" cy="16" r="11" fill="none" stroke="${tokens.xenon}" stroke-width="1.5"/>`,
    `<circle cx="16" cy="16" r="6" fill="${tokens.beam}"/>`,
    "</svg>",
    "",
  ].join("\n");
  const dir = path.join(root, "public/generated");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "icon.svg"), svg);
}

function writeBuildInfo(heroStill: string, share: { url: string; pair: string | null }) {
  const lines = [
    "// Generated by scripts/generate.ts. Do not edit and do not commit.",
    `export const builtOn = "${new Date().toISOString().slice(0, 10)}";`,
    "",
    "// The hero poster, under a name that changes when the picture does",
    `export const heroStill = "${heroStill}";`,
    "",
    "// The share image, and the before and after pair it shows, if it shows one",
    `export const shareImage = "${share.url}";`,
    `export const sharePair: string | null = ${share.pair ? `"${share.pair}"` : "null"};`,
    "",
  ];
  const dir = path.join(root, "src/generated");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "build.ts"), lines.join("\n"));
}

function writeTokens() {
  const tokens = readColourTokens();
  const lines = [
    "// Generated by scripts/generate.ts from src/styles/tokens.css. Do not edit and do not commit.",
    "export const tokens = {",
    ...Object.entries(tokens).map(([name, value]) => `  ${name}: "${value}",`),
    "} as const;",
    "",
    "export type ColourToken = keyof typeof tokens;",
    "",
  ];
  const dir = path.join(root, "src/generated");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "tokens.ts"), lines.join("\n"));
}

// Uniform 8-bit noise from a fixed seed. Uniform noise has no structure, so the tile
// repeats without a visible seam, and a fixed seed means every build writes the same file.
function writeNoise() {
  const size = 128;
  const pixels = new Uint8Array(size * size);
  let seed = 0x2f6e2b1;
  for (let i = 0; i < pixels.length; i += 1) {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    pixels[i] = ((t ^ (t >>> 14)) >>> 0) & 0xff;
  }
  fs.writeFileSync(path.join(root, "public/noise.png"), encodePng(size, size, 1, pixels));
}

// The frame the canvas itself opens on: hazy, beam at rest, time zero. Rendering the
// same frame as a poster means the canvas fades in over an image it already matches.
//
// Its name carries a hash of its contents, see writeHashed. Returns the address to ask for.
function writeHeroStill(): string {
  const width = 1280;
  const height = 720;
  const pixels = renderBeam({ width, height, mouse: REST, time: 0, progress: 0, grain: false });
  return writeHashed("hero-still", "png", encodePng(width, height, 3, pixels));
}

// Says, in the build log, which host this build believes it is for and whether it will
// let itself be indexed. A staging build that thinks it is production, or the reverse,
// should be visible before it is deployed and not after.
function announceSite() {
  const given = process.env.NEXT_PUBLIC_SITE_URL ? "" : " (NEXT_PUBLIC_SITE_URL is not set)";
  const mode = indexable
    ? "the production host: pages are indexable"
    : `not ${PRODUCTION_HOST}, so this is a staging build: every page is noindex and robots.txt is closed`;
  console.info(`Site address: ${siteUrl}${given}. That is ${mode}.`);
}

async function main() {
  announceSite();
  writeTokens();
  writeNoise();
  writeBuildInfo(writeHeroStill(), await writeShareImage());
  await writeHeroHaze();
  writeIcon();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
