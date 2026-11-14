// QA screenshots.
//
//   npm run shots                        every route, and the styleguide
//   npm run shots -- /styleguide
//   npm run shots -- / /gallery --full
//
// For every route it captures 1440x900 and 390x844, plus a prefers-reduced-motion
// version of each, and saves them to docs/qa/<route>/.
//
// Options
//   --full          also save the whole page for each variant, as a run of numbered slices
//   --wait=<ms>     settle time after load before the capture (default 2600)
//   --base=<url>    capture from a server that is already running
//   --out=<dir>     write somewhere other than docs/qa
//
// Without --base it starts "next start" on its own port, so run "npm run build" first.
// Set CHROMIUM_PATH to use a Chromium binary other than the one Playwright installed.

import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "@playwright/test";
import { routes } from "../src/content/routes";
import { startServer } from "./server";

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900, scale: 1, mobile: false },
  { name: "390x844", width: 390, height: 844, scale: 2, mobile: true },
] as const;

// Height of one full-page slice, in device pixels
const FULL_SLICE = 3600;

const MOTION = [
  { suffix: "", reduced: false },
  { suffix: "-reduced", reduced: true },
] as const;

type Options = {
  routes: string[];
  full: boolean;
  wait: number;
  base: string | null;
  out: string;
};

function parseArgs(argv: string[]): Options {
  const options: Options = { routes: [], full: false, wait: 2600, base: null, out: path.join("docs", "qa") };
  for (const arg of argv) {
    if (arg === "--full") options.full = true;
    else if (arg.startsWith("--wait=")) options.wait = Number(arg.slice(7));
    else if (arg.startsWith("--base=")) options.base = arg.slice(7).replace(/\/$/, "");
    else if (arg.startsWith("--out=")) options.out = arg.slice(6);
    else if (arg.startsWith("/")) options.routes.push(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  // No route named: the whole site, in sitemap order, then the styleguide
  if (options.routes.length === 0) options.routes = [...routes.map((route) => route.path), "/styleguide"];
  return options;
}

function slug(route: string): string {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return clean === "" ? "home" : clean.replace(/\//g, "__");
}

async function capture(browser: Browser, base: string, route: string, options: Options) {
  const dir = path.join(options.out, slug(route));
  fs.mkdirSync(dir, { recursive: true });

  for (const viewport of VIEWPORTS) {
    for (const motion of MOTION) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.scale,
        isMobile: viewport.mobile,
        hasTouch: viewport.mobile,
        reducedMotion: motion.reduced ? "reduce" : "no-preference",
      });
      const page = await context.newPage();
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await page.waitForTimeout(options.wait);

      const file = path.join(dir, `${viewport.name}${motion.suffix}.jpg`);
      await page.screenshot({ path: file, type: "jpeg", quality: 90 });
      console.info(`saved ${file}`);

      if (options.full) {
        // Walk the page once so scroll-triggered content has entered, then return to the top
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += viewport.height) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(350);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(900);

        // The page is saved as a run of slices. A single image of a long page runs past the
        // largest surface headless Chromium can draw, and the capture starts repeating.
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const slice = FULL_SLICE / viewport.scale;
        for (let top = 0, index = 1; top < total; top += slice, index += 1) {
          const part = String(index).padStart(2, "0");
          const fullFile = path.join(dir, `${viewport.name}${motion.suffix}-full-${part}.jpg`);
          await page.screenshot({
            path: fullFile,
            type: "jpeg",
            quality: 85,
            fullPage: true,
            clip: { x: 0, y: top, width: viewport.width, height: Math.min(slice, total - top) },
          });
          console.info(`saved ${fullFile}`);
        }
      }

      await context.close();
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const server = options.base ? { base: options.base, stop: () => undefined } : await startServer();

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  try {
    for (const route of options.routes) {
      await capture(browser, server.base, route, options);
    }
  } finally {
    await browser.close();
    server.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
