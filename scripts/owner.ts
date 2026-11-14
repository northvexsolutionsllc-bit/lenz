// Owner list. Everything on the site that is still waiting on the client:
//
//   1. every PlaceholderFrame, with the file it is waiting for and its ratio
//   2. every TODO chip, with the note from CONTENT.md that goes with it
//   3. every media slot in DESIGN.md section 5 that has no file yet, including the ones
//      that have no frame on any page
//   4. every owner note in the content files that no page shows
//
// the first two with the route and the section each one sits in.
//
//   npm run audit:owner
//   npm run audit:owner -- --out=docs/qa      also save the list as docs/qa/owner.txt
//
// It reads the production build, so run "npm run build" first. It only lists. It never
// fails: an empty list is the goal, not a rule.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { routes } from "../src/content/routes";
import { startServer } from "./server";

const DESIGN_FILE = path.join("docs", "DESIGN.md");
const MEDIA_DIR = path.join("public", "media");
const MARKER = "TODO(owner):";

type Item = { route: string; section: string; kind: "frame" | "chip"; text: string; note: string };

// tsx compiles named functions with a call to a helper, __name, that only exists in
// Node. Functions passed to the page are given a stand-in for it.
const shim = (page: Page) => page.evaluate("globalThis.__name = (target) => target");

async function read(page: Page, route: string): Promise<Item[]> {
  await shim(page);
  const found = await page.evaluate(() => {
    const clean = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim();

    // A heading as it is read out: its label if it has one, otherwise its own words,
    // without the chips and the decorative copies that sit inside it
    const words = (el: Element, limit = 0): string => {
      const label = clean(el.getAttribute("aria-label"));
      if (label) return label;
      const parts: string[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (walker.currentNode.parentElement?.closest('.todo-chip, [aria-hidden="true"]')) continue;
        parts.push(walker.currentNode.nodeValue ?? "");
      }
      const text = clean(parts.join(" ")).replace(/\s+([.,?!])/g, "$1");
      return limit > 0 && text.length > limit ? `${text.slice(0, limit).trimEnd()}...` : text;
    };

    const pageName = () => {
      const heading = document.querySelector("main h1");
      return heading ? words(heading) : "Page";
    };

    // The section an element sits in, by its heading. A section with no heading of its
    // own is named after the page.
    const nameOf = (el: Element): string => {
      const landmark = el.closest("section, header, footer");
      if (!landmark) return pageName();
      if (landmark.tagName === "FOOTER") return "Footer";
      if (landmark.tagName === "HEADER") return "Header";
      const labelledBy = landmark.getAttribute("aria-labelledby");
      const heading = (labelledBy ? document.getElementById(labelledBy) : null) ?? landmark.querySelector("h1, h2, h3");
      return (heading ? words(heading) : clean(landmark.getAttribute("aria-label"))) || pageName();
    };

    // What a chip sits beside: the words of the nearest thing around it that has any
    const besideOf = (chip: Element, section: string): string => {
      for (let el = chip.parentElement; el && !el.matches("section, main, body"); el = el.parentElement) {
        const text = words(el, 90);
        if (text) return text === section ? "" : text;
      }
      return "";
    };

    const laidOut = (el: Element) => el.getClientRects().length > 0;

    const frames = Array.from(document.querySelectorAll(".placeholder-frame"))
      .filter(laidOut)
      .map((el) => {
        const parts = Array.from(el.querySelectorAll("p > span")).map((span) => clean(span.textContent));
        const ratio = parts.pop() ?? "";
        return { section: nameOf(el), kind: "frame" as const, text: `${parts.join(" and ")}, ${ratio}`, note: parts.join(" ") };
      });

    const chips = Array.from(document.querySelectorAll(".todo-chip"))
      .filter(laidOut)
      .map((el) => {
        const section = nameOf(el);
        const beside = besideOf(el, section);
        const note = clean(el.getAttribute("title"));
        return { section, kind: "chip" as const, text: `${beside ? `beside "${beside}". ` : ""}Owner note: ${note}`, note };
      });

    return [...frames, ...chips];
  });
  return found.map((item) => ({ route, ...item }));
}

// The media slots in DESIGN.md section 5, one filename each. The list there is written
// with ranges, "before-01.jpg .. -06.jpg" and "process-01..04.jpg", which are opened out.
function mediaSlots(): Array<{ file: string; ratio: string; what: string }> {
  const design = fs.readFileSync(DESIGN_FILE, "utf8");
  const slots: Array<{ file: string; ratio: string; what: string }> = [];
  for (const line of design.split("\n")) {
    const match = /^public\/media\/(\S+?)-(\d\d)(?:(\.\w+)\s+\.\.\s+-|\.\.)(\d\d)(\.\w+)\s+(\d+\/\d+)?\s*(.*)$/.exec(line);
    if (match) {
      const [, stem, first, , last, extension, ratio = "", what] = match;
      for (let n = Number(first); n <= Number(last); n += 1) {
        slots.push({ file: `${stem}-${String(n).padStart(2, "0")}${extension}`, ratio, what: what.trim() });
      }
      continue;
    }
    const single = /^public\/media\/(\S+)\s+(\d+\/\d+)?\s*(.*)$/.exec(line);
    if (single) slots.push({ file: single[1], ratio: single[2] ?? "", what: single[3].trim() });
  }
  return slots;
}

// The owner notes held as data in the content files: every string in a field or constant
// whose name ends in "todo". These are the notes the chips show.
function dataNotes(): Array<{ file: string; line: number; note: string }> {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "src/content"], { encoding: "utf8" })
    .split("\n")
    .filter((file) => file && fs.existsSync(file));
  const notes: Array<{ file: string; line: number; note: string }> = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/\b\w*[tT]odo\s*[:=]\s*"((?:[^"\\]|\\.)*)"/g)) {
      notes.push({ file, line: source.slice(0, match.index).split("\n").length, note: match[1].replace(/\\(.)/g, "$1") });
    }
  }
  return notes;
}

// TODO(owner) notes written as comments. A note that follows the marker with a colon is a
// job still open. A bare mention of the marker is only a description.
function commentNotes(): Array<{ file: string; line: number; note: string }> {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "src"], { encoding: "utf8" })
    .split("\n")
    .filter((file) => /\.tsx?$/.test(file) && fs.existsSync(file));
  const notes: Array<{ file: string; line: number; note: string }> = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8").split("\n");
    source.forEach((line, index) => {
      const at = line.indexOf(MARKER);
      if (at === -1) return;
      // The note runs on over the comment lines that follow it
      const text = [line.slice(at + MARKER.length).trim()];
      for (let next = index + 1; next < source.length; next += 1) {
        const more = source[next].trim();
        if (!/^(\/\/|\*)\s?\S/.test(more) || more.startsWith("*/")) break;
        text.push(more.replace(/^(\/\/|\*)\s?/, ""));
      }
      notes.push({ file, line: index + 1, note: text.join(" ") });
    });
  }
  return notes;
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = args.find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;

  const server = await startServer();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const items: Item[] = [];

  try {
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(server.base + route.path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      // Walk the page so that everything which arrives on scroll is there to be read
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 600) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(600);
      items.push(...(await read(page, route.path)));
      await context.close();
    }
  } finally {
    await browser.close();
    server.stop();
  }

  const lines: string[] = [];
  const say = (text = "") => lines.push(text);
  const heading = (title: string) => {
    say(title);
    say("=".repeat(title.length));
  };

  const list = (kind: Item["kind"], title: string, empty: string) => {
    const mine = items.filter((item) => item.kind === kind);
    heading(title);
    if (mine.length === 0) {
      say();
      say(`  ${empty}`);
    }
    for (const route of routes) {
      const here = mine.filter((item) => item.route === route.path);
      if (here.length === 0) continue;
      say();
      say(route.path);
      // The same line twice in one section is two slots waiting for the same thing
      const counted = new Map<string, number>();
      for (const item of here) {
        const line = `${item.section}: ${item.text}`;
        counted.set(line, (counted.get(line) ?? 0) + 1);
      }
      for (const [line, count] of counted) say(`  ${line}${count > 1 ? ` (${count} places)` : ""}`);
    }
    say();
  };

  const frames = items.filter((item) => item.kind === "frame");
  const chips = items.filter((item) => item.kind === "chip");

  // 3. DESIGN.md 5, against what is on disk and what the pages show
  const missing = mediaSlots().filter((slot) => !fs.existsSync(path.join(MEDIA_DIR, slot.file)));
  const framed = (file: string) => {
    const [stem, number] = /^(.*)-(\d\d)\.\w+$/.exec(file)?.slice(1) ?? [file, ""];
    return frames.some((frame) => {
      if (frame.note.includes(file)) return true;
      // A frame that waits for any one of a family, "before-01.jpg .. -06.jpg"
      const family = new RegExp(`${stem}-(\\d\\d)\\.\\w+ \\.\\. -(\\d\\d)`).exec(frame.note);
      return Boolean(family && number && number >= family[1] && number <= family[2]);
    });
  };

  // 4. Notes that no page shows
  const shown = new Set(chips.map((chip) => chip.note));
  const unseen = [
    ...dataNotes().filter((entry) => !shown.has(entry.note)),
    ...commentNotes(),
  ];

  say("Lenz Rescue: what is still waiting on the owner");
  say(
    `${frames.length} placeholder frames and ${chips.length} TODO chips on ${routes.length} routes. ` +
      `${missing.length} media files not yet supplied. ${unseen.length} notes that no page shows.`,
  );
  say();
  list("frame", "1. Placeholder frames: the file each one is waiting for", "None. Every media slot on a page has its file.");
  list("chip", "2. TODO chips: the fact each one is waiting for", "None. Every fact is confirmed.");

  heading("3. Media files in DESIGN.md section 5 that have not been supplied");
  say();
  if (missing.length === 0) say("  None. Every file is in public/media.");
  for (const slot of missing) {
    const where = framed(slot.file) ? "" : "  (no frame on any page: something else stands in for it)";
    say(`  public/media/${slot.file}${slot.ratio ? `  ${slot.ratio}` : ""}  ${slot.what}${where}`);
  }
  say();

  heading("4. Owner notes in the content files that no page shows");
  say();
  if (unseen.length === 0) say("  None.");
  for (const entry of unseen) {
    say(`  ${entry.file}:${entry.line}`);
    say(`      ${entry.note}`);
  }

  const report = lines.join("\n");
  process.stdout.write(`${report}\n`);
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "owner.txt"), `${report}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
