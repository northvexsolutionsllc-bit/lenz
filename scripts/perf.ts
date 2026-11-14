// Performance audit. Measures the home route against the budget in docs/MOTION.md 9,
// on a phone-sized screen with the network and the processor slowed the way Lighthouse
// slows them for its mobile test: slow 4G (1.6 Mbps down, 150ms round trip) and a 4x
// slower CPU.
//
//   npm run audit:perf
//   npm run audit:perf -- --out=docs/qa      also save the report as docs/qa/perf.txt
//
// What it measures itself:
//   LCP and CLS            from the browser's own performance entries
//   INP                    the slowest of a set of real interactions, by event timing, each
//                          made on a page that has come to rest. A tap that lands while
//                          the page is still settling after a scroll is measured as well,
//                          and reported beside it.
//   JavaScript, gzipped    every script the home route loads, compressed and added up
//   Beam frame time        the interval between frames while the hero canvas runs
//
// The two Lighthouse rows are Lighthouse's to measure. Run it against the same server:
//   npx lighthouse http://127.0.0.1:3210/ --only-categories=performance,accessibility
// and add --throttling-method=devtools to apply the throttling for real instead of
// modelling it. The latest figures from both are recorded in docs/HANDOVER.md.
//
// It reads the production build, so run "npm run build" first.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { chromium, type BrowserContext, type CDPSession, type Page } from "@playwright/test";
import { startServer } from "./server";

const PHONE = { width: 412, height: 823 };
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const CPU_SLOWDOWN = 4;

const BUDGET = { lcp: 2500, cls: 0.02, inp: 200, js: 230, frame: 8 };

const lines: string[] = [];
let failures = 0;
const row = (metric: string, budget: string, measured: string, ok: boolean | null) => {
  if (ok === false) failures += 1;
  lines.push(`  ${metric.padEnd(34)} ${budget.padEnd(16)} ${measured.padEnd(28)} ${ok === null ? "" : ok ? "within budget" : "OVER BUDGET"}`);
};

// tsx compiles named functions with a call to a helper, __name, that only exists in
// Node. Functions passed to the page are given a stand-in for it.
const SHIM = "globalThis.__name = (target) => target";

async function phone(context: BrowserContext, throttled: boolean): Promise<{ page: Page; client: CDPSession }> {
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  if (throttled) {
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", SLOW_4G);
    await client.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
  }
  return { page, client };
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = args.find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;
  const baseArg = args.find((arg) => arg.startsWith("--base="))?.slice(7).replace(/\/$/, "") ?? null;
  const server = baseArg ? { base: baseArg, stop: () => undefined } : await startServer();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  try {
    const contextOptions = { viewport: PHONE, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true };

    // ---------------------------------------------------------------- LCP and CLS, three loads
    const lcps: number[] = [];
    const clss: number[] = [];
    let lcpElement = "";
    for (let run = 0; run < 3; run += 1) {
      const context = await browser.newContext(contextOptions);
      const { page } = await phone(context, true);
      await page.addInitScript(() => {
        const seen = { lcp: 0, element: "", cls: 0 };
        (window as unknown as { __seen: typeof seen }).__seen = seen;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { element?: Element }>) {
            seen.lcp = entry.startTime;
            const el = entry.element;
            seen.element = el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} "${(el.textContent ?? "").trim().slice(0, 24)}"` : "";
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) seen.cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(`${server.base}/`, { waitUntil: "load" });
      await page.waitForTimeout(5000);
      const read = () => page.evaluate(() => (window as unknown as { __seen: { lcp: number; element: string; cls: number } }).__seen);
      // LCP is what the visitor first sees, so it is read before anything is scrolled
      const first = await read();
      lcps.push(first.lcp);
      lcpElement = first.element;
      // Then the whole page is scrolled, slowly enough for the pin and the reveals to
      // run, to catch any layout shift further down
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 400) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(800);
      clss.push((await read()).cls);
      await context.close();
    }
    const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    row("LCP, mobile, throttled 4G", "under 2.5s", `${(median(lcps) / 1000).toFixed(2)}s (${lcps.map((v) => (v / 1000).toFixed(2)).join(", ")})`, median(lcps) < BUDGET.lcp);
    lines.push(`      the LCP element is ${lcpElement}`);
    row("CLS", "under 0.02", `${Math.max(...clss).toFixed(3)} at worst, whole page scrolled`, Math.max(...clss) < BUDGET.cls);

    // ---------------------------------------------------------------- INP
    {
      const context = await browser.newContext(contextOptions);
      const { page, client } = await phone(context, false);
      await page.addInitScript(() => {
        const events: Array<{ name: string; duration: number; id: number }> = [];
        (window as unknown as { __events: typeof events }).__events = events;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { interactionId?: number }>) {
            if (entry.interactionId) events.push({ name: entry.name, duration: entry.duration, id: entry.interactionId });
          }
        }).observe({ type: "event", durationThreshold: 16, buffered: true } as PerformanceObserverInit);
      });
      await page.goto(`${server.base}/`, { waitUntil: "load" });
      await page.waitForTimeout(2500);
      await client.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });

      const readEvents = () =>
        page.evaluate(() => (window as unknown as { __events: Array<{ name: string; duration: number; id: number }> }).__events.slice());
      const bringIntoView = (selector: string) =>
        page.evaluate((target) => document.querySelector(target)?.scrollIntoView({ block: "center" }), selector);

      // One interaction is several events. Its latency is its slowest event.
      const latency = async (action: () => Promise<void>) => {
        const before = (await readEvents()).length;
        await action();
        await page.waitForTimeout(900);
        return Math.round(Math.max(0, ...(await readEvents()).slice(before).map((event) => event.duration)));
      };

      // Scroll-driven work carries on for most of a second after a scroll stops. An
      // interaction "at rest" is made after that has finished.
      const REST = 2500;
      const done: string[] = [];
      const times: number[] = [];
      const act = async (name: string, action: () => Promise<void>) => {
        const time = await latency(action);
        times.push(time);
        done.push(`${name} ${time}ms`);
      };

      await act("open the menu", () => page.locator(".menu-toggle").tap());
      await act("close the menu", () => page.locator(".menu-toggle").tap());
      await bringIntoView(".compare");
      await page.waitForTimeout(REST);
      await act("tap the comparison slider", () => page.locator(".compare").first().tap({ position: { x: 90, y: 90 } }));
      await act("arrow key on the slider", async () => {
        await page.locator(".compare").first().focus();
        await page.keyboard.press("ArrowRight");
      });
      await act("tab to the next control", () => page.keyboard.press("Tab"));
      await page.evaluate(() => window.scrollTo(0, 0));
      await bringIntoView(".hero-cue");
      await page.waitForTimeout(REST);
      await act("tap the scroll cue", () => page.locator(".hero-cue").tap());

      const worst = Math.max(0, ...times);
      row("INP", "under 200ms", `${worst}ms, slowest of ${times.length} interactions on a page at rest`, times.length > 0 ? worst < BUDGET.inp : null);
      lines.push(`      at ${CPU_SLOWDOWN}x CPU slowdown: ${done.join(", ")}`);

      // The hard case: the same tap, landing while the page is still settling from a scroll
      const SOON = 300;
      const TRIES = 8;
      const settling: number[] = [];
      for (let attempt = 0; attempt < TRIES; attempt += 1) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(REST);
        await bringIntoView(".hero-cue");
        await page.waitForTimeout(SOON);
        settling.push(await latency(() => page.locator(".hero-cue").tap()));
      }
      const sorted = [...settling].sort((a, b) => a - b);
      const over = settling.filter((time) => time >= BUDGET.inp).length;
      lines.push(
        `      The same tap landing ${SOON}ms after a scroll, while the page is still settling: ${sorted[Math.floor(sorted.length / 2)]}ms at the median, ` +
          `${sorted[sorted.length - 1]}ms at worst, over ${TRIES} tries.${over > 0 ? ` ${over} of them went past the budget.` : ""}`,
      );
      await context.close();
    }

    // ---------------------------------------------------------------- JavaScript
    {
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();
      const scripts: Array<{ url: string; gzip: number }> = [];
      page.on("response", async (response) => {
        if (!/\.js(\?|$)/.test(response.url())) return;
        try {
          scripts.push({ url: response.url(), gzip: zlib.gzipSync(await response.body(), { level: 9 }).length });
        } catch {
          // A response with no body, such as a redirect, is not a script that loaded
        }
      });
      await page.goto(`${server.base}/`, { waitUntil: "load" });
      await page.waitForTimeout(6000);
      const total = scripts.reduce((sum, script) => sum + script.gzip, 0) / 1024;
      row("Total JS, gzipped, home route", "under 230KB", `${total.toFixed(1)}KB in ${scripts.length} files`, total < BUDGET.js);
      await context.close();
    }

    // ---------------------------------------------------------------- beam frame time
    {
      const context = await browser.newContext(contextOptions);
      const { page, client } = await phone(context, false);
      await page.goto(`${server.base}/`, { waitUntil: "load" });
      await page.waitForFunction(() => document.querySelector<HTMLElement>(".hero-canvas")?.dataset.painted === "true", null, { timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.evaluate(SHIM);

      // What the beam costs: the time from the start of a frame to the canvas holding the
      // finished picture. Reading a pixel back makes the browser finish drawing there and
      // then, so the figure includes the drawing itself and not only the calls that ask
      // for it.
      const beamCost = () =>
        page.evaluate(
          () =>
            new Promise<{ cost: number; interval: number }>((resolve) => {
              const canvas = document.querySelector<HTMLCanvasElement>(".beam-canvas");
              const ctx = canvas?.getContext("2d");
              const costs: number[] = [];
              const intervals: number[] = [];
              let last = performance.now();
              const frame = (now: number) => {
                intervals.push(now - last);
                last = now;
                // Queued after the beam's own callback for this frame, so it has drawn
                const started = performance.now();
                ctx?.getImageData(0, 0, 1, 1);
                costs.push(performance.now() - started);
                if (costs.length < 120) requestAnimationFrame(frame);
                else {
                  const mean = (values: number[]) => values.slice(5).reduce((a, c) => a + c, 0) / (values.length - 5);
                  resolve({ cost: mean(costs), interval: mean(intervals) });
                }
              };
              requestAnimationFrame(frame);
            }),
        );

      // And the whole frame: the main thread time the browser accounts for, per frame,
      // with the beam running at the top of the page
      const wholeFrame = async () => {
        const busy = async () => {
          const { metrics } = await client.send("Performance.getMetrics");
          return (metrics.find((metric) => metric.name === "TaskDuration")?.value ?? 0) * 1000;
        };
        const before = await busy();
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              let count = 0;
              const tick = () => {
                count += 1;
                if (count < 120) requestAnimationFrame(tick);
                else resolve();
              };
              requestAnimationFrame(tick);
            }),
        );
        return ((await busy()) - before) / 120;
      };

      await client.send("Performance.enable");
      await client.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
      const beam = await beamCost();
      const frame = await wholeFrame();
      const canvas = await page.evaluate(() => {
        const el = document.querySelector<HTMLCanvasElement>(".beam-canvas");
        return el ? `${el.width}x${el.height}` : "none";
      });
      // The 4x slowdown stands in for the mid-range phone
      row("Beam frame time, mid phone", "under 8ms", `${beam.cost.toFixed(1)}ms to draw a frame`, beam.cost < BUDGET.frame);
      lines.push(`      canvas ${canvas}, at ${CPU_SLOWDOWN}x CPU slowdown. Frames arrive ${beam.interval.toFixed(1)}ms apart.`);
      lines.push(
        `      The whole frame, with everything else on screen, takes ${frame.toFixed(1)}ms of main thread here. This machine has no GPU,`,
      );
      lines.push("      so the browser also composites the page on the processor. A phone does that on its GPU.");
      await context.close();
    }
  } finally {
    await browser.close();
    server.stop();
  }

  const header = `  ${"Metric".padEnd(34)} ${"Budget".padEnd(16)} ${"Measured".padEnd(28)}`;
  const report = ["Home route, phone screen, slow 4G and 4x CPU slowdown", "", header, ...lines, "", failures === 0 ? "PASS: every measured row is within budget." : `FAIL: ${failures} row${failures === 1 ? "" : "s"} over budget.`].join("\n");
  console.info(report);
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "perf.txt"), `${report}\n`);
    console.info(`\nsaved ${path.join(outDir, "perf.txt")}`);
  }
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
