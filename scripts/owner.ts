// Owner list. Everything the site is still waiting on from the client:
//
//   1. every owner note in the content files: a fact still to be confirmed or supplied
//   2. every media file that has not been supplied: the slots in DESIGN.md section 5,
//      and the photos the content files name
//   3. every TODO(owner) note written as a comment in the source
//
//   npm run audit:owner
//   npm run audit:owner -- --out=docs/qa      also save the list as docs/qa/owner.txt
//
// None of this is ever shown to a visitor. In a production build a note renders nothing
// and a media slot with no file renders nothing, so this list is the only place the gaps
// can be seen. (Under "npm run dev" each note also shows as a chip beside the thing it
// is about.) It reads the source, so it needs no build. It only lists and never fails:
// an empty list is the goal, not a rule.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DESIGN_FILE = path.join("docs", "DESIGN.md");
const MEDIA_DIR = path.join("public", "media");
const MARKER = "TODO(owner):";

type Note = { file: string; line: number; note: string; about: string };

const tracked = (folder: string) =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", folder], { encoding: "utf8" })
    .split("\n")
    .filter((file) => /\.tsx?$/.test(file) && fs.existsSync(file));

// The owner notes held as data: every string in a field or constant whose name ends in
// "todo". With each goes the nearest piece of copy above it, to say what it is about.
function dataNotes(): Note[] {
  const notes: Note[] = [];
  for (const file of tracked("src/content")) {
    const source = fs.readFileSync(file, "utf8");
    const lines = source.split("\n");
    // Every note sits behind the development check, which is what marks it out
    const pattern = /\b\w*[tT]odo\s*[:=]\s*(?:DEV|process\.env\.NODE_ENV\s*===\s*"development")\s*\?\s*"((?:[^"\\]|\\.)*)"/g;
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      // The closest title, label, question or section comment above the note
      let about = "";
      for (let at = line - 1; at >= 0 && at > line - 14; at -= 1) {
        const found =
          /(?:title|label|question|eyebrow):\s*(?:\{\s*plain:\s*)?"((?:[^"\\]|\\.)*)"/.exec(lines[at]) ?? /^\/\/\s*(\d[\d.]*\s.*)$/.exec(lines[at]);
        if (found) {
          about = found[1];
          break;
        }
      }
      // Failing that, the name of the thing the note belongs to
      about ||= /(\w+):\s*\{\s*todo\b/.exec(lines[line - 1])?.[1] ?? "";
      notes.push({ file, line, note: match[1].replace(/\\(.)/g, "$1"), about });
    }
  }
  return notes;
}

// TODO(owner) notes written as comments. A note that follows the marker with a colon is a
// job still open. A bare mention of the marker is only a description.
function commentNotes(): Note[] {
  const notes: Note[] = [];
  for (const file of tracked("src")) {
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
      notes.push({ file, line: index + 1, note: text.join(" "), about: "" });
    });
  }
  return notes;
}

type Slot = { file: string; ratio: string; what: string };

// The media slots in DESIGN.md section 5, one filename each. The list there is written
// with ranges, "before-01.jpg .. -06.jpg" and "process-01..04.jpg", which are opened out.
function designSlots(): Slot[] {
  const design = fs.readFileSync(DESIGN_FILE, "utf8");
  const slots: Slot[] = [];
  for (const line of design.split("\n")) {
    const range = /^public\/media\/(\S+?)-(\d\d)(?:(\.\w+)\s+\.\.\s+-|\.\.)(\d\d)(\.\w+)\s+(\d+\/\d+)?\s*(.*)$/.exec(line);
    if (range) {
      const [, stem, first, , last, extension, ratio = "", what] = range;
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

// Photos the content files name that DESIGN.md does not list
function contentSlots(known: Set<string>): Slot[] {
  const slots: Slot[] = [];
  for (const file of tracked("src/content")) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/"([\w-]+\.(?:jpe?g|png|webp|svg))"/g)) {
      if (!known.has(match[1]) && !slots.some((slot) => slot.file === match[1])) {
        slots.push({ file: match[1], ratio: "", what: `named in ${file}` });
      }
    }
  }
  return slots;
}

function main() {
  const outDir = process.argv.slice(2).find((arg) => arg.startsWith("--out="))?.slice(6) ?? null;

  const facts = dataNotes();
  const comments = commentNotes();
  const design = designSlots();
  const slots = [...design, ...contentSlots(new Set(design.map((slot) => slot.file)))];
  const missing = slots.filter((slot) => !fs.existsSync(path.join(MEDIA_DIR, slot.file)));

  const lines: string[] = [];
  const say = (text = "") => lines.push(text);
  const heading = (title: string) => {
    say(title);
    say("=".repeat(title.length));
    say();
  };

  say("Lenz Rescue: what is still waiting on the owner");
  say(`${facts.length} facts to confirm or supply, ${missing.length} media files not yet supplied, ${comments.length} notes in the source.`);
  say("None of it is visible on the site: a note or an empty media slot renders nothing in production.");
  say();

  heading("1. Facts to confirm or supply");
  if (facts.length === 0) say("  None.");
  for (const entry of facts) {
    say(`  ${entry.file}:${entry.line}${entry.about ? `  (${entry.about})` : ""}`);
    say(`      ${entry.note}`);
  }
  say();

  heading("2. Media files not yet supplied");
  if (missing.length === 0) say("  None. Every file is in public/media.");
  for (const slot of missing) say(`  public/media/${slot.file}${slot.ratio ? `  ${slot.ratio}` : ""}  ${slot.what}`);
  say();

  heading("3. Notes in the source");
  if (comments.length === 0) say("  None.");
  for (const entry of comments) {
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

main();
