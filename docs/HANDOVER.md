# HANDOVER.md

The Lenz Rescue site as it stands at the end of the build: how to run it, how to change the things
that will change, what is still waiting on the owner, and what was measured.

The specification is the other files in this folder. This file does not repeat them. Where this file
and DESIGN.md, MOTION.md or CONTENT.md disagree, those three win and this file is wrong.

---

## 1. Run it

You need Node 20.9 or later (it was built on Node 22) and npm.

```bash
npm install
npm run dev
```

The site is then at `http://localhost:3000`. For the production build:

```bash
npm run build
npm run start
```

Three things to know:

- `dev`, `build` and `lint` each run `npm run generate` first. It writes a handful of files that are
  worked out from the source and are not committed: the colour tokens for the few places outside
  CSS that need them, the page grain, the hero poster, the haze layer under the beam, the share
  image, the tab icon and the build date. `scripts/generate.ts` lists each one.
- The build needs the dev dependencies, because `generate` runs on `tsx` and `sharp`. A host that
  installs with dev dependencies left out will fail at that step.
- Every page is static. There is no database, no environment variable and no server code to
  configure. The production address is one line, `url` in `src/content/site.ts`.

`AGENTS.md` in the repository root is written by `next dev` for coding agents and is ignored by git.
Leave it alone.

---

## 2. Check it

Run these before anything is published. Each one prints a report and exits with an error if it
finds a problem. All but the first two read the production build in a browser, so run
`npm run build` before them.

| Command | What it proves |
|---|---|
| `npm run lint` | ESLint, with the Next.js rules. |
| `npm run audit:design` | Nothing on the ban list in DESIGN.md section 7: no colour outside `tokens.css`, no fourth font, no fourth radius, no spacing off the scale, no dashes, no placeholder copy, no console output, no unused dependency. |
| `npm run audit:copy` | Every word on every route is in CONTENT.md, and every line CONTENT.md gives a route is on it. |
| `npm run audit:seo` | The sitemap, the structured data, titles and descriptions, alt text, that no two location pages share a paragraph, and that every route is whole with script off. |
| `npm run audit:a11y` | axe on every route at both sizes and with the menu open, a keyboard walk of every route, every contrast pair, and everything set over the hero beam measured against the pixels behind it. |
| `npm run audit:perf` | The first five rows of the budget in MOTION.md section 9, on the home route. |
| `npm run audit:owner` | Not a test. The list of everything still waiting on the owner. |
| `npm run shots` | Screenshots of every route at 1440x900 and 390x844, each also under reduced motion, into `docs/qa/<route>/`. |

Add `-- --out=docs/qa` to an audit to save its report beside the screenshots. The reports from the
handover run are there now.

The browser the audits drive is Playwright's Chromium. Install it once with
`npx playwright install chromium`, or point `CHROMIUM_PATH` at a Chromium you already have.

---

## 3. Where things live

| Path | What is in it |
|---|---|
| `docs/` | The specification, this file, and `docs/qa/` with the QA reports and screenshots. |
| `src/content/` | Every word and every piece of data. If you are changing what the site says, you are in this folder. |
| `src/app/` | One folder per route. Each `page.tsx` only arranges sections and sets the page's title, description and structured data. |
| `src/components/sections/` | The page sections. |
| `src/components/ui/` | The component set from DESIGN.md section 6. |
| `src/components/hero/`, `process/`, `providers/` | The hero and its beam, the pinned process, and smooth scrolling, the clarity curve and the page transition. |
| `src/styles/` | `tokens.css`, `type.css`, `base.css`, `components.css`. |
| `src/lib/` | Small shared pieces: motion values, media lookup, metadata, structured data. |
| `scripts/` | Generation, the audits and the screenshots. |
| `public/media/` | The photos, under the exact filenames in DESIGN.md section 5. |
| `lenzrescue-assets/` | The client's original files, untouched. `npm run media` cuts the photos in `public/media` out of them. |

`/styleguide` shows every token, type style and component on one page. It is not in the sitemap and
is not indexed.

---

## 4. Where the tokens live

**`src/styles/tokens.css` is the only place a colour value may be written.** It holds the six
colours, the seven beam opacities, the two glows, the three easing curves, the four durations, the
spacing scale, the three radii and the grid. The same file maps them into Tailwind, with every
Tailwind default cleared first, so a class that is not in the design system does not exist.

Around it:

| What | Where | Note |
|---|---|---|
| Type scale | `src/styles/type.css` | One class per style in DESIGN.md section 3. |
| The three fonts | `src/app/fonts.ts` | Loaded with `next/font`. |
| Easing and duration for GSAP | `src/lib/gsap.ts` | `EASE` and `DUR`, the script twins of the CSS values. Nothing else may name an ease or a duration. |
| Colours outside CSS | `src/generated/tokens.ts` | Written by `generate` from `tokens.css`. Never edit it. |
| The shader's colours | `src/components/hero/beam.frag` | Four constants, each with its token's value beside it in a comment. |

Spacing classes use the pixel value as the number: `p-16` is 16px, `gap-24` is 24px.

To change a token: change it in DESIGN.md or MOTION.md first, then in `tokens.css`. The seven beam
opacities and the two glows in that file repeat the beam and xenon values as numbers, so change those
lines with them. If the colour is one of the four the shader uses (night, oxide, xenon, beam), change
the matching constant in `beam.frag` too: `npm run audit:design` fails until the two agree. Then
`npm run audit:a11y` works every contrast pair out again from the new values.

---

## 5. Change a price

CONTENT.md is the source of the copy, and `npm run audit:copy` compares the site with it. So a price
changes in CONTENT.md first, then here.

**The starting price, $125**, is written in four places:

1. `src/content/home.ts`: `hero.stats`, the first entry, and `pricing.price`. These are numbers,
   `value: 125`.
2. `src/content/pages.ts`: the meta description of the headlight restoration page, "from $125".
3. `src/content/locations.ts`: the four meta titles, "From $125".
4. `docs/CONTENT.md`: the hero stat, the pricing heading, that meta description, the location title
   pattern and the `minPrice` line in section 10.

The price in the structured data follows `pricing.price` by itself. The two `$125` on `/styleguide`
are specimens and can be left or changed to match.

Then:

```bash
npm run build
```

```bash
npm run audit:copy
```

```bash
npm run audit:seo
```

**The prices that do not exist yet.** The fog light add-on price and the dealer volume pricing are
owed by the owner and show as TODO chips. They have no layout either, because there has been nothing
to lay out. When they arrive: write the copy into CONTENT.md sections 3.8, 5 and 6, add it to
`pricing.inclusions` in `src/content/home.ts`, and to `fog.pricing` and `dealer.volume` in
`src/content/pages.ts`, and set each `todo` to `null` or delete it. The chip goes with it. The two
service pages leave the price out of their structured data until then: pass `minPrice` to
`serviceSchema` in their `page.tsx` once there is one.

---

## 6. Add a gallery item

A gallery tile is one photo of finished work, at 4/3.

1. Save the photo as `public/media/gallery-NN.jpg`, where `NN` is the slot number. Slots 06 to 12
   are already waiting. The site resizes and re-encodes it, and applies the treatment in DESIGN.md
   section 5, so save it at full size and do not edit the colour.
2. Open `src/content/media.ts` and find the slot in `gallery`. Set `service` to `"headlight"`,
   `"fog"` or `"dealer"`, which is what the filter on `/gallery` reads, and fill in `vehicle`:

   ```ts
   { id: "06", service: "headlight", vehicle: { description: "silver sedan", year: 2014, make: "Honda", model: "Accord", city: "Antioch" } },
   ```

   `description` is what can be seen, and is used alone when the rest is not known. With the year,
   make and model the alt text follows the pattern in CONTENT.md section 9. Add the city too if it
   is known.
3. Build and check:

   ```bash
   npm run build
   ```

   ```bash
   npm run audit:seo
   ```

   The audit fails if two different photos end up with the same alt text, which is what happens if
   two entries share a `description` and nothing else.

The frame that read `gallery-06.jpg` is replaced by the photo. Nothing else changes. The home page
and the headlight page show the first six tiles, `/gallery` shows all of them.

For a 13th tile, add an entry with `id: "13"` to the end of `gallery`, and add the slot to the list
in DESIGN.md section 5.

**A before and after pair** works the same way: `before-NN.jpg` and `after-NN.jpg` at 3/2, the same
lens from the same angle, and the `vehicle` filled in under `pairs` in the same file. `FEATURED_PAIR`
there chooses the pair in the slider on the home page. To show a pair on a location page, add its
number to that city's `pairs` in `src/content/locations.ts`, three at most.

Photos are read at build time. A new file shows after the next build, or at once under `npm run dev`.

One trap: a photo replaced under the same filename can go on showing as it was for up to four
hours. The site serves resized copies, and it keeps each copy under the address it was asked for.
Delete the folder `.next/cache/images` and restart, or redeploy without the build cache, to see the
new one at once. The generated hero poster does not have this problem, because its name changes
when its contents do.

---

## 7. Add a location page

A location page is real content about one city, not a template with the name swapped.
`npm run audit:seo` fails if two of them share a paragraph, or if one opening is another's with the
city changed.

1. **CONTENT.md section 8.** Add the city to the table with the local detail the opening must
   mention, and write the opening there: 70 to 100 words that are about that city.
2. **`src/content/area.ts`.** Add the city and its coordinates to `cities`. The service circle in
   the structured data is worked out from this list.
3. **`src/content/locations.ts`.** Add an entry: `slug`, `city`, `title`, `metaTitle`,
   `mustMention`, `opening`, `neighbourhoods` and `pairs`. The slug follows the others:
   `headlight-restoration-<city>-ca`.
4. **`src/app/<slug>/page.tsx`.** Copy one of the four existing folders, rename it to the slug, and
   change the slug in `getLocation(...)` and the name of the component. That is the whole file.
5. **The links to it.** Add the city to `areas` in `src/content/site.ts` (the footer) and to
   `finalCta.areas` in `src/content/home.ts` (the closing section and the contact page).
6. **Everywhere the cities are named in a sentence.** The service area line in CONTENT.md section 2
   and `serviceAreaLine` in `src/content/site.ts`, the pills in CONTENT.md section 3.12, and the
   meta description of the headlight restoration page in CONTENT.md section 4 and
   `src/content/pages.ts`.

The sitemap, the breadcrumbs and the audits pick the page up from `locations` by themselves. Then
build and run `audit:copy`, `audit:seo` and `audit:a11y`.

---

## 8. Things that will catch you out

- **CONTENT.md first.** The copy audit will fail on any word that is on the site and not in
  CONTENT.md. That is the point of it.
- **No em dashes and no en dashes**, in copy, code, comments or commit messages.
  `npm run audit:design` checks every file, this one included.
- **A page you have visited stays in the document, hidden.** That is how the router keeps it warm.
  It means an `id` written by hand can be in the document twice. Section headings take their ids
  from `useId()`, and a link to a place on the same page goes through `AnchorLink`, which finds the
  copy that is on screen.
- **Do not wrap page sections in `<Suspense>`.** React sends a large boundary's content outside its
  place, hidden, for script to move in, and with script off it stays hidden. It was tried for
  speed and removed. `npm run audit:seo` now fails if it comes back.
- **The beam is a 2D canvas, not WebGL.** `beam.frag` is the reference and is rendered at build
  time. The live beam is `BeamCanvas.tsx`, drawing from `beam-model.ts`. DECISIONS.md items 8 and 9.
- **The beam washes out anything set over its centre.** Two things keep it off the text: it is
  squashed flat, as the shader's comment describes, and it does not follow the pointer onto the
  header or the hero's copy. DECISIONS.md items 16 and 17. `npm run audit:a11y` measures the hero
  against the pixels behind it and fails if either is undone.
- **Entrances do not start themselves.** They go through `afterQuiet()` in `src/lib/routeQuiet.ts`,
  which is what keeps the 200ms after a route change still, and through `whenIdle()` in
  `src/lib/idle.ts`, which keeps the setup work out of the page's first moments.
- **The forms write an email.** No form service was specified, so the two forms open the visitor's
  mail app with the message written. `EnquiryForm.tsx` is the one place to change that.
- **Reviews are built and not shown.** `src/components/sections/Reviews.tsx` is complete and left
  out of the home page until there are real reviews. DECISIONS.md item 11.

---

## 9. What is still waiting on the owner

Nothing asked for in CONTENT.md section 11 has arrived since the build began, so no placeholder and
no TODO chip has been removed. At handover there are 32 placeholder frames and 32 TODO chips across
the twelve routes. `docs/qa/owner.txt` lists every one by route and section, and
`npm run audit:owner` writes that list again at any time. This is the same list by what to ask for.

**Photos and files, 18 from DESIGN.md section 5 and 3 more**

| File | Ratio | Shows as a frame on |
|---|---|---|
| `hero-poster.jpg` | 16/9 | Nowhere. A frame of the beam stands in behind the home hero. |
| `before-02.jpg`, `after-02.jpg` | 3/2 | `/gallery`, the pairs. The original of pair 02 is split on a diagonal and could not be cut into a matching pair. |
| `before-06.jpg`, `after-06.jpg` | 3/2 | `/gallery`, the pairs. |
| `gallery-06.jpg` | 4/3 | `/` and `/headlight-restoration`, "Drag it. That is the same lens.", and `/gallery`. |
| `gallery-07.jpg` to `gallery-12.jpg` | 4/3 | `/gallery`. |
| `owner.jpg` | 4/5 | `/` and `/about`, "Started after school. Run like a trade." |
| `process-01.jpg` to `process-04.jpg` | 3/2 | `/headlight-restoration`, "Four stages. In that order." |
| `logo.svg` | | Nowhere. The header sets the name in type and the tab icon is a generated mark. |
| `guide-01.jpg` to `guide-03.jpg` | 4/3 | `/vehicle-guide`, one per tier. CONTENT.md asks for these three photos. The filenames and the ratio were chosen in the build, because DESIGN.md section 5 does not list them. |

Also photos, but not new files: each of the four location pages has three open slots under "Drag
it. That is the same lens." waiting to be told which existing pair was done in that city.

**Facts, by the numbers in CONTENT.md section 11**

| | Needed | Where the chip is |
|---|---|---|
| 1 | Google profile URL, rating, review count and three reviews | No chip. The reviews section is built and held back. |
| 2 | Guarantee terms in writing | "Three years. In writing." on `/`, `/headlight-restoration` and `/fog-light-restoration`. |
| 3 | Dealer volume pricing and minimum booking | "Volume pricing" on `/dealer-and-auction`. |
| 4 | Business hours | "Hours" on `/contact`. |
| 5 | Payment methods | "How do I pay?" in the FAQ on `/headlight-restoration`. |
| 7 | Year, make, model and city for every photo | "Drag it. That is the same lens." on `/`, `/headlight-restoration` and the four location pages. |
| 8 | Three vehicle guide photos | "Restores well" on `/vehicle-guide`. |
| 11 | Typical visit duration | The third hero stat on `/`, and the first answer in the FAQ on `/headlight-restoration`. |
| 12 | Fog light add-on price | "Fog lights can be added" in pricing on `/` and `/headlight-restoration`, and "Added to a headlight booking." on `/fog-light-restoration`. |
| 13 | A real replacement price for one local vehicle | The "Cost" card on `/`. |
| 14 | Whether Discovery Bay and Bay Point are served | The service area pills on every page that closes with "Let's bring your headlights back to life.", and on `/contact`. |

Items 6, 9 and 10 are the photos and the logo above.

**Not in CONTENT.md section 11, and still the owner's to confirm**

- **The four location openings are drafts.** CONTENT.md gives the brief for each and not the text.
  They are written to that brief, each carries a chip, and each is also that page's meta
  description. They need reading by someone who knows the four towns.
- **The service radius.** The structured data describes the service area as a circle of 16km around
  the midpoint of the four cities, because no radius has been stated. `src/content/area.ts`.

---

## 10. What was measured at handover

Home route, production build, on the machine the site was built on. That machine has no GPU, so
everything a phone draws on its GPU was drawn on the processor here. Measure again on a real phone
before quoting any of these as a promise.

| Metric | Budget | Measured | |
|---|---|---|---|
| LCP, mobile, throttled 4G | under 2.5s | 0.76s | within |
| CLS | under 0.02 | 0.015 | within |
| INP | under 200ms | 96ms | within |
| Total JS, gzipped, home route | under 230KB | 224.4KB | within |
| Hero beam frame time, mid phone | under 8ms | 5.1ms | within |
| Lighthouse Performance, mobile | 90 or above | 93 to 98 with the throttling applied, 82 to 86 simulated | see below |
| Lighthouse Accessibility | 100 | 100 | within |

The first five rows are `npm run audit:perf`: a phone sized screen, slow 4G and the processor slowed
four times. LCP is the median of three loads. CLS is the worst seen while the whole page is
scrolled. INP is the slowest of six interactions, each made on a page that has come to rest, with
the processor still slowed. The frame time is one frame of the beam, drawn and flushed.

One more figure belongs beside INP. For most of a second after a scroll stops the page is still
working: the clarity curve is easing to its new value and everything that reads it is being
redrawn. A tap that lands in that window waits longer. Landing 300ms after a short scroll it took
96ms at the median and 104ms at worst over eight tries, inside the budget. Landing just after a
jump of several screens it has measured as much as 288ms on this machine. That cost is the clarity
curve as MOTION.md section 4 writes it, one variable on the root element with three things reading
it, and it was left as written.

The reports behind this table are `docs/qa/perf.txt` and `docs/qa/lighthouse.txt`.

**The Lighthouse Performance row needs explaining, because it has two honest answers.**

```bash
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility --throttling-method=devtools
```

With `--throttling-method=devtools` Lighthouse really slows the network and the processor and
watches what happens. Three runs scored 98, 97 and 93, with LCP at 1.2s.

Without that flag, which is also how PageSpeed Insights runs it, Lighthouse loads the page at full
speed and then estimates what a slow phone would have done. Three runs scored 82, 86 and 86, with
LCP estimated at 4.1 to 4.3s. **By the default tool, the budget of 90 is not met.**

The estimate and the measurement disagree, and the reason is the hero. The largest thing on the first
screen is the second line of the heading, and MOTION.md section 5.2 brings it in 0.62 seconds into
the type reveal, which script runs. At full speed that moment comes after all the script has
arrived, so the estimate concludes the heading needs all of it, and adds the time a slow phone would
take to download and run it. On a real slow connection that is not what happens: the heading is
never held back for more than 400ms. If script has not arrived by then, the heading is shown as it
is and the reveal is skipped. That is the 0.76s and the 1.2s in the measured runs.

There are two ways to make the default score read above 90, and both change what MOTION.md asks for,
so neither was done:

1. Show the heading at once on a first visit and keep the reveal for moves between pages.
2. Show the heading at once and let the reveal replay over it, which flashes.

Accessibility: `npm run audit:a11y` ran axe 36 times, on twelve routes at two sizes and with the
menu open, and found no violation. The report, the keyboard walk and every contrast pair are in
`docs/qa/a11y.txt`.

---

## 11. Decisions left open

Places where the documents disagree with each other or stop short, what the build does in each, and
where to change it. None of them stops the site working. Each is one small change if the answer is
different.

**Where the documents disagree**

- **The price counts up.** DESIGN.md section 6, CONTENT.md section 3.8 and the build plan all ask for
  `$125` as a Counter. MOTION.md section 8 says prices do not animate. It counts. To hold it still,
  pass `still` to the `Counter` in `Hero.tsx`, `Stats.tsx` and `Pricing.tsx`.
- **The kinetic line is three rows.** CONTENT.md calls it a single full-bleed line. At the size
  DESIGN.md gives it the three words cannot share a row at any width, so each takes its own.
- **What is pinned.** MOTION.md section 5.4 names the booking heading, "Three steps. One clear
  result.", together with the four-stage correction. The build plan pins section 3.6, the four
  stages. The four stages are pinned, under their own heading, and booking follows unpinned.
- **The beam is squashed, not stretched.** MOTION.md section 7 wrote the squash as a multiply under
  a comment that says squashed. A multiply stretches it, and the stretched beam sat behind the
  header and the heading and washed them out: the navigation fell to about 1.1 to 1, and on a phone
  the menu button disappeared as the beam drifted. It is now a divide, which is what the comment
  describes. DECISIONS.md item 16 has the measurements and the three places to change it back.
- **The beam does not follow the pointer onto the copy.** MOTION.md section 5.1 has it follow the
  pointer everywhere. Its centre washes out whatever is set over it, so the button or link being
  pointed at could not be read, which MOTION.md section 8 and DESIGN.md section 2.3 both rule out.
  Over the header, the pitch, the figures and the scroll cue it now heads back to where it rests.
  It still follows over open ground and over the heading. DECISIONS.md item 17.

**Where the documents stop short**

- Section headings that CONTENT.md names only in a list are used as written there: "What oxidation
  actually is", "What it will not fix", "FAQ", "Volume pricing".
- The contact page's labels (Phone, Email, Hours) and its form fields (Name, Phone, Vehicle,
  Message) are not in CONTENT.md. They are plain labels, listed as such in `scripts/copy.ts`.
- `/gallery`, `/about`, `/contact` and the home page have no meta title in CONTENT.md. The first
  three are the page's name with the site name. The home page is the site name with its tagline, and
  its description is the hero's opening paragraph.
- `/about` carries the home page story and nothing more. No longer version exists.
- The page for an address that does not exist shows "404", the navigation and the two calls to
  action. CONTENT.md has no copy for it.
- The Marquee component is built and is on `/styleguide`. No page section calls for it.
- The Google review QR code from the old site is not placed anywhere.
- The tab icon and the image a shared link shows are generated stand-ins, in the token colours,
  until there is a logo and a hero photo.
- Structured data: the fog light and dealer pages state no price, and the FAQ data on
  `/vehicle-guide` is its one closing question. schema.org's own validator could not be reached from
  the build machine, so the structured data is checked against a copy of the vocabulary held in
  `scripts/data/schemaorg.json`. Run a page through the validator once the site is live.

**Three things the contrast table does not cover**

- **Text over the hero.** DESIGN.md's table measures against night, pine and smoke. The hero's
  ground is the haze and the glow of the beam, which are lighter than any of them. So
  `npm run audit:a11y` measures everything set over the hero against the pixels actually behind it,
  at five screen sizes. With the beam squashed and kept off the copy, all of it meets what WCAG
  asks except three pieces, which fall a little short of 4.5 to 1 at their worst point on some
  screens: the eyebrow at 4.31, the last words of the lead paragraph at 4.45, and the "TYPICAL
  VISIT" label at 3.94. Two of the three are `.caps` text in beam at 54 percent, which has little
  to spare even on plain night, where it measures 5.59. The colours are DESIGN.md's and the haze is
  MOTION.md's, so neither was changed. The choices are to set `.caps` text over the hero in a
  stronger beam, to thin the haze, which is 30 percent oxide at its densest, or to accept it.
- The BEFORE and AFTER labels sit over photographs, so their contrast depends on the photo. Against
  their own fill they measure 4.07 and 6.85.
- While the process is pinned, the three steps that are not current are set in beam at 24 percent,
  as MOTION.md section 5.4 asks. DESIGN.md section 2.3 says that value must never carry information.
  Each step is at full strength when it is the current one, and all four are whenever the section
  is not pinned: before and after the pin, under reduced motion and with script off.
