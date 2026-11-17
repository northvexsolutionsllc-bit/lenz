# Lenz Rescue

The website for Lenz Rescue, mobile headlight restoration in Antioch, Brentwood, Pittsburg and Oakley, California.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP and Lenis.

To run it, change a price, add a photo or add a location page, read `docs/HANDOVER.md`.

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
| `docs/HANDOVER.md` | How to run it and how to change it, and what is still waiting on the owner. |

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
npm run audit:design   # the ban list in DESIGN.md section 7, and unused dependencies
npm run audit:copy     # every word on every route against CONTENT.md
npm run audit:seo      # sitemap, structured data, metadata, alt text, location pages
npm run audit:a11y     # axe, a keyboard walk and contrast on every route, and the hero measured
npm run audit:perf     # the budget in MOTION.md section 9, on the home route
npm run audit:owner    # everything still waiting on the owner, read from the source
npm run shots          # QA screenshots of every route, saved to docs/qa/<route>/
```

`dev`, `build` and `lint` first run `npm run generate`, which writes a few files derived from the source (see `scripts/generate.ts`). Those files are not committed.

Set `NEXT_PUBLIC_SITE_URL` to the address the site is served from before building. Only `https://lenzrescue.com` is indexable: any other address builds a staging copy that says `noindex` on every page. See `docs/HANDOVER.md` section 1.

Every audit except `audit:design` reads the production build in a browser, so run `npm run build` first. They need a Chromium for Playwright (`npx playwright install chromium`). `npm run shots -- /gallery --full` captures one route and also saves the page top to bottom.

## Where things live

| Path | Contents |
|---|---|
| `src/styles/tokens.css` | Every design token. The only file allowed to contain a colour value. |
| `src/styles/type.css` | The type scale, one class per style. |
| `src/styles/components.css` | Component states and transitions. |
| `src/components/ui` | The component set from DESIGN.md section 6. |
| `src/components/sections` | The page sections, each built from the component set. |
| `src/content` | Copy and data, taken from CONTENT.md. |
| `src/app/styleguide` | Every token, type style and component on one page. Not indexed. |
| `public/media` | Client supplied media, under the exact filenames in DESIGN.md section 5. |

Spacing utilities use the pixel value as the class number: `p-16` is 16px and `gap-24` is 24px. Only the steps on the 4px scale in DESIGN.md section 4 exist.
