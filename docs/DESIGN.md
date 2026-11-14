# DESIGN.md

Lenz Rescue. Mobile headlight restoration. Antioch, Brentwood, Pittsburg, Oakley, California.

This file is the single source of truth for colour, type, space and components. No value in this
document may be changed, interpreted or "improved" during a build. If something is not in here, ask
before inventing it.

---

## 1. The concept: Night Drive

The product turns a hazy amber lens into a clear white beam. The site does the same thing to itself.

Three rules follow from that, and every design decision in this file obeys them.

1. **Amber is the problem. Cool white is the solution.** Amber (`--oxide`) only ever appears where we
   are showing haze, oxidation, the "before" state, or a caution. Cool white (`--beam`) and xenon blue
   (`--xenon`) only ever appear where we are showing clarity, the "after" state, or an action we want
   taken. These two families never get swapped and never get mixed decoratively.
2. **Light is the only elevation.** This is a dark site. Nothing is lifted with a black drop shadow.
   Things are lifted by being a lighter surface, or by glowing. Black shadows on a dark ground are the
   single fastest way to make a site look cheap.
3. **The page gets clearer as you scroll.** The hero is the haziest thing on the site. Grain, blur and
   amber tint reduce section by section until the contact section is the cleanest, sharpest screen on
   the site. This is a global scroll-driven value, not a per-section decision. See MOTION.md section 4.

---

## 2. Colour

### 2.1 The six

Six colours. Nothing else. No greys mixed by hand, no "slightly darker version", no Tailwind default
palette, no `#000`, no `#fff`, no `gray-800`. Every surface, border, text colour and state in the whole
codebase resolves to one of these six or to one of the opacity variants in 2.2.

| Token | Hex | Name | Used for |
|---|---|---|---|
| `--night` | `#04100A` | Night | Page ground. The darkest thing on the site. Text colour on top of `--beam` and `--oxide`. |
| `--pine` | `#07170F` | Pine | The client's existing brand dark. Alternating section bands, header background after scroll. |
| `--smoke` | `#13251C` | Smoke | Raised surfaces: cards, form fields, image frames, the mobile menu sheet. |
| `--beam` | `#EAF6FF` | Beam | Primary text. Primary button fill. The restored light. |
| `--xenon` | `#7CC6F5` | Xenon | Accent. Links, focus ring, active states, glow colour, the slider seam, numerals. |
| `--oxide` | `#C8822F` | Oxide | The "before" state only. Haze tint, the before half of comparisons, caution notes, the vehicle-guide "may need replacement" tier. |

```css
:root {
  --night:  #04100A;
  --pine:   #07170F;
  --smoke:  #13251C;
  --beam:   #EAF6FF;
  --xenon:  #7CC6F5;
  --oxide:  #C8822F;
}
```

### 2.2 The seven opacity variants

All seven are derived from `--beam` only. Do not create opacity variants of any other colour except
the two glow values named in 2.4.

```css
:root {
  --beam-04: rgba(234, 246, 255, 0.04);  /* section band tint over night */
  --beam-08: rgba(234, 246, 255, 0.08);  /* card fill over pine */
  --beam-12: rgba(234, 246, 255, 0.12);  /* hairline borders, dividers, input borders */
  --beam-24: rgba(234, 246, 255, 0.24);  /* disabled text, inactive icons */
  --beam-54: rgba(234, 246, 255, 0.54);  /* captions, meta, eyebrow secondary */
  --beam-62: rgba(234, 246, 255, 0.62);  /* body copy on dark. This is the default paragraph colour. */
  --beam-80: rgba(234, 246, 255, 0.80);  /* lead paragraph, sub-headings */
}
```

Body copy is `--beam-62`, not `--beam`. Full-strength `--beam` is reserved for headings, numerals and
primary buttons. Using full white for every paragraph is what makes a dark site feel flat and loud.

### 2.3 Contrast rules, non-negotiable

Measured against the backgrounds they are actually used on.

Every figure below was computed, not estimated. Alpha values are composited against the stated
background first, then measured. The three backgrounds are the only three that exist.

| Foreground | on `--night` | on `--pine` | on `--smoke` | Verdict |
|---|---|---|---|---|
| `--beam` | 17.65 | 16.80 | 14.61 | Pass AAA everywhere. Headings, numerals. |
| `--beam-80` | 11.34 | 10.91 | 9.76 | Pass AAA. Lead paragraphs. |
| `--beam-62` | 7.13 | 6.93 | 6.44 | Pass AAA on night, AA elsewhere. Body copy. |
| `--beam-54` | 5.59 | 5.52 | 5.22 | Pass AA. Captions and eyebrows only, minimum 14px. |
| `--beam-24` | 2.01 | 2.07 | 2.10 | **Fails everything. Decorative and disabled only.** |
| `--xenon` | 10.38 | 9.88 | 8.60 | Pass AAA. Accent, links, focus ring. |
| `--oxide` | 6.17 | 5.88 | 5.11 | Pass AA at all sizes. |

Reverse pairs, for text sitting on a filled element:

| Pair | Ratio | Verdict |
|---|---|---|
| `--night` on `--beam` | 17.65 | Pass AAA. This is the primary button. |
| `--night` on `--xenon` | 10.38 | Pass AAA |
| `--night` on `--oxide` | 6.17 | Pass AA |
| `--beam` on `--oxide` | 2.86 | **FAIL. Forbidden.** |
| `--xenon` on `--oxide` | 1.68 | **FAIL. Forbidden.** |

**The one rule to remember: any text sitting on `--oxide` is `--night`. Never `--beam`, never `--xenon`.**

`--beam-24` is for disabled and decorative states only. It must never carry information, and it must
never be used for a border that communicates a boundary. Hairlines are `--beam-12` and that is fine
because a 1px rule is not text.

`--beam-54` was set at 54 percent rather than a rounder 50 because at 48 percent it measures 4.41 on
`--smoke`, which fails AA. Do not round it down.

### 2.4 Glow

Glow replaces shadow everywhere. Two values only.

```css
:root {
  --glow-xenon: 0 0 64px -12px rgba(124, 198, 245, 0.45);
  --glow-beam:  0 0 80px -16px rgba(234, 246, 255, 0.35);
}
```

`--glow-xenon` is for interactive focus and active states. `--glow-beam` is for the hero beam, the
comparison slider seam, and the primary button on hover. Nothing else glows. If everything glows,
nothing reads as light.

`box-shadow` with any black or rgba(0,0,0,...) value is banned from the codebase.

### 2.5 Tailwind v4 mapping

All of the above live in `src/styles/tokens.css` and nowhere else. Map them into `@theme` with these
names exactly:

```css
@theme {
  --color-night: var(--night);
  --color-pine:  var(--pine);
  --color-smoke: var(--smoke);
  --color-beam:  var(--beam);
  --color-xenon: var(--xenon);
  --color-oxide: var(--oxide);
}
```

Usage is then `bg-night`, `text-beam`, `border-xenon` and so on. No arbitrary values. `text-[#fff]`,
`bg-[rgba(...)]` and `bg-black/40` are all banned.

---

## 3. Type

Three families. No fourth family anywhere, including inside SVGs and the favicon.

| Role | Family | Source | Why |
|---|---|---|---|
| Display and UI | **Archivo** (variable, `wght` 100 to 900, `wdth` 62 to 125) | `next/font/google` | Technical grotesk with a real width axis. The width axis is used for the scroll animation in MOTION.md 5.3. Nothing else on Google Fonts gives us that at this quality. |
| Accent | **Instrument Serif**, italic only | `next/font/google` | One or two words per heading, set in italic serif. This carries over the italic second half of the client's existing H1 ("Bring clarity *back to the road.*"), so it is their idea, kept and made deliberate. |
| Mono | **JetBrains Mono** (`wght` 400 to 600) | `next/font/google` | Labels, numerals, step numbers, prices, the service-area ticker. Tabular figures. |

`src/app/fonts.ts`:

```ts
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});
```

Applied on `<html>` as `${archivo.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`.
Body defaults to `var(--font-archivo)`.

### 3.1 The type scale

Every one of these is built as a utility class in `src/styles/type.css` or as a small component. No
component sets its own font-size, weight, tracking or line-height inline. Sizes use `clamp()` tuned
for a 390px to 1440px viewport range.

| Style | Family | Size | Weight / width | Line height | Tracking | Case |
|---|---|---|---|---|---|---|
| `.wordmark` | Archivo | `clamp(1.0625rem, 0.98rem + 0.35vw, 1.25rem)` | 700 / wdth 110 | 1 | `0.14em` | uppercase |
| `.display` | Archivo | `clamp(3rem, 1.1rem + 9.4vw, 9.5rem)` | 600 / wdth 88 | 0.90 | `-0.035em` | sentence |
| `.h2` | Archivo | `clamp(2.25rem, 1.3rem + 4.2vw, 5rem)` | 600 / wdth 92 | 0.96 | `-0.028em` | sentence |
| `.h3` | Archivo | `clamp(1.375rem, 1.2rem + 0.9vw, 2rem)` | 600 / wdth 100 | 1.12 | `-0.015em` | sentence |
| `.kinetic` | Archivo | `clamp(4rem, 0.5rem + 15vw, 15rem)` | 700 / wdth 70 | 0.84 | `-0.045em` | uppercase |
| `.numeral` | JetBrains Mono | `clamp(2rem, 1.4rem + 2.8vw, 3.75rem)` | 500 | 1 | `-0.02em` | lining, `tabular-nums` |
| `.body-l` | Archivo | `clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)` | 400 / wdth 100 | 1.48 | `-0.01em` | sentence |
| `.body` | Archivo | `1.0625rem` | 400 / wdth 100 | 1.62 | `0` | sentence |
| `.small` | Archivo | `0.875rem` | 400 / wdth 100 | 1.5 | `0` | sentence |
| `.caps` | JetBrains Mono | `0.75rem` | 500 | 1.3 | `0.18em` | uppercase |
| `.accent` | Instrument Serif | inherit | 400 italic | inherit | `-0.01em` | sentence |

`.accent` is an inline span used inside `.display` and `.h2` only. It is optically about 6 percent
larger than the grotesk around it at the same font-size, so set `font-size: 1.06em` on it. Maximum one
`.accent` span per heading. Two italic serif phrases in one heading looks like an accident.

### 3.2 Colour defaults per style

- `.display`, `.h2`, `.h3`, `.kinetic`, `.numeral` are `--beam`
- `.accent` is `--xenon`
- `.body-l` is `--beam-80`
- `.body`, `.small` are `--beam-62`
- `.caps` is `--beam-54`, except inside an active or hovered element where it is `--xenon`

### 3.3 Measure

Paragraph containers are capped at `62ch`. Lead paragraphs under a heading are capped at `52ch`.
Nothing on this site is a full-bleed line of running text.

---

## 4. Space and grid

4px base unit. Only these steps exist:

`4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 200` (px)

Section vertical rhythm: `clamp(96px, 12vw, 200px)` top and bottom. Sections do not vary their own
padding. A section that needs to feel bigger gets more content, not more padding.

Grid: 12 columns, max width `1440px`, page gutter `clamp(20px, 4vw, 56px)`, column gap `24px`.
A narrow content rail at 8 columns (desktop) centred is the default for text blocks.

Radius: exactly three values. `2px` for chips and tags, `10px` for cards, buttons, inputs and image
frames, `999px` for pills and the cursor ring. A fourth radius anywhere is a bug.

Hairlines are `1px solid var(--beam-12)`. Never `--beam-24` or above for a static border.

---

## 5. Imagery

The client currently has five work photos and nothing else usable. See AUDIT.md section 3.

Treatment rules:

- Every work photo sits in a `10px` radius frame with a `1px solid var(--beam-12)` hairline and
  **no shadow**.
- Photos are never shown raw. Apply this filter stack so mixed-quality phone photos sit together:
  `filter: saturate(0.88) contrast(1.06) brightness(0.96);` plus a `--night` overlay at 18 percent
  using `mix-blend-mode: multiply` on a pseudo element. On hover the overlay goes to 0 and the filter
  goes to `saturate(1) contrast(1.02) brightness(1)` over 640ms. That is the "clarity on hover" move.
- Before images additionally carry `--oxide` at 14 percent with `mix-blend-mode: color`. After images
  carry `--xenon` at 8 percent. This makes a set of inconsistent phone photos read as a deliberate
  before/after system.
- Aspect ratios: hero media `16/9`, gallery tiles `4/3`, comparison pairs `3/2`, portrait of the owner
  `4/5`. No other ratios.
- Every image gets real alt text describing the vehicle and the state. `"Headlight restoration
  previous work"` five times is not alt text. See CONTENT.md section 9.

**Asset slots the client must supply.** Build with these exact filenames so the real files drop in
without a code change. Until they arrive, render the `PlaceholderFrame` component (section 6) which
shows the slot name and required ratio.

```
public/media/hero-poster.jpg          16/9   night shot of a car front end, lights on
public/media/before-01.jpg .. -06.jpg 3/2    yellowed lens, shot square on
public/media/after-01.jpg  .. -06.jpg 3/2    same lens restored, same angle, same light
public/media/gallery-01.jpg .. -12.jpg 4/3   finished work
public/media/owner.jpg                4/5    Adain, working, not posed
public/media/process-01..04.jpg       3/2    sanding, compounding, polishing, coating
public/media/logo.svg                        redrawn vector logo, see AUDIT.md 5
```

---

## 6. Components

Built in `src/components/ui`. Every one of these is a real component with the states listed. No
one-off markup in page files.

**Header.** Transparent over the hero. After 100px of scroll it becomes `--pine` at 72 percent with
`backdrop-filter: blur(16px)` and gains a `--beam-12` bottom hairline. Hides on scroll down, shows on
scroll up, 320ms. Right side holds a `.caps` phone number and the primary button. Mobile: full-screen
`--smoke` sheet, links set in `.h3`, staggered in at 60ms each.

**PrimaryButton.** `--beam` fill, `--night` label, `10px` radius, `14px 28px` padding, `.caps` label.
Hover: `--glow-beam` plus a 2 percent scale. Magnetic on fine pointers only, 0.35 strength, 18px max
travel. Never magnetic on touch.

**SecondaryButton.** Transparent fill, `1px solid var(--beam-24)` border, `--beam` label. Hover: border
goes `--xenon`, label goes `--xenon`, background goes `--beam-04`.

**TextLink.** `--beam` label with a `1px` underline in `--beam-24` sitting 4px below the baseline. On
hover the underline wipes to `--xenon` left to right over 320ms.

**Pill.** `--beam-08` fill, `.caps` label, `999px` radius, `6px 14px`. Used for service areas and tags.

**Eyebrow.** `.caps` in `--beam-54` preceded by a `24px` wide `1px` rule in `--xenon`. Sits above every
H2 on the site.

**Counter.** `.numeral`, counts from 0 to its target when it enters the viewport, 1200ms, `--ease-beam`.
Used for `$125`, `3` year guarantee, and the review count once there are reviews.

**CompareSlider.** The most important component on the site. Full spec in MOTION.md section 6.

**GlassCard.** `--smoke` fill, `--beam-12` hairline, `10px` radius, `32px` padding. On hover the
hairline goes to `--xenon` at 40 percent and the card lifts by 2px. No shadow.

**StepRow.** A numbered process row. `.numeral` in `--xenon` at 40 percent, `.h3` title, `.body` copy.
The number is `01`, `02`, `03` with a leading zero, set in mono.

**Marquee.** Service areas and vehicle makes, `.caps`, scrolling horizontally at 40s per loop,
`--beam-54`, pauses on hover, respects reduced motion by becoming static.

**Cursor.** Fine pointers only. A `28px` ring, `1px solid var(--beam-54)`, `999px`. Over a gallery
image it grows to `96px`, fills with `--beam-04`, and the image under it loses its haze overlay
inside the ring using a CSS mask. Over a button it shrinks to `8px` and fills `--xenon`. Off entirely
for `prefers-reduced-motion` and for coarse pointers.

**PlaceholderFrame.** Correct aspect ratio, `--smoke` fill, `--beam-12` dashed hairline, centred
`.caps` label showing the expected filename and ratio. Ships in the repo and is removed in the final
pass once real media lands.

**Footer.** `--night` ground, three columns on desktop, stacked on mobile. Service areas as Pills, the
phone and email as TextLinks, Facebook and Instagram icons at `20px` in `--beam-54`. No Venmo icon and
no unlinked Square icon. See DECISIONS.md 7.

### 6.1 Focus

Every interactive element, with no exception and no `:focus-visible` opt-out for mouse users:

```css
outline: 2px solid var(--xenon);
outline-offset: 3px;
border-radius: inherit;
```

---

## 7. What is banned

A build is not finished if any of these appear anywhere in the repository.

1. Any hex, `rgb()`, `rgba()` or `hsl()` value outside `src/styles/tokens.css`
2. `#000`, `#fff`, `black`, `white` as colour keywords
3. Any Tailwind default palette class: `bg-gray-900`, `text-slate-400`, `border-zinc-800` and so on
4. Arbitrary Tailwind values for colour, for example `bg-[#0a0a0a]`
5. `box-shadow` containing black or any `rgba(0,0,0,...)`
6. A fourth font family, including inside inline SVG
7. A fourth border radius value
8. A spacing value not on the 4px scale in section 4
9. Em dashes and en dashes, in code, in copy, in comments, in commit messages
10. Lorem ipsum, in any file, at any stage
11. Stock photography of any kind
12. `transition: all`
13. A linear easing curve on anything a human sees move
14. Emoji used as an icon
