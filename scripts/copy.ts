// Copy audit. Reads back every user-facing string a route renders and checks it against
// docs/CONTENT.md, in both directions:
//
//   1. Every string CONTENT.md gives for the route is on the page, word for word.
//   2. Every string on the page comes from CONTENT.md word for word. The exceptions are
//      listed below, each with where it comes from: labels CONTENT.md uses without code
//      quotes, interface labels, and the four location openings, which are drafts.
//
//   npm run audit:copy                            every route
//   npm run audit:copy -- / /gallery --print      these routes, listing every string
//   npm run audit:copy -- --out=docs/qa           also save each report beside the captures
//
// The page is read in a real browser from the production build, with script on, so run
// "npm run build" first. Exit code 1 if a string is missing or cannot be accounted for.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { locations } from "../src/content/locations";
import { startServer } from "./server";

const CONTENT_FILE = path.join("docs", "CONTENT.md");

// ---------------------------------------------------------------------------------------
// Which part of CONTENT.md each route renders

/** One string of a section, picked out by how it starts */
type Pick = { section: string; startsWith: string };

type RouteSpec = {
  /** CONTENT.md headings whose strings must all be on the page, by number */
  sections: string[];
  /** Single strings from other headings that must be on the page too */
  strings?: Pick[];
  /** Headings whose strings must not be on the page, with the reason */
  absent?: Array<{ section: string; reason: string }>;
  /**
   * Strings from the headings above that are held back for now: copy that only makes
   * sense with a fact the owner has still to supply. They are allowed on the page and
   * not required. Matched by how they start.
   */
  held?: Array<{ startsWith: string; reason: string }>;
};

const pick = (section: string, ...starts: string[]): Pick[] => starts.map((startsWith) => ({ section, startsWith }));

// What a location page takes from the home page's sections
const LOCATION_SHARED: Pick[] = [
  ...pick("3.1", "$125", "STARTING PRICE", "3 YR", "GUARANTEE"),
  ...pick("3.4", "See the process"),
  ...pick("3.5", "PREVIOUS WORK", "Drag it.", "That is the same lens."),
  ...pick("3.6", "THE CORRECTION", "Four stages.", "In that order.", "Sand", "Compound", "Polish", "Protect"),
];

const ROUTES: Record<string, RouteSpec> = {
  "/": {
    sections: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.12"],
    absent: [{ section: "3.11", reason: "kept out of the page order until real reviews exist, DECISIONS.md 11" }],
  },
  "/headlight-restoration": {
    sections: ["4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.12"],
    strings: [
      ...pick("3.2", "WHY IT MATTERS", "Headlight plastic is coated"),
      ...pick("3.4", "Headlight restoration"),
      ...pick("7", "Replace instead", "Cracks through the lens"),
    ],
    held: [{ startsWith: "How do I pay?", reason: "a question is not asked until the owner has supplied its answer" }],
  },
  "/fog-light-restoration": { sections: ["5", "3.6", "3.9", "3.12"], strings: pick("3.8", "PRICING") },
  "/dealer-and-auction": {
    sections: ["6"],
    strings: pick("3.8", "PRICING"),
    held: [
      { startsWith: "Volume pricing", reason: "a heading with nothing under it: left out until the owner supplies the prices" },
      { startsWith: "PRICING", reason: "the eyebrow of the volume pricing section, which is left out for now" },
    ],
  },
  // The service names are the gallery's filter labels. The filter only shows once photos
  // of more than one service exist, so the names are allowed here and not required.
  "/gallery": {
    sections: [],
    strings: pick("3.5", "PREVIOUS WORK", "Drag it.", "That is the same lens.", "Every pair here"),
  },
  "/vehicle-guide": { sections: ["7"] },
  "/about": { sections: ["3.10", "3.12"] },
  "/contact": { sections: ["3.12"], strings: pick("3.7", "Get your quote") },
  ...Object.fromEntries(
    locations.map((location) => [
      `/${location.slug}`,
      {
        sections: ["3.12"],
        strings: [...pick("8", location.title.plain, location.title.accent), ...LOCATION_SHARED],
      } satisfies RouteSpec,
    ]),
  ),
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

const LINKS = { tel: "tel:+19258125524", smsPrefix: "sms:+19258125524?&body=" };

// Words CONTENT.md uses without code quotes that the site shows as labels. Each is
// checked against the document before use. A section name is shown in sentence case, so
// those are compared without regard to case.
const LABELS: Array<{ text: string; source: string; anyCase?: boolean }> = [
  { text: "What oxidation actually is", source: "CONTENT.md 4, section name", anyCase: true },
  { text: "What it will not fix", source: "CONTENT.md 4, section name", anyCase: true },
  { text: "FAQ", source: "CONTENT.md 4, section name" },
  { text: "Volume pricing", source: "CONTENT.md 6, field name" },
  { text: "Dealership", source: "CONTENT.md 6, form field" },
  { text: "Lot address", source: "CONTENT.md 6, form field" },
  { text: "Approximate units per month", source: "CONTENT.md 6, form field" },
  { text: "Phone", source: "CONTENT.md 2, field name" },
  { text: "Email", source: "CONTENT.md 2, field name" },
  { text: "Hours", source: "CONTENT.md 2, field name" },
  ...locations.flatMap((location) =>
    location.neighbourhoods.map((place) => ({ text: place, source: "CONTENT.md 8, the location table" })),
  ),
];

// Written in build, not taken from CONTENT.md: the four location openings. CONTENT.md 8
// gives a brief for each and no text. They are reported apart from everything else.
const DRAFTS = new Map(locations.map((location) => [location.opening, `${location.city}, to the brief "${location.mustMention}"`]));

// Strings in code quotes in CONTENT.md that are not copy: tokens, routes, files, markup
const NOT_COPY = [/^--/, /^\//, /^TODO\(owner\)$/, /^likely:$/, /^tel:/, /^sms:/, /^alt=/, /\.(jpg|svg)$/, /^@type/, /\[City\]/];
const COMPONENT_NAMES = new Set(["ReviewPlaceholder", "Counter", "LocalBusiness", "Service", "FAQPage", "BreadcrumbList", "GeoCircle", "City"]);

// Interface labels. None of these is marketing copy. Each names the document that gives
// it, or says that the build supplied it because no document does.
const INTERFACE: Array<{ match: string | RegExp; source: string }> = [
  { match: "TODO", source: "PROMPTS.md, Prompt 4: the owner chips" },
  { match: /^0\d$/, source: "DESIGN.md 6: the number of an item in a list, with its leading zero" },
  { match: "BEFORE", source: "MOTION.md 6" },
  { match: "AFTER", source: "MOTION.md 6" },
  { match: "Reveal the restored headlight", source: "MOTION.md 6" },
  { match: /^(hero-poster|owner|before-\d\d|after-\d\d|gallery-\d\d|process-\d\d)\.jpg$/, source: "DESIGN.md 5, slot filename" },
  { match: /^(before|after)-01\.jpg \.\. -06\.jpg$/, source: "DESIGN.md 5, the pair slots as it lists them" },
  { match: /^guide-\d\d\.jpg$/, source: "supplied in build: slot filename for a vehicle guide photo, which DESIGN.md 5 does not name" },
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
  { match: "Name", source: "supplied in build: contact form field. CONTENT.md lists no fields for this form." },
  { match: "Vehicle", source: "supplied in build: contact form field. CONTENT.md lists no fields for this form." },
  { match: "Message", source: "supplied in build: contact form field. CONTENT.md lists no fields for this form." },
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
    // A sub-heading without a number, such as the FAQ list, stays in its section
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
// optional and the vehicle is any description. A closing ", [what is visible]" is
// optional too: it can only be written once the photo exists.
function patternTest(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|\\]/g, "\\$&")
    .replace(/ in \[city\]/g, "( in .+)?")
    .replace(/, \[what is visible\]/g, "(, .+)?")
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
          parts.unshift(node.tagName.toLowerCase() + (node.id && !node.id.startsWith("_") ? `#${node.id}` : first ? `.${first}` : ""));
        }
        return parts.join(" > ");
      };

      const context = (el: Element) => {
        const out: string[] = [];
        for (let node: Element | null = el, depth = 0; node && node !== document.body && depth < 4; node = node.parentElement, depth += 1) {
          const text = squash(node.textContent ?? "");
          if (text.length <= 400) out.push(text);
        }
        return out;
      };

      const visit = (el: Element) => {
        if (SKIP.has(el.tagName)) return;
        const chip = el.closest(".dev-note") !== null;

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

type Status = "content" | "label" | "owner note" | "pattern" | "interface" | "DRAFT" | "UNKNOWN";
type Verdict = { status: Status; note: string };

function audit(route: string, spec: RouteSpec, page: Awaited<ReturnType<typeof readPage>>, content: ReturnType<typeof readContent>) {
  const out: string[] = [];
  let failures = 0;

  const approved = new Map<string, Quoted>();
  for (const item of content.quoted) if (isCopy(item.text) && !approved.has(item.text)) approved.set(item.text, item);
  for (const text of GLOBAL) {
    if (!content.prose.includes(text)) throw new Error(`"${text}" is listed as a global string but is not in ${CONTENT_FILE}.`);
    if (!approved.has(text)) approved.set(text, { text, line: 0, section: "2" });
  }
  for (const label of LABELS) {
    const found = label.anyCase ? content.prose.toLowerCase().includes(label.text.toLowerCase()) : content.prose.includes(label.text);
    if (!found) throw new Error(`"${label.text}" is listed as a label from CONTENT.md but is not in ${CONTENT_FILE}.`);
  }
  const patterns = content.quoted.filter((item) => item.section === "9" && /\[[^\]]+\]/.test(item.text));

  const approvedList = [...approved.keys()];
  const rendered = new Set(page.strings.map((item) => item.text));
  rendered.add(page.title);
  if (page.description) rendered.add(page.description);
  const renderedList = [...rendered];
  const fullText = normalise(page.strings.filter((item) => item.kind === "text").flatMap((item) => [item.text, ...item.context]).join(" \n "));

  // Can the string be read as strings from `pool` one after another?
  const sequence = (text: string, pool: string[]): boolean => {
    if (text === "") return true;
    for (const candidate of pool) {
      if (text === candidate) return true;
      if (text.startsWith(`${candidate} `) && sequence(text.slice(candidate.length + 1), pool)) return true;
    }
    return false;
  };

  const onPage = (text: string) => rendered.has(text) || fullText.includes(text) || sequence(text, renderedList);

  // Is the text a run of whole words, three or more, out of one approved string? A
  // heading and the sentence after it can be one string in CONTENT.md.
  const within = (text: string) =>
    text.split(" ").length >= 3
      ? approvedList.find((whole) => whole.startsWith(`${text} `) || whole.endsWith(` ${text}`) || whole.includes(` ${text} `))
      : undefined;

  const classify = (item: Rendered): Verdict => {
    const draft = DRAFTS.get(item.text);
    if (draft) return { status: "DRAFT", note: `written in build for ${draft}. Awaiting owner confirmation.` };
    const known = approved.get(item.text);
    if (known) return { status: "content", note: known.line ? `CONTENT.md line ${known.line}` : "CONTENT.md section 2" };
    if (item.chip && content.prose.includes(item.text)) return { status: "owner note", note: "the TODO(owner) text in CONTENT.md, verbatim" };
    const whole = item.context.find((text) => approved.has(text));
    if (whole) return { status: "content", note: `part of "${whole.slice(0, 60)}", CONTENT.md line ${approved.get(whole)!.line}` };
    // One line of a heading that the type reveal has split into lines
    const heading = item.context.find((text) => sequence(text, approvedList));
    if (heading) return { status: "content", note: `part of "${heading.slice(0, 60)}", which is CONTENT.md strings in sequence` };
    const containing = within(item.text);
    if (containing) return { status: "content", note: `part of "${containing.slice(0, 60)}", CONTENT.md line ${approved.get(containing)!.line}` };
    const label = LABELS.find((entry) => entry.text === item.text);
    if (label) return { status: "label", note: label.source };
    const ui = INTERFACE.find((entry) => (typeof entry.match === "string" ? entry.match === item.text : entry.match.test(item.text)));
    if (ui) return { status: "interface", note: ui.source };
    const pattern = patterns.find((entry) => patternTest(entry.text).test(item.text));
    if (pattern) return { status: "pattern", note: `CONTENT.md line ${pattern.line}, details still TODO(owner)` };
    const pieces = item.text.split(/(?<=[a-z])\. (?=[A-Z])/).map((piece) => piece.replace(/\.$/, ""));
    if (pieces.length > 1 && pieces.every((piece) => patterns.some((entry) => patternTest(entry.text).test(piece)))) {
      return { status: "pattern", note: "CONTENT.md section 9 patterns, details still TODO(owner)" };
    }
    if (sequence(item.text, approvedList)) return { status: "content", note: "CONTENT.md strings in sequence" };
    return { status: "UNKNOWN", note: "not in CONTENT.md and not a listed label" };
  };

  out.push(`${route}`);
  out.push("");
  out.push("  1. CONTENT.md, read against the page");
  const row = (text: string) => {
    const found = onPage(text);
    const held = spec.held?.find((entry) => text.startsWith(entry.startsWith));
    if (!found && held) {
      out.push(`       held     ${text}  (${held.reason})`);
      return;
    }
    if (!found) failures += 1;
    out.push(`       ${found ? "ok     " : "MISSING"}  ${text}`);
  };
  for (const section of spec.sections) {
    out.push(`     ${section} ${content.titles.get(section) ?? ""}`);
    content.quoted.filter((entry) => entry.section === section && isCopy(entry.text)).forEach((item) => row(item.text));
  }
  if (spec.strings?.length) {
    out.push("     Taken from other sections");
    for (const wanted of spec.strings) {
      const item = content.quoted.find((entry) => entry.section === wanted.section && entry.text.startsWith(wanted.startsWith));
      if (!item) throw new Error(`CONTENT.md ${wanted.section} has no string starting "${wanted.startsWith}".`);
      row(item.text);
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
  GLOBAL.forEach(row);
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
  const order: Status[] = ["UNKNOWN", "DRAFT", "content", "label", "owner note", "pattern", "interface"];
  const counts: string[] = [];
  for (const status of order) {
    const group = [...distinct.values()].filter((entry) => entry.verdict.status === status);
    if (group.length === 0) continue;
    if (status === "UNKNOWN") failures += group.length;
    counts.push(`${group.length} ${status}`);
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
  out.push(`  ${failures === 0 ? "PASS" : "FAIL"}: ${distinct.size} distinct strings (${counts.join(", ")}), ${failures} problem${failures === 1 ? "" : "s"}.`);
  return { report: out, failures };
}

// Without --print, part 2 of a report is cut down to what needs a decision
function brief(report: string[]): string[] {
  const start = report.indexOf("  2. The page, read against CONTENT.md");
  const end = report.indexOf("  3. Document metadata");
  const keep = new Set<number>();
  let showing = false;
  report.forEach((line, index) => {
    if (index <= start || index >= end - 1) keep.add(index);
    else if (/^ {5}\S/.test(line)) {
      showing = /^ {5}(UNKNOWN|DRAFT)/.test(line);
      if (showing) keep.add(index);
    } else if (showing) keep.add(index);
  });
  return report.filter((_, index) => keep.has(index));
}

async function main() {
  const args = process.argv.slice(2);
  const named = args.filter((arg) => arg.startsWith("/"));
  const routes = named.length > 0 ? named : Object.keys(ROUTES);
  const print = args.includes("--print");
  const outDir = args.find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;
  const baseArg = args.find((arg) => arg.startsWith("--base="))?.slice(7).replace(/\/$/, "") ?? null;

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

      if (outDir) {
        const clean = route.replace(/^\/+|\/+$/g, "");
        const dir = path.join(outDir, clean === "" ? "home" : clean.replace(/\//g, "__"));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "copy.txt"), `${result.report.join("\n")}\n`);
        console.info(`saved ${path.join(dir, "copy.txt")}`);
      }
      console.info((print ? result.report : brief(result.report)).join("\n"));
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
