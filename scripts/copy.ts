// Copy audit. Reads back every user-facing string a route renders and checks it against
// docs/CONTENT.md, in both directions:
//
//   1. Every string CONTENT.md gives for the route is on the page, word for word.
//   2. Every string on the page comes from CONTENT.md word for word. The exceptions are
//      the interface labels listed in INTERFACE below, each with where it comes from.
//
//   npm run audit:copy -- /
//   npm run audit:copy -- / /gallery --print      also list every rendered string
//   npm run audit:copy -- / --out=docs/qa         also save the report beside the captures
//
// The page is read in a real browser from the production build, with script on, so run
// "npm run build" first. Exit code 1 if a string is missing or cannot be accounted for.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startServer } from "./server";

const CONTENT_FILE = path.join("docs", "CONTENT.md");

// ---------------------------------------------------------------------------------------
// Which part of CONTENT.md each route renders

type RouteSpec = {
  /** CONTENT.md headings whose strings must all be on the page, by number */
  sections: string[];
  /** Headings whose strings must not be on the page, with the reason */
  absent?: Array<{ section: string; reason: string }>;
};

const ROUTES: Record<string, RouteSpec> = {
  "/": {
    sections: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.12"],
    absent: [
      { section: "3.11", reason: "kept out of the page order until real reviews exist, DECISIONS.md 11" },
    ],
  },
};

// CONTENT.md section 2. These are not in code quotes there, so they are listed here and
// checked against the document before use. They are on every page: header and footer.
const GLOBAL = [
  "LENZ RESCUE",
  "Mobile headlight restoration",
  "Text a photo for a quote",
  "925-812-5524",
  "LenzRescue@gmail.com",
  "Serving Antioch, Brentwood, Pittsburg, Oakley and the surrounding East County area",
  "Services",
  "Gallery",
  "Vehicle guide",
  "About",
  "Contact",
];

// Service names used as links and filters. They are CONTENT.md 3.4 strings.
const LINKS = { tel: "tel:+19258125524", smsPrefix: "sms:+19258125524?&body=" };

// Strings in code quotes in CONTENT.md that are not copy: tokens, routes, files, markup
const NOT_COPY = [/^--/, /^\//, /^TODO\(owner\)$/, /^likely:$/, /^tel:/, /^sms:/, /^alt=/, /\.(jpg|svg)$/, /^@type/];
const COMPONENT_NAMES = new Set(["ReviewPlaceholder", "Counter", "LocalBusiness", "Service", "FAQPage", "BreadcrumbList", "GeoCircle", "City"]);

// Interface labels. None of these is marketing copy. Each names the document that gives
// it, or says that the build supplied it because no document does.
const INTERFACE: Array<{ match: string | RegExp; source: string }> = [
  { match: "TODO", source: "PROMPTS.md, Prompt 4: the owner chips" },
  { match: "BEFORE", source: "MOTION.md 6" },
  { match: "AFTER", source: "MOTION.md 6" },
  { match: "Reveal the restored headlight", source: "MOTION.md 6" },
  { match: /^(hero-poster|owner|before-\d\d|after-\d\d|gallery-\d\d|process-\d\d)\.jpg$/, source: "DESIGN.md 5, slot filename" },
  { match: /^(16\/9|4\/3|3\/2|4\/5)$/, source: "DESIGN.md 5, slot ratio" },
  { match: /^\d+ percent before, \d+ percent after$/, source: "supplied in build: slider value for screen readers" },
  { match: "Skip to content", source: "supplied in build: skip link" },
  { match: "Open menu", source: "supplied in build: menu button" },
  { match: "Close menu", source: "supplied in build: menu button" },
  { match: "Primary", source: "supplied in build: name of the header navigation landmark" },
  { match: "Menu", source: "supplied in build: name of the menu navigation landmark" },
  { match: "Footer", source: "supplied in build: name of the footer navigation landmark" },
  { match: "Lenz Rescue on Facebook", source: "supplied in build: icon link name" },
  { match: "Lenz Rescue on Instagram", source: "supplied in build: icon link name" },
  { match: "All", source: "supplied in build: gallery filter" },
  { match: "Filter the gallery by service", source: "supplied in build: name of the filter group" },
  {
    match: "Cross-section of a headlight: the reflector, the bulb and the lens, with the layers the four stages work on",
    source: "supplied in build: name of the process figure",
  },
];

// ---------------------------------------------------------------------------------------
// CONTENT.md

const normalise = (text: string) => text.replace(/\s+/g, " ").trim();

type Quoted = { text: string; line: number; section: string };

function readContent() {
  const raw = fs.readFileSync(CONTENT_FILE, "utf8");
  const lines = raw.split("\n");
  const quoted: Quoted[] = [];
  const titles = new Map<string, string>();
  let section = "";

  lines.forEach((line, index) => {
    const heading = /^#{2,3} (\d+(?:\.\d+)?)\.? (.+)$/.exec(line);
    if (heading) {
      section = heading[1];
      titles.set(section, heading[2].replace(/`/g, ""));
      return;
    }
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      quoted.push({ text: normalise(match[1]), line: index + 1, section });
    }
  });

  // Everything the document says, for the owner notes, which are prose and not quoted
  const prose = normalise(raw.replace(/[`*]/g, ""));
  return { quoted, titles, prose };
}

const isCopy = (text: string) => !NOT_COPY.some((pattern) => pattern.test(text)) && !COMPONENT_NAMES.has(text);

// A CONTENT.md 9 pattern such as "... on a [year] [make] [model] before restoration in
// [city]" as a test. The vehicle and the city are still TODO(owner), so the city is
// optional and the vehicle is any description.
function patternTest(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|\\]/g, "\\$&")
    .replace(/ in \[city\]/g, "( in .+)?")
    .replace(/\[[^\]]+\]( \[[^\]]+\])*/g, ".+");
  return new RegExp(`^${escaped}$`);
}

// ---------------------------------------------------------------------------------------
// The page

type Rendered = { text: string; kind: string; where: string; chip: boolean; context: string[] };

async function readPage(base: string, route: string) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(2600);

    // Walk the page once, so everything that waits to be scrolled into view has arrived:
    // a Counter sits at zero until then
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(1600);

    // tsx compiles named functions with a call to a helper, __name, that only exists in
    // Node. The function below runs in the page, so the page is given a stand-in.
    await page.evaluate("globalThis.__name = (target) => target");

    return await page.evaluate(() => {
      const squash = (text: string) => text.replace(/\s+/g, " ").trim();
      const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
      const ATTRIBUTES = ["alt", "aria-label", "aria-valuetext", "title", "placeholder"];
      const strings: Array<{ text: string; kind: string; where: string; chip: boolean; context: string[] }> = [];

      const where = (el: Element) => {
        const parts: string[] = [];
        for (let node: Element | null = el; node && node !== document.body && parts.length < 3; node = node.parentElement) {
          const first = node.classList[0];
          parts.unshift(node.tagName.toLowerCase() + (node.id ? `#${node.id}` : first ? `.${first}` : ""));
        }
        return parts.join(" > ");
      };

      const context = (el: Element) => {
        const out: string[] = [];
        for (let node: Element | null = el, depth = 0; node && node !== document.body && depth < 3; node = node.parentElement, depth += 1) {
          const text = squash(node.textContent ?? "");
          if (text.length <= 400) out.push(text);
        }
        return out;
      };

      const visit = (el: Element) => {
        if (SKIP.has(el.tagName)) return;
        const chip = el.closest(".todo-chip") !== null;

        // Text that sits directly in this element, split wherever a child element interrupts it
        let run = "";
        const flush = () => {
          const text = squash(run);
          if (text) strings.push({ text, kind: "text", where: where(el), chip, context: context(el) });
          run = "";
        };
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) run += node.nodeValue ?? "";
          else if (node.nodeType === Node.ELEMENT_NODE) flush();
        }
        flush();

        for (const name of ATTRIBUTES) {
          const value = el.getAttribute(name);
          if (value && squash(value)) strings.push({ text: squash(value), kind: name, where: where(el), chip, context: [] });
        }
        for (const child of el.children) visit(child);
      };
      visit(document.body);

      const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
      const description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
      return { strings, hrefs, title: document.title, description };
    });
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------------------
// The audit

type Verdict = { status: "content" | "owner note" | "pattern" | "interface" | "UNKNOWN"; note: string };

function audit(route: string, spec: RouteSpec, page: Awaited<ReturnType<typeof readPage>>, content: ReturnType<typeof readContent>) {
  const out: string[] = [];
  let failures = 0;

  const approved = new Map<string, Quoted>();
  for (const item of content.quoted) if (isCopy(item.text) && !approved.has(item.text)) approved.set(item.text, item);
  for (const text of GLOBAL) {
    if (!content.prose.includes(text)) throw new Error(`"${text}" is listed as a global string but is not in ${CONTENT_FILE}.`);
    if (!approved.has(text)) approved.set(text, { text, line: 0, section: "2" });
  }
  const patterns = content.quoted.filter((item) => item.section === "9" && /\[[^\]]+\]/.test(item.text));

  const rendered = new Set(page.strings.map((item) => item.text));
  const fullText = normalise(page.strings.filter((item) => item.kind === "text").flatMap((item) => [item.text, ...item.context]).join(" \n "));
  const onPage = (text: string) => rendered.has(text) || fullText.includes(text);

  // Can the string be read as approved strings one after another?
  const sequence = (text: string): boolean => {
    if (text === "") return true;
    for (const candidate of approved.keys()) {
      if (text === candidate) return true;
      if (text.startsWith(`${candidate} `) && sequence(text.slice(candidate.length + 1))) return true;
    }
    return false;
  };

  const classify = (item: Rendered): Verdict => {
    const known = approved.get(item.text);
    if (known) return { status: "content", note: known.line ? `CONTENT.md line ${known.line}` : "CONTENT.md section 2" };
    if (item.chip && content.prose.includes(item.text)) return { status: "owner note", note: "the TODO(owner) text in CONTENT.md, verbatim" };
    const whole = item.context.find((text) => approved.has(text));
    if (whole) return { status: "content", note: `part of "${whole}", CONTENT.md line ${approved.get(whole)!.line}` };
    const label = INTERFACE.find((entry) => (typeof entry.match === "string" ? entry.match === item.text : entry.match.test(item.text)));
    if (label) return { status: "interface", note: label.source };
    const pattern = patterns.find((entry) =>
      item.text.split(/(?<=[a-z])\. (?=[A-Z])/).every((piece) => patternTest(entry.text).test(piece.replace(/\.$/, ""))) ||
      patternTest(entry.text).test(item.text),
    );
    if (pattern) return { status: "pattern", note: `CONTENT.md line ${pattern.line}, vehicle details still TODO(owner)` };
    const pieces = item.text.split(/(?<=[a-z])\. (?=[A-Z])/).map((piece) => piece.replace(/\.$/, ""));
    if (pieces.length > 1 && pieces.every((piece) => patterns.some((entry) => patternTest(entry.text).test(piece)))) {
      return { status: "pattern", note: "CONTENT.md section 9 patterns, vehicle details still TODO(owner)" };
    }
    if (sequence(item.text)) return { status: "content", note: "CONTENT.md strings in sequence" };
    return { status: "UNKNOWN", note: "not in CONTENT.md and not a listed interface label" };
  };

  out.push(`${route}`);
  out.push("");
  out.push("  1. CONTENT.md, read against the page");
  for (const section of spec.sections) {
    out.push(`     ${section} ${content.titles.get(section) ?? ""}`);
    for (const item of content.quoted.filter((entry) => entry.section === section && isCopy(entry.text))) {
      const found = onPage(item.text);
      if (!found) failures += 1;
      out.push(`       ${found ? "ok     " : "MISSING"}  ${item.text}`);
    }
  }
  for (const { section, reason } of spec.absent ?? []) {
    out.push(`     ${section} ${content.titles.get(section) ?? ""} (must not be on the page: ${reason})`);
    for (const item of content.quoted.filter((entry) => entry.section === section && isCopy(entry.text))) {
      const found = rendered.has(item.text);
      if (found) failures += 1;
      out.push(`       ${found ? "PRESENT" : "absent "}  ${item.text}`);
    }
  }

  out.push("     2 Global");
  for (const text of GLOBAL) {
    const found = onPage(text);
    if (!found) failures += 1;
    out.push(`       ${found ? "ok     " : "MISSING"}  ${text}`);
  }
  const sms = content.quoted.find((item) => item.text.startsWith(LINKS.smsPrefix))?.text ?? "";
  const smsOnPage = page.hrefs.filter((href) => href.startsWith("sms:")).map((href) => decodeURIComponent(href));
  const smsOk = sms !== "" && smsOnPage.length > 0 && smsOnPage.every((href) => href === sms);
  const telOk = page.hrefs.includes(LINKS.tel);
  if (!smsOk) failures += 1;
  if (!telOk) failures += 1;
  out.push(`       ${telOk ? "ok     " : "MISSING"}  link ${LINKS.tel}`);
  out.push(`       ${smsOk ? "ok     " : "MISSING"}  link ${sms} (${smsOnPage.length} on the page)`);

  out.push("");
  out.push("  2. The page, read against CONTENT.md");
  const distinct = new Map<string, { item: Rendered; verdict: Verdict; count: number }>();
  for (const item of page.strings) {
    const existing = distinct.get(item.text);
    if (existing) existing.count += 1;
    else distinct.set(item.text, { item, verdict: classify(item), count: 1 });
  }
  const order: Verdict["status"][] = ["UNKNOWN", "content", "owner note", "pattern", "interface"];
  for (const status of order) {
    const group = [...distinct.values()].filter((entry) => entry.verdict.status === status);
    if (group.length === 0) continue;
    if (status === "UNKNOWN") failures += group.length;
    out.push(`     ${status} (${group.length})`);
    for (const { item, verdict, count } of group) {
      out.push(`       "${item.text}"${count > 1 ? ` x${count}` : ""}`);
      out.push(`           ${verdict.note}${item.kind === "text" ? "" : `, as ${item.kind}`}, first at ${item.where}`);
    }
  }

  out.push("");
  out.push("  3. Document metadata");
  out.push(`       title        ${page.title}`);
  out.push(`       description  ${page.description ?? "(none)"}`);

  out.push("");
  out.push(`  ${failures === 0 ? "PASS" : "FAIL"}: ${distinct.size} distinct strings on the page, ${failures} problem${failures === 1 ? "" : "s"}.`);
  return { report: out, failures, summary: [...distinct.values()] };
}

async function main() {
  const args = process.argv.slice(2);
  const routes = args.filter((arg) => arg.startsWith("/"));
  const print = args.includes("--print");
  const outDir = args.find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;
  const baseArg = args.find((arg) => arg.startsWith("--base="))?.slice(7).replace(/\/$/, "") ?? null;
  if (routes.length === 0) throw new Error("Give at least one route, for example: npm run audit:copy -- /");

  const content = readContent();
  const server = baseArg ? { base: baseArg, stop: () => undefined } : await startServer();
  let failures = 0;

  try {
    for (const route of routes) {
      const spec = ROUTES[route];
      if (!spec) throw new Error(`No CONTENT.md sections are mapped to ${route}. Add it to ROUTES in scripts/copy.ts.`);
      const page = await readPage(server.base, route);
      const result = audit(route, spec, page, content);
      failures += result.failures;

      const text = result.report.join("\n");
      if (outDir) {
        const clean = route.replace(/^\/+|\/+$/g, "");
        const dir = path.join(outDir, clean === "" ? "home" : clean.replace(/\//g, "__"));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "copy.txt"), `${text}\n`);
        console.info(`saved ${path.join(dir, "copy.txt")}`);
      }
      // Without --print, section 2 of the report is cut down to the problems
      const shown = print
        ? result.report
        : result.report.filter((line, index, all) => {
            const start = all.indexOf("  2. The page, read against CONTENT.md");
            const end = all.indexOf("  3. Document metadata");
            if (index <= start || index >= end - 1) return true;
            const unknownStart = all.findIndex((entry) => entry.startsWith("     UNKNOWN"));
            if (unknownStart === -1) return false;
            const unknownEnd = all.findIndex((entry, at) => at > unknownStart && /^ {5}\S/.test(entry));
            return index >= unknownStart && index < (unknownEnd === -1 ? end : unknownEnd);
          });
      console.info(shown.join("\n"));
      console.info("");
    }
  } finally {
    server.stop();
  }

  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
