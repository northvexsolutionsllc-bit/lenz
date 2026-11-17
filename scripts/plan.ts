// docs/SEO.md, read as data: the title and description section 4 gives for every route,
// and the primary keyword section 3 gives it. Both audits that hold the site to SEO.md
// read it from here, so the document is the one source and the code is what is checked.

import fs from "node:fs";
import path from "node:path";
import { locations } from "../src/content/locations";

export const SEO_FILE = path.join("docs", "SEO.md");

export type Plan = {
  /** Section 4, by route. The city pages follow the pattern of the one it writes out. */
  meta: Map<string, { title: string; description: string }>;
  /** Section 3, by route: the primary keyword, or the word SEO.md puts in its place */
  keywords: Map<string, string>;
};

export function readPlan(): Plan {
  const raw = fs.readFileSync(SEO_FILE, "utf8");
  const part = (from: string, to: string) => raw.slice(raw.indexOf(from), raw.indexOf(to));
  const rows = (text: string) =>
    text
      .split("\n")
      .map((line) => /^\| `([^`]+)` \| (.+?) \| (.+?) \|/.exec(line))
      .filter((match): match is RegExpExecArray => match !== null);

  const meta = new Map<string, { title: string; description: string }>();
  for (const [, route, title, description] of rows(part("## 4. Title tags", "## 5. On page rules"))) {
    meta.set(route, { title, description });
  }
  const keywords = new Map<string, string>();
  for (const [, route, keyword] of rows(part("## 3. Page map", "## 4. Title tags"))) keywords.set(route, keyword);

  // Section 4 writes out one city page and says "Use the same pattern for the other three"
  const pattern = locations.find((entry) => meta.has(`/${entry.slug}`));
  const given = pattern ? meta.get(`/${pattern.slug}`) : undefined;
  if (pattern && given) {
    for (const entry of locations) {
      const swap = (text: string) => text.split(pattern.city).join(entry.city);
      meta.set(`/${entry.slug}`, { title: swap(given.title), description: swap(given.description) });
    }
  }
  return { meta, keywords };
}
