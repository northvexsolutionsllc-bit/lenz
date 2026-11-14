# Lenz Rescue

The website for Lenz Rescue, mobile headlight restoration in Antioch, Brentwood, Pittsburg and Oakley, California.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP, Lenis and three.js.

## The specification

Everything about this site is specified in `docs/`. Read these before changing anything.

| File | What it decides |
|---|---|
| `docs/DESIGN.md` | Colour, type, space, radius, imagery and components. The single source of truth. |
| `docs/MOTION.md` | Easing, duration, scroll behaviour, the hero shader and the performance budget. |
| `docs/CONTENT.md` | Every word on the site, the routes, alt text and structured data. |
| `docs/DECISIONS.md` | Why things are the way they are. |
| `docs/AUDIT.md` | The old site, as found, and what the rebuild has to prove. |
| `docs/PROMPTS.md` | The staged build plan. |

Three rules hold everywhere:

1. Every colour, font, spacing value, radius and easing curve comes from `docs/DESIGN.md` and `docs/MOTION.md`.
2. Every word of user-facing copy comes from `docs/CONTENT.md`, verbatim.
3. No em dashes and no en dashes, anywhere.

## Commands

```bash
npm install
npm run dev            # development server on http://localhost:3000
npm run build          # production build
npm run start          # serve the production build
npm run lint           # ESLint
npm run audit:design   # checks the whole repo against the ban list in DESIGN.md section 7
npm run shots -- /styleguide   # QA screenshots, saved to docs/qa/<route>/
```

`dev`, `build` and `lint` first run `npm run generate`, which writes a few files derived from the source (see `scripts/generate.ts`). Those files are not committed.

`npm run shots` needs a production build and a Chromium for Playwright (`npx playwright install chromium`). Add `--full` to also save each page top to bottom.

## Where things live

| Path | Contents |
|---|---|
| `src/styles/tokens.css` | Every design token. The only file allowed to contain a colour value. |
| `src/styles/type.css` | The type scale, one class per style. |
| `src/styles/components.css` | Component states and transitions. |
| `src/components/ui` | The component set from DESIGN.md section 6. |
| `src/content` | Copy and data, taken from CONTENT.md. |
| `src/app/styleguide` | Every token, type style and component on one page. Not indexed. |
| `public/media` | Client supplied media, under the exact filenames in DESIGN.md section 5. |

Spacing utilities use the pixel value as the class number: `p-16` is 16px and `gap-24` is 24px. Only the steps on the 4px scale in DESIGN.md section 4 exist.
