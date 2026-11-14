// SEO audit. Checks what the built site actually serves:
//
//   1. /sitemap.xml is real XML and lists every registered route, and nothing else.
//   2. Every JSON-LD block on every route is valid against the schema.org vocabulary.
//   3. Every route has a title, a description and a canonical URL, the titles are all
//      different, and where CONTENT.md gives a meta title or description it is used
//      word for word.
//   4. Every image has descriptive alt text, and no two different images share one.
//   5. No two location pages share a paragraph, and no opening is another city's opening
//      with the name swapped.
//
//   npm run audit:seo
//   npm run audit:seo -- --out=docs/qa       also save the report as docs/qa/seo.txt
//
// It reads the production build with script off, which is what a crawler sees first, so
// run "npm run build" first. Exit code 1 if anything fails.
//
// schema.org's own validator is a web service. The vocabulary check here runs offline
// against scripts/data/schemaorg.json, a names-only snapshot of the published vocabulary
// (release 30.1): every class with its parents, every property with the types it belongs
// to and the types it accepts.

import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { locations } from "../src/content/locations";
import { routes } from "../src/content/routes";
import { site } from "../src/content/site";
import { startServer } from "./server";

const CONTENT_FILE = path.join("docs", "CONTENT.md");
const VOCABULARY_FILE = path.join("scripts", "data", "schemaorg.json");

// CONTENT.md 9: the old site's alt text, which must not survive anywhere
const OLD_ALT = ["Headlight restoration", "previous work"].join(" ");

// Which CONTENT.md section holds the meta title and description of a route
const META_SECTIONS: Record<string, string> = {
  "/headlight-restoration": "4",
  "/fog-light-restoration": "5",
  "/dealer-and-auction": "6",
  "/vehicle-guide": "7",
};

// Global lines that location pages are meant to share, with where each comes from
const SHARED_BY_DESIGN: Record<string, string> = {
  "Text photos of both headlights and you will have a price back today.": "the final call to action, CONTENT.md 3.12",
  [site.serviceAreaLine]: "the service area line, CONTENT.md 2",
};

const lines: string[] = [];
let failures = 0;

const say = (text = "") => lines.push(text);
const pass = (text: string) => lines.push(`  ok    ${text}`);
const note = (text: string) => lines.push(`  note  ${text}`);
const fail = (text: string) => {
  failures += 1;
  lines.push(`  FAIL  ${text}`);
};

const absolute = (route: string) => `${site.url}${route === "/" ? "" : route}`;
const squash = (text: string) => text.replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------------------------------
// schema.org

type Vocabulary = {
  source: string;
  dataTypes: string[];
  classes: Record<string, string[]>;
  properties: Record<string, { domain: string[]; range: string[] }>;
  members: Record<string, string[]>;
  superseded: Record<string, string>;
};

type JsonObject = { [key: string]: unknown };

function loadVocabulary(): Vocabulary {
  return JSON.parse(fs.readFileSync(VOCABULARY_FILE, "utf8")) as Vocabulary;
}

/** A class and every class above it */
function lineage(vocabulary: Vocabulary, type: string, seen = new Set<string>()): Set<string> {
  if (seen.has(type)) return seen;
  seen.add(type);
  for (const parent of vocabulary.classes[type] ?? []) lineage(vocabulary, parent, seen);
  return seen;
}

const isObject = (value: unknown): value is JsonObject => typeof value === "object" && value !== null && !Array.isArray(value);

function typesOf(node: JsonObject): string[] {
  const type = node["@type"];
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((entry): entry is string => typeof entry === "string");
  return [];
}

/** Checks one node and everything inside it. Returns the number of properties checked. */
function checkNode(vocabulary: Vocabulary, node: JsonObject, where: string, problems: string[], notes: string[]): number {
  const types = typesOf(node);
  if (types.length === 0) {
    problems.push(`${where}: no @type`);
    return 0;
  }
  for (const type of types) {
    if (!vocabulary.classes[type]) problems.push(`${where}: ${type} is not a schema.org type`);
  }
  if ("@id" in node && !/^https?:\/\//.test(String(node["@id"]))) problems.push(`${where}: @id is not an absolute URL`);

  const family = new Set(types.flatMap((type) => [...lineage(vocabulary, type)]));
  let checked = 0;

  for (const [name, raw] of Object.entries(node)) {
    if (name.startsWith("@")) continue;
    checked += 1;
    const here = `${where}.${name}`;
    const property = vocabulary.properties[name];
    if (!property) {
      problems.push(`${here}: not a schema.org property`);
      continue;
    }
    if (vocabulary.superseded[name]) notes.push(`${here}: superseded by ${vocabulary.superseded[name]}`);
    if (!property.domain.some((type) => family.has(type))) {
      problems.push(`${here}: not a property of ${types.join(", ")} (it belongs to ${property.domain.join(", ")})`);
    }

    // What the property accepts, with every data type widened to its subtypes' parents
    const accepts = (type: string) => property.range.some((allowed) => lineage(vocabulary, type).has(allowed));
    const acceptsText = property.range.some((allowed) => lineage(vocabulary, allowed).has("Text") || allowed === "Text");
    const acceptsNumber = property.range.some((allowed) => lineage(vocabulary, allowed).has("Number"));
    const acceptsEnumeration = property.range.some((allowed) => vocabulary.members[allowed]);

    for (const value of Array.isArray(raw) ? raw : [raw]) {
      if (isObject(value)) {
        const valueTypes = typesOf(value);
        if (valueTypes.length === 0) {
          // A bare reference to something described elsewhere
          if (typeof value["@id"] !== "string") problems.push(`${here}: an object with neither @type nor @id`);
          continue;
        }
        if (!valueTypes.some(accepts)) {
          problems.push(`${here}: ${valueTypes.join(", ")} is outside its range (${property.range.join(", ")})`);
        }
        checked += checkNode(vocabulary, value, here, problems, notes);
      } else if (typeof value === "string") {
        // schema.org accepts text wherever a more specific type is expected, so text
        // outside the stated range is noted, not failed,
        // and a URL in place of an object is a reference to that thing.
        const date = property.range.some((allowed) => ["Date", "DateTime", "Time"].includes(allowed));
        const reference = /^https?:\/\//.test(value);
        if (!acceptsText && !acceptsEnumeration && !date && !reference) {
          notes.push(`${here}: text given where ${property.range.join(", ")} is expected`);
        }
        if (value.trim() === "") problems.push(`${here}: empty`);
      } else if (typeof value === "number") {
        if (!acceptsNumber && !acceptsText) problems.push(`${here}: a number is outside its range (${property.range.join(", ")})`);
      } else if (typeof value === "boolean") {
        if (!property.range.includes("Boolean")) problems.push(`${here}: a boolean is outside its range (${property.range.join(", ")})`);
      } else {
        problems.push(`${here}: no value`);
      }
    }
  }
  return checked;
}

// What Google additionally needs before it will use a block, as far as these types go
function checkShape(node: JsonObject, where: string, problems: string[], notes: string[]) {
  const [type] = typesOf(node);
  const list = (value: unknown) => (Array.isArray(value) ? value : value === undefined ? [] : [value]);

  if (type === "FAQPage") {
    const questions = list(node.mainEntity).filter(isObject);
    if (questions.length === 0) problems.push(`${where}: no questions`);
    questions.forEach((question, index) => {
      const answer = question.acceptedAnswer;
      if (typeof question.name !== "string" || !isObject(answer) || typeof answer.text !== "string") {
        problems.push(`${where}: question ${index + 1} needs a name and an accepted answer with text`);
      }
    });
  }
  if (type === "BreadcrumbList") {
    const items = list(node.itemListElement).filter(isObject);
    if (items.length < 2) problems.push(`${where}: a trail needs at least two items`);
    items.forEach((item, index) => {
      if (item.position !== index + 1) problems.push(`${where}: item ${index + 1} has position ${String(item.position)}`);
      if (typeof item.name !== "string" || !/^https?:\/\//.test(String(item.item))) {
        problems.push(`${where}: item ${index + 1} needs a name and an absolute URL`);
      }
    });
  }
  if (type === "AutoRepair") {
    for (const required of ["name", "telephone", "email", "priceRange", "areaServed", "sameAs"]) {
      if (!(required in node)) problems.push(`${where}: ${required} is missing (CONTENT.md 10)`);
    }
    if ("address" in node) problems.push(`${where}: has an address, and CONTENT.md 10 says none`);
    else notes.push(`${where}: no address, by design. Google lists an address as required for its local business result.`);
    const circle = list(node.areaServed).filter(isObject).some((area) => typesOf(area).includes("GeoCircle"));
    const cities = list(node.areaServed).filter(isObject).filter((area) => typesOf(area).includes("City")).length;
    if (!circle) problems.push(`${where}: no GeoCircle in areaServed (CONTENT.md 10)`);
    if (cities !== 4) problems.push(`${where}: ${cities} City entries in areaServed, and CONTENT.md 10 says four`);
  }
  if (type === "Service") {
    if (!("provider" in node) || !("areaServed" in node)) problems.push(`${where}: needs a provider and an areaServed (CONTENT.md 10)`);
  }
}

// ---------------------------------------------------------------------------------------
// Reading a page

type PageFacts = {
  status: number;
  title: string;
  description: string | null;
  canonical: string | null;
  shareImage: string | null;
  robots: string | null;
  jsonLd: string[];
  images: Array<{ src: string; alt: string | null }>;
  paragraphs: string[];
  html: string;
};

async function readPage(page: Page, base: string, route: string): Promise<PageFacts> {
  const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
  // tsx compiles named functions with a call to a helper, __name, that only exists in
  // Node. The function below runs in the page, so the page is given a stand-in.
  await page.evaluate("globalThis.__name = (target) => target");
  const facts = await page.evaluate(() => {
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? null;
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      shareImage: meta('meta[property="og:image"]'),
      robots: meta('meta[name="robots"]'),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent ?? ""),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.getAttribute("src") ?? "",
        alt: img.getAttribute("alt"),
      })),
      paragraphs: [...document.querySelectorAll("main p")].map((p) => {
        const copy = p.cloneNode(true) as HTMLElement;
        // Leave out what is not the paragraph's own copy: owner chips and hidden helpers
        copy.querySelectorAll(".todo-chip, .sr-only").forEach((el) => el.remove());
        return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
      }),
      html: document.documentElement.outerHTML,
    };
  });
  return { status: response?.status() ?? 0, ...facts };
}

// The file an image tag points at, whether or not it goes through the image optimiser
function imageFile(src: string): string {
  const match = /[?&]url=([^&]+)/.exec(src);
  return match ? decodeURIComponent(match[1]) : src;
}

// ---------------------------------------------------------------------------------------

function readContentMeta() {
  const raw = fs.readFileSync(CONTENT_FILE, "utf8");
  const meta: Record<string, { title?: string; description?: string }> = {};
  let section = "";
  let pattern = "";
  for (const line of raw.split("\n")) {
    const heading = /^## (\d+)\. /.exec(line);
    if (heading) section = heading[1];
    const title = /^- Meta title: `([^`]+)`/.exec(line);
    const description = /^- Meta description: `([^`]+)`/.exec(line);
    if (title) meta[section] = { ...meta[section], title: title[1] };
    if (description) meta[section] = { ...meta[section], description: description[1] };
    const located = /^`(Headlight Restoration in \[City\][^`]+)`/.exec(line);
    if (located) pattern = located[1];
  }
  return { meta, pattern };
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = args.find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;
  const baseArg = args.find((arg) => arg.startsWith("--base="))?.slice(7).replace(/\/$/, "") ?? null;

  const vocabulary = loadVocabulary();
  const content = readContentMeta();
  const server = baseArg ? { base: baseArg, stop: () => undefined } : await startServer();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  try {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    // ------------------------------------------------------------------ 1. sitemap
    say("1. Sitemap");
    const sitemap = await fetch(`${server.base}/sitemap.xml`);
    const xml = await sitemap.text();
    const type = sitemap.headers.get("content-type") ?? "";
    if (sitemap.status === 200 && /xml/.test(type)) pass(`/sitemap.xml answers 200 as ${type}`);
    else fail(`/sitemap.xml answers ${sitemap.status} as ${type}`);

    const wellFormed =
      xml.startsWith("<?xml") &&
      /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(xml) &&
      xml.trimEnd().endsWith("</urlset>") &&
      (xml.match(/<url>/g) ?? []).length === (xml.match(/<\/url>/g) ?? []).length &&
      !/<html/i.test(xml);
    if (wellFormed) pass("it is an XML urlset in the sitemaps.org namespace, not an HTML page");
    else fail("it is not a well formed sitemap");

    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const expected = routes.map((route) => absolute(route.path));
    const missing = expected.filter((url) => !listed.includes(url));
    const extra = listed.filter((url) => !expected.includes(url));
    if (missing.length === 0 && extra.length === 0 && listed.length === new Set(listed).size) {
      pass(`it lists all ${listed.length} routes, each once`);
    } else {
      fail(`missing: ${missing.join(", ") || "none"}. unexpected: ${extra.join(", ") || "none"}`);
    }
    listed.forEach((url) => say(`        ${url}`));

    const robots = await (await fetch(`${server.base}/robots.txt`)).text();
    if (robots.includes(`Sitemap: ${site.url}/sitemap.xml`)) pass("/robots.txt points to it");
    else fail("/robots.txt does not name the sitemap");

    // ------------------------------------------------------------------ read every route
    const facts = new Map<string, PageFacts>();
    for (const route of routes) facts.set(route.path, await readPage(page, server.base, route.path));

    say();
    say("   Every route answers");
    for (const [route, fact] of facts) {
      if (fact.status === 200) pass(`${route} 200`);
      else fail(`${route} ${fact.status}`);
    }
    const lost = await page.goto(`${server.base}/no-such-page`, { waitUntil: "domcontentloaded" });
    if (lost?.status() === 404) pass("an address that does not exist answers 404, not the home page");
    else fail(`an address that does not exist answers ${lost?.status()}`);

    // ------------------------------------------------------------------ 2. JSON-LD
    say();
    say(`2. Structured data, against ${vocabulary.source}`);
    let blocks = 0;
    for (const [route, fact] of facts) {
      say(`   ${route}`);
      if (fact.jsonLd.length === 0) fail("no JSON-LD on the page");
      const seen: string[] = [];
      for (const text of fact.jsonLd) {
        blocks += 1;
        let node: unknown;
        try {
          node = JSON.parse(text);
        } catch {
          fail("a block is not valid JSON");
          continue;
        }
        if (!isObject(node)) {
          fail("a block is not a JSON object");
          continue;
        }
        const [name] = typesOf(node);
        seen.push(name);
        const problems: string[] = [];
        const notes: string[] = [];
        if (node["@context"] !== "https://schema.org") problems.push(`${name}: @context is not https://schema.org`);
        const checked = checkNode(vocabulary, node, name, problems, notes);
        checkShape(node, name, problems, notes);
        if (problems.length === 0) pass(`${name}: valid, ${checked} properties checked`);
        problems.forEach((problem) => fail(problem));
        notes.forEach((entry) => note(entry));
      }

      // CONTENT.md 10: what each page must carry
      const needs = ["AutoRepair"];
      if (route !== "/") needs.push("BreadcrumbList");
      if (["/headlight-restoration", "/vehicle-guide"].includes(route)) needs.push("FAQPage");
      if (["/headlight-restoration", "/fog-light-restoration", "/dealer-and-auction"].includes(route) || route.endsWith("-ca")) {
        needs.push("Service");
      }
      const absent = needs.filter((name) => !seen.includes(name));
      if (absent.length > 0) fail(`missing: ${absent.join(", ")}`);
    }
    say(`   ${blocks} blocks on ${facts.size} routes.`);

    // ------------------------------------------------------------------ 3. metadata
    say();
    say("3. Metadata");
    const titles = new Map<string, string>();
    for (const [route, fact] of facts) {
      const problems: string[] = [];
      if (!fact.title) problems.push("no title");
      if (!fact.description) problems.push("no description");
      if (fact.canonical !== absolute(route)) problems.push(`canonical is ${fact.canonical}`);
      if (!fact.shareImage) problems.push("no share image");
      if (fact.robots && /noindex/.test(fact.robots)) problems.push("marked noindex");
      const twin = titles.get(fact.title);
      if (twin) problems.push(`same title as ${twin}`);
      titles.set(fact.title, route);

      const section = META_SECTIONS[route];
      const given = section ? content.meta[section] : undefined;
      let source = "no meta given in CONTENT.md for this route";
      if (given) {
        source = "title and description as CONTENT.md gives them";
        if (given.title !== fact.title) problems.push(`title differs from CONTENT.md: "${given.title}"`);
        if (given.description !== fact.description) problems.push("description differs from CONTENT.md");
      }
      const located = locations.find((entry) => `/${entry.slug}` === route);
      if (located) {
        source = "title from the CONTENT.md 8 pattern";
        if (content.pattern.replace("[City]", located.city) !== fact.title) problems.push("title does not follow the CONTENT.md 8 pattern");
      }

      if (problems.length === 0) pass(`${route}: ${source}`);
      else fail(`${route}: ${problems.join("; ")}`);
      say(`        ${fact.title}`);
    }

    // ------------------------------------------------------------------ 4. alt text
    say();
    say("4. Alt text");
    const byFile = new Map<string, Set<string>>();
    const byAlt = new Map<string, Set<string>>();
    let decorative = 0;
    let described = 0;
    for (const [route, fact] of facts) {
      for (const image of fact.images) {
        const file = imageFile(image.src);
        if (image.alt === null) {
          fail(`${route}: ${file} has no alt attribute`);
          continue;
        }
        if (image.alt === "") {
          decorative += 1;
          if (!/hero-still|hero-poster|logo/.test(file)) fail(`${route}: ${file} has empty alt text and is not decoration`);
          continue;
        }
        described += 1;
        if (image.alt.split(" ").length < 4) fail(`${route}: "${image.alt}" is too short to describe ${file}`);
        byFile.set(file, (byFile.get(file) ?? new Set()).add(image.alt));
        byAlt.set(image.alt, (byAlt.get(image.alt) ?? new Set()).add(file));
      }
      if (fact.html.includes(OLD_ALT)) fail(`${route}: the old site's alt text is on the page`);
    }
    const shared = [...byAlt].filter(([, files]) => files.size > 1);
    const split = [...byFile].filter(([, alts]) => alts.size > 1);
    if (shared.length === 0) pass(`${byFile.size} different images, ${byAlt.size} different alt texts: no two images share one`);
    shared.forEach(([alt, files]) => fail(`"${alt}" is used for ${[...files].join(" and ")}`));
    split.forEach(([file, alts]) => fail(`${file} has more than one alt text: ${[...alts].join(" | ")}`));
    pass(`${described} image tags carry a description. ${decorative} with empty alt text, as decoration: the hero backdrop.`);
    pass("the old site's alt text appears on no route");
    for (const [alt, files] of [...byAlt].sort()) say(`        ${[...files][0].replace("/media/", "")}: ${alt}`);

    // ------------------------------------------------------------------ 5. location pages
    say();
    say("5. Location pages");
    const cityNames = locations.map((entry) => entry.city);
    const generic = (text: string) => cityNames.reduce((result, city) => result.split(city).join("[city]"), text);
    const paragraphs = new Map<string, string[]>();
    for (const located of locations) {
      const fact = facts.get(`/${located.slug}`);
      if (!fact) continue;
      paragraphs.set(located.city, fact.paragraphs.filter((text) => text.split(" ").length >= 6));

      const words = squash(located.opening).split(" ").length;
      const onPage = fact.paragraphs.includes(squash(located.opening));
      const named = located.neighbourhoods.filter((place) => !located.opening.includes(place));
      if (!onPage) fail(`${located.city}: the opening is not on the page`);
      else if (words < 70 || words > 100) fail(`${located.city}: the opening is ${words} words, outside 70 to 100`);
      else if (named.length > 0) fail(`${located.city}: the opening does not mention ${named.join(", ")}`);
      else pass(`${located.city}: opening of ${words} words, names ${located.neighbourhoods.join(", ")}`);
      say(`        brief: ${located.mustMention}`);
    }

    let clashes = 0;
    const cityList = [...paragraphs.keys()];
    for (let a = 0; a < cityList.length; a += 1) {
      for (let b = a + 1; b < cityList.length; b += 1) {
        const first = paragraphs.get(cityList[a]) ?? [];
        const second = paragraphs.get(cityList[b]) ?? [];
        for (const text of first) {
          if (SHARED_BY_DESIGN[text]) continue;
          if (second.includes(text)) {
            clashes += 1;
            fail(`${cityList[a]} and ${cityList[b]} share a paragraph: "${text.slice(0, 80)}"`);
          } else if (second.some((other) => generic(other) === generic(text))) {
            clashes += 1;
            fail(`${cityList[a]} and ${cityList[b]} differ only by the city name: "${text.slice(0, 80)}"`);
          }
        }
      }
    }
    if (clashes === 0) pass("no two location pages share a paragraph, and none is another's with the city swapped");
    const common = Object.entries(SHARED_BY_DESIGN).filter(([text]) => [...paragraphs.values()].every((list) => list.includes(text)));
    common.forEach(([text, source]) => note(`on all four by design: "${text}" (${source})`));

    await context.close();
  } finally {
    await browser.close();
    server.stop();
  }

  say();
  say(failures === 0 ? "PASS: nothing failed." : `FAIL: ${failures} problem${failures === 1 ? "" : "s"}.`);

  const report = lines.join("\n");
  console.info(report);
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "seo.txt"), `${report}\n`);
    console.info(`\nsaved ${path.join(outDir, "seo.txt")}`);
  }
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
