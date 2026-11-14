// Design audit. Enforces the ban list in docs/DESIGN.md section 7 and the motion rules in
// docs/MOTION.md, so "grep the whole repo" is one repeatable command:
//
//   npm run audit:design
//
// It scans every file git knows about (tracked, plus untracked files that are not
// ignored). The docs folder is the specification, quotes the banned things in order to
// ban them, and is only checked for dashes. Exit code 1 if anything is found.
//
// It also reads package.json and reports any dependency that nothing uses.

import { execFileSync } from "node:child_process";
import fs from "node:fs";

type Finding = { rule: string; file: string; line: number; text: string };

const findings: Finding[] = [];

// ---------------------------------------------------------------------------------------
// The design system, as data

const TOKENS_FILE = "src/styles/tokens.css";
const TYPE_FILE = "src/styles/type.css";
const SHADER_FILE = "src/components/hero/beam.frag";

// DESIGN.md 4
const SPACING = new Set([0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 200]);
const RADIUS_CLASSES = new Set(["rounded-chip", "rounded-card", "rounded-pill", "rounded-none"]);
const RADIUS_VALUES = new Set(["var(--radius-chip)", "var(--radius-card)", "var(--radius-pill)", "inherit", "0"]);
const RADIUS_TOKEN_VALUES = new Set(["2px", "10px", "999px"]);

// Literal values that DESIGN.md itself gives and that sit off the 4px scale. Each one is
// allowed exactly where the document puts it and nowhere else.
const SPACING_EXCEPTIONS: Array<{ file: string; declaration: string; source: string }> = [
  { file: "src/styles/components.css", declaration: "padding: 14px 28px;", source: "DESIGN.md 6, PrimaryButton" },
  { file: "src/styles/components.css", declaration: "padding: 6px 14px;", source: "DESIGN.md 6, Pill" },
  { file: TOKENS_FILE, declaration: "--gutter:    clamp(20px, 4vw, 56px);", source: "DESIGN.md 4, page gutter" },
];

// Linear motion is allowed for the marquee and for scroll-scrubbed tweens whose code is
// given verbatim in MOTION.md, where the scrub itself supplies the easing.
const LINEAR_EXCEPTIONS: Array<{ file: string; match: string; source: string }> = [
  { file: "src/styles/components.css", match: "animation: marquee-loop 40s linear infinite;", source: "MOTION.md 1, the marquee" },
];

// Eases and durations must come from src/lib/gsap.ts. These files hold code that MOTION.md
// gives verbatim with its own literal values.
const MOTION_LITERAL_FILES = new Set(["src/lib/gsap.ts", "src/lib/useMagnetic.ts", "src/components/providers/SmoothScroll.tsx"]);

const FONT_STACKS = new Set([
  "var(--font-archivo), sans-serif",
  "var(--font-instrument), serif",
  "var(--font-mono), monospace",
]);
const FONT_IMPORTS = new Set(["Archivo", "Instrument_Serif", "JetBrains_Mono"]);

// ---------------------------------------------------------------------------------------
// Patterns. Banned words are assembled from pieces so this file passes its own checks.

const join = (...parts: string[]) => parts.join("");

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/;
const COLOUR_FN = new RegExp(join("\\b(?:rg", "ba?|hs", "la?|hwb|lab|lch|ok", "lab|ok", "lch)\\("));
// The two banned colour keywords, wherever they are used as a colour: a CSS value, a
// Tailwind class, or a colour attribute or style property. The same words in prose, such
// as an alt text describing a car, are not styling and are not flagged.
const KEYWORD = join("(?:bl", "ack|wh", "ite)");
const COLOUR_KEYWORD_CSS = new RegExp(`:[^;{}]*\\b${KEYWORD}\\b(?!-space)`, "i");
const COLOUR_KEYWORD_CLASS = new RegExp(`^(?:[a-z]+-)*${KEYWORD}(?:/\\d+)?$`);
const COLOUR_KEYWORD_PROP = new RegExp(
  `\\b(?:color|fill|stroke|background|backgroundColor|borderColor|outlineColor|stopColor|floodColor|caretColor)\\s*[:=]\\s*\\{?\\s*["'\`]${KEYWORD}["'\`]`,
  "i",
);
const DEFAULT_PALETTE = new RegExp(
  join(
    "^(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|accent|caret|divide|placeholder|shadow)-",
    "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}",
  ),
);
const DASHES = new RegExp(`[${[0x2012, 0x2013, 0x2014, 0x2015].map((code) => String.fromCharCode(code)).join("")}]`);
const PLACEHOLDER_COPY = new RegExp(join("lor", "em\\s+ips", "um|\\blor", "em\\b"), "i");
const EMOJI = /\p{Extended_Pictographic}/u;
const CONSOLE_CALL = new RegExp(join("\\bconsole\\.", "log\\("));
const TRANSITION_ALL = /transition(?:-property)?\s*:\s*all\b/;

const SPACING_UTILITY =
  /^-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|basis|scroll-m[trblxy]?|scroll-p[trblxy]?|translate-x|translate-y)-(\d+(?:\.\d+)?)$/;
const TYPE_UTILITY = new RegExp(
  join(
    "^(?:text-(?:xs|sm|base|lg|[2-9]?xl)",
    "|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|bl", "ack|sans|serif|mono)",
    "|leading-.+|tracking-.+)$",
  ),
);
const MOTION_UTILITY = /^(?:transition(?:-.+)?|duration-.+|ease-.+|delay-.+|animate-.+)$/;
const SHADOW_UTILITY = /^(?:shadow|shadow-.+|drop-shadow(?:-.+)?|inset-shadow-.+|text-shadow-.+)$/;
const ARBITRARY_COLOUR = /\[[^\]]*(?:#[0-9a-fA-F]{3,8}|rgb|hsl|color:)[^\]]*\]/;
const ARBITRARY_TYPE = /^(?:text|leading|tracking|font)-\[/;

// ---------------------------------------------------------------------------------------

function listFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" });
  return out
    .split("\n")
    .filter(Boolean)
    .filter((file) => fs.existsSync(file))
    .filter((file) => !/\.(?:jpe?g|png|webp|avif|gif|ico|woff2?|ttf|otf|pdf)$/i.test(file))
    .filter((file) => file !== "package-lock.json");
}

function report(rule: string, file: string, line: number, text: string) {
  findings.push({ rule, file, line, text: text.trim().slice(0, 160) });
}

// Every string literal in a TS or TSX file, split into class-like tokens
function classTokens(source: string): Array<{ token: string; line: number }> {
  const tokens: Array<{ token: string; line: number }> = [];
  const literal = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  for (const match of source.matchAll(literal)) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    const line = source.slice(0, match.index).split("\n").length;
    for (const raw of value.split(/\s+/)) {
      if (!raw) continue;
      // Drop variant prefixes such as xl: or hover:
      const token = raw.replace(/^(?:[a-z0-9-]+:)+/, "");
      tokens.push({ token, line });
    }
  }
  return tokens;
}

function checkShader(file: string, lines: string[], tokens: Record<string, string>) {
  const byHex = new Map(Object.entries(tokens).map(([name, hex]) => [hex.toUpperCase(), name]));
  lines.forEach((text, index) => {
    if (!HEX.test(text)) return;
    const match = text.match(/vec3\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\);\s*\/\/\s*(#[0-9A-Fa-f]{6})\s*$/);
    if (!match) {
      report("colour literal outside tokens.css", file, index + 1, text);
      return;
    }
    const hex = match[4].toUpperCase();
    if (!byHex.has(hex)) {
      report("shader constant is not one of the six tokens", file, index + 1, text);
      return;
    }
    const expected = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
    const actual = [match[1], match[2], match[3]].map(Number);
    if (expected.some((value, channel) => Math.abs(value - actual[channel]) > 0.0006)) {
      report("shader constant does not match its token comment", file, index + 1, text);
    }
  });
}

function readTokens(): Record<string, string> {
  const css = fs.readFileSync(TOKENS_FILE, "utf8");
  const tokens: Record<string, string> = {};
  for (const name of ["night", "pine", "smoke", "beam", "xenon", "oxide"]) {
    const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6});`));
    if (match) tokens[name] = match[1];
    else report("missing colour token", TOKENS_FILE, 1, `--${name}`);
  }
  return tokens;
}

function checkCss(file: string, lines: string[]) {
  lines.forEach((text, index) => {
    const line = index + 1;
    const declaration = text.trim();
    if (declaration.startsWith("/*") || declaration.startsWith("*")) return;

    if (TRANSITION_ALL.test(text)) report("transition: all", file, line, text);

    const shadow = declaration.match(/^box-shadow\s*:\s*(.+?);?$/);
    if (shadow && !["var(--glow-xenon)", "var(--glow-beam)", "none"].includes(shadow[1])) {
      report("box-shadow that is not one of the two glow tokens", file, line, text);
    }

    const family = declaration.match(/^font-family\s*:\s*(.+?);?$/);
    if (family && !FONT_STACKS.has(family[1])) report("font family outside the three", file, line, text);

    const radius = declaration.match(/^border(?:-[a-z-]+)?-radius\s*:\s*(.+?);?$/);
    if (radius && !RADIUS_VALUES.has(radius[1])) report("border radius outside the three", file, line, text);
    const radiusToken = declaration.match(/^--radius-[a-z]+\s*:\s*([^;]+);/);
    if (radiusToken && !RADIUS_TOKEN_VALUES.has(radiusToken[1].trim())) report("fourth radius value", file, line, text);

    if (file !== TYPE_FILE && /^(?:font-size|font-weight|letter-spacing|line-height|font-stretch)\s*:/.test(declaration)) {
      report("type property set outside type.css", file, line, text);
    }

    if (/^(?:margin|padding|gap|row-gap|column-gap|--section-y|--gutter|--grid-gap)[a-z-]*\s*:/.test(declaration)) {
      const allowed = SPACING_EXCEPTIONS.some((entry) => entry.file === file && entry.declaration === declaration.replace(/\s*\/\*.*$/, ""));
      if (!allowed) {
        for (const px of declaration.matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
          if (!SPACING.has(Math.abs(Number(px[1])))) report("spacing value off the 4px scale", file, line, text);
        }
      }
    }

    if (/\blinear\b/.test(declaration) && /^(?:transition|animation)/.test(declaration)) {
      const allowed = LINEAR_EXCEPTIONS.some((entry) => entry.file === file && declaration.includes(entry.match));
      if (!allowed) report("linear easing", file, line, text);
    }
  });
}

function checkScript(file: string, source: string, lines: string[]) {
  for (const { token, line } of classTokens(source)) {
    if (DEFAULT_PALETTE.test(token)) report("Tailwind default palette class", file, line, token);
    if (COLOUR_KEYWORD_CLASS.test(token) && token.includes("-")) report("colour keyword", file, line, token);
    if (ARBITRARY_COLOUR.test(token)) report("arbitrary colour value", file, line, token);
    if (ARBITRARY_TYPE.test(token) || TYPE_UTILITY.test(token)) report("type set by a utility instead of type.css", file, line, token);
    if (SHADOW_UTILITY.test(token)) report("shadow utility", file, line, token);
    if (/^rounded(?:-|$)/.test(token)) {
      const base = token.replace(/^rounded-(?:[trbl]|[tb][lr]|[se]|[se][se])-/, "rounded-");
      if (!RADIUS_CLASSES.has(base)) report("border radius outside the three", file, line, token);
    }
    const spacing = token.match(SPACING_UTILITY);
    if (spacing && !SPACING.has(Number(spacing[1]))) report("spacing value off the 4px scale", file, line, token);
  }

  // Motion utilities are only checked inside className attributes, where they are classes
  for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const line = source.slice(0, match.index).split("\n").length;
    for (const raw of (match[1] ?? match[2] ?? "").split(/\s+/)) {
      const token = raw.replace(/^(?:[a-z0-9-]+:)+/, "");
      if (MOTION_UTILITY.test(token)) report("motion set by a utility instead of the motion tokens", file, line, token);
    }
  }

  lines.forEach((text, index) => {
    const line = index + 1;
    if (/\bfontFamily\b|font-family=/.test(text)) report("font family set outside type.css", file, line, text);
    if (/\b(?:fontSize|fontWeight|letterSpacing|lineHeight)\s*:/.test(text)) report("type property set inline", file, line, text);
    if (/\bboxShadow\b/.test(text)) report("box-shadow set inline", file, line, text);
    if (CONSOLE_CALL.test(text)) report("console output left in", file, line, text);

    if (!MOTION_LITERAL_FILES.has(file)) {
      if (/\bease:\s*["'](?!none["'])/.test(text)) report("ease named outside src/lib/gsap.ts", file, line, text);
      if (/\bease:\s*["'](?:none|linear)["']/.test(text) && !/scrub-eased/.test(text)) {
        report("linear easing", file, line, text);
      }
    }
  });

  const fontImport = source.match(/import\s*\{([^}]+)\}\s*from\s*"next\/font\/google"/);
  if (fontImport) {
    for (const name of fontImport[1].split(",").map((part) => part.trim()).filter(Boolean)) {
      if (!FONT_IMPORTS.has(name)) report("fourth font family", file, 1, name);
    }
  }
}

// ---------------------------------------------------------------------------------------
// Dependencies. Every package in package.json has to be used by something: imported or
// named in a source or config file, run by an npm script, needed beside a package that is
// used, or the types of one.

const SELF = "scripts/audit.ts";

function checkDependencies(files: string[]) {
  const manifestSource = fs.readFileSync("package.json", "utf8");
  const manifest = JSON.parse(manifestSource) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const names = [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];

  // This file names packages in order to check them, which is not a use of them
  const sources = files
    .filter((file) => file !== "package.json" && file !== SELF && !file.startsWith("docs/"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const named = (name: string) => new RegExp(`["']${escaped(name)}(?:/[^"']*)?["']`).test(sources);
  const commands = new Set(Object.values(manifest.scripts ?? {}).flatMap((command) => command.split(/\s+/)));

  const used = new Set(names.filter((name) => named(name) || commands.has(name)));
  // The compiler is used by the presence of its config, not by an import
  if (fs.existsSync("tsconfig.json")) used.add(join("type", "script"));

  // A package that a used package asks to have installed beside it
  for (const name of [...used]) {
    try {
      const peers = JSON.parse(fs.readFileSync(`node_modules/${name}/package.json`, "utf8")).peerDependencies ?? {};
      for (const peer of Object.keys(peers)) used.add(peer);
    } catch {
      // Not installed, so there is nothing to read
    }
  }

  // Type packages follow the package they describe. Node's own are used by any node: import.
  const prefix = join("@ty", "pes/");
  for (const name of names) {
    if (!name.startsWith(prefix)) continue;
    const target = name.slice(prefix.length).replace("__", "/");
    if (target === "node" ? /from "node:/.test(sources) : used.has(target) || used.has(`@${target}`)) used.add(name);
  }

  const lines = manifestSource.split("\n");
  for (const name of names) {
    if (used.has(name)) continue;
    report("unused dependency", "package.json", lines.findIndex((text) => text.includes(`"${name}":`)) + 1, name);
  }
}

function main() {
  const tokens = readTokens();
  const files = listFiles();

  checkDependencies(files);

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const lines = source.split("\n");
    const isDocs = file.startsWith("docs/");

    lines.forEach((text, index) => {
      if (DASHES.test(text)) report("em dash or en dash", file, index + 1, text);
    });
    if (isDocs) continue;

    lines.forEach((text, index) => {
      const line = index + 1;
      if (PLACEHOLDER_COPY.test(text)) report("placeholder copy", file, line, text);
      if (EMOJI.test(text)) report("emoji", file, line, text);
      if (file.endsWith(".css") || file.endsWith(".frag")) {
        if (COLOUR_KEYWORD_CSS.test(text)) report("colour keyword", file, line, text);
      } else if (COLOUR_KEYWORD_PROP.test(text)) {
        report("colour keyword", file, line, text);
      }
      if (file === TOKENS_FILE || file === SHADER_FILE) return;
      if (HEX.test(text) || COLOUR_FN.test(text)) report("colour literal outside tokens.css", file, line, text);
    });

    if (file === SHADER_FILE) checkShader(file, lines, tokens);
    if (file.endsWith(".css")) checkCss(file, lines);
    if (file.startsWith("src/") && /\.tsx?$/.test(file)) checkScript(file, source, lines);
  }

  if (findings.length === 0) {
    console.info("Design audit passed. Nothing on the ban list was found.");
    return;
  }

  const byRule = new Map<string, Finding[]>();
  for (const finding of findings) byRule.set(finding.rule, [...(byRule.get(finding.rule) ?? []), finding]);
  for (const [rule, list] of byRule) {
    console.error(`\n${rule} (${list.length})`);
    for (const finding of list) console.error(`  ${finding.file}:${finding.line}  ${finding.text}`);
  }
  console.error(`\nDesign audit failed with ${findings.length} finding${findings.length === 1 ? "" : "s"}.`);
  process.exit(1);
}

main();
