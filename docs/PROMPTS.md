# PROMPTS.md

Staged Claude Code prompts for the Lenz Rescue build.

Run them in order. Do not merge two stages into one message. Each stage ends with a commit, and each stage's checks must pass before the next one starts. If a stage fails its checks, fix it in that stage rather than carrying the problem forward.

Before Prompt 1, put `DESIGN.md`, `MOTION.md`, `CONTENT.md`, `DECISIONS.md` and `AUDIT.md` in `docs/` at the repo root and commit them. Every prompt below assumes they are there.

## Prompt 0: repo and ground rules

```
Read docs/DESIGN.md, docs/MOTION.md, docs/CONTENT.md, docs/DECISIONS.md and docs/AUDIT.md in full
before writing any code. They are the specification for this project and they override your defaults.

Three standing rules for every stage of this build:

1. Every colour, font, spacing value, radius and easing curve comes from docs/DESIGN.md and
   docs/MOTION.md. You do not choose any of them. If a value you need is not in those files, stop and
   ask me rather than picking one.
2. Every word of user-facing copy comes from docs/CONTENT.md, verbatim. You do not write, rewrite,
   shorten or improve copy. Lorem ipsum is never acceptable, not even temporarily.
3. No em dashes and no en dashes anywhere: not in copy, not in code, not in comments, not in commit
   messages.

Confirm you have read all five documents and list, in one line each, the six colour tokens, the three
font families and the three easing curves. Do not write any other code yet.

```

## Prompt 1: foundation

```
Set up the project foundation.

1. Scaffold a Next.js app with the App Router, TypeScript and ESLint. Put the application in src/,
   so routes live at src/app. Set the @/* path alias to src. Remove the starter page content, the
   default Geist font and the template SVGs. Keep README.md.

2. Tailwind CSS v4. Install the latest stable gsap, @gsap/react, lenis, three, @react-three/fiber,
   @react-three/drei, and as dev dependencies @playwright/test and tsx. Commit the lockfile.

3. src/styles/tokens.css. The six colours from DESIGN.md section 2.1, the seven opacity variants
   from 2.2, the two glow values from 2.4, and the easing and duration tokens from MOTION.md
   section 1, all as CSS custom properties. Map the six colours into Tailwind's @theme with the
   names night, pine, smoke, beam, xenon, oxide exactly as shown in DESIGN.md section 2.5. Register
   --clarity with @property as shown in MOTION.md section 4. This file is the only file in the
   repository allowed to contain a hex, rgb, rgba or hsl value. The one documented exception is the
   GLSL colour constants in the shader, which come later and must carry their token comment.

4. src/app/fonts.ts exactly as written in DESIGN.md section 3, applied on <html> in the root layout.
   Then src/styles/type.css implementing every row of the DESIGN.md section 3.1 table as a utility
   class: .wordmark .display .h2 .h3 .kinetic .numeral .body-l .body .small .caps .accent. Apply the
   per-style default colours from 3.2 and the measure caps from 3.3. No component anywhere may set
   its own font-size, weight, tracking or line-height.

5. src/lib/useReducedMotion.ts and src/lib/gsap.ts with the EASE and DUR constants from MOTION.md
   section 1.

6. src/components/providers/SmoothScroll.tsx, Lenis wired to ScrollTrigger exactly as written in
   MOTION.md section 3, mounted once in the root layout. Off for prefers-reduced-motion, off for
   coarse pointers.

7. Components in src/components/ui, built to DESIGN.md section 6 with every state listed there:
   Header, PrimaryButton, SecondaryButton, TextLink, Pill, Eyebrow, Counter, GlassCard, StepRow,
   Marquee, Cursor, PlaceholderFrame, Footer. CompareSlider is stage 3, skip it here.
   Every interactive element gets the focus ring from DESIGN.md section 6.1.

8. src/app/styleguide/page.tsx with robots noindex. Show every colour token with its hex and its
   measured contrast note from DESIGN.md section 2.3, every type style, and every component in every
   state, rendered twice: once on night and once on smoke.

9. scripts/shots.ts and an npm script "shots" that runs it with tsx. It takes a list of routes,
   captures 1440x900 and 390x844, plus a prefers-reduced-motion version of each, and saves to
   docs/qa/<route>/. Launch Chromium with --use-angle=swiftshader --enable-unsafe-swiftshader
   --ignore-gpu-blocklist.

Checks before you say done:
1. npm run lint and npm run build both pass with no warnings.
2. Grep the whole repo. No hex, rgb, rgba or hsl value outside src/styles/tokens.css. No #000, #fff,
   black or white keywords. No Tailwind default palette class. No arbitrary colour value in square
   brackets. No box-shadow containing black. No transition: all.
3. Only three font families are referenced anywhere. Only three border radius values. Every spacing
   value is on the 4px scale in DESIGN.md section 4.
4. No em dashes or en dashes anywhere in the repo.
5. npm run shots for /styleguide, then show me the 1440 and the 390 screenshots.
6. Commit as "Foundation: tokens, fonts, providers, base components" and push.

```

## Prompt 2: the hero and the shader

```
Build the hero. This is the single most important screen on the site, so follow MOTION.md literally.

1. src/components/hero/beam.frag, the fragment shader exactly as written in MOTION.md section 7.
   Keep every colour constant and keep the token comment next to each one.

2. src/components/hero/BeamCanvas.tsx. A @react-three/fiber Canvas holding one fullscreen plane with
   that shader. Uniforms uRes, uMouse, uTime, uProgress. Apply every performance guard in MOTION.md
   section 7: dpr capped at [1, 1.75], antialias off, high-performance power preference, the render
   loop paused by IntersectionObserver when the hero leaves the viewport, and the 0.75 render scale
   above 2.6 megapixels. Render /media/hero-poster.jpg behind the canvas as the no-WebGL fallback.

3. Pointer handling exactly as MOTION.md section 5.1: lerp factor 0.06, never raw. On coarse pointers
   there is no listener, use the drift formula given there instead.

4. uProgress is driven by a ScrollTrigger scrub on the hero itself, 0 at the top of the page and 1
   when the hero is fully scrolled past.

5. The hero DOM on top of the canvas: Eyebrow, H1 with the .accent span, lead paragraph, the two
   buttons, the three stat blocks and the scroll cue. All copy verbatim from CONTENT.md section 3.1.
   Wrap the H1 in an element with mix-blend-mode: plus-lighter so the beam appears to light the
   letterforms.

6. The entrance animation from MOTION.md 5.2: SplitText by line, each line in an overflow hidden
   mask, yPercent 112, stagger 0.09, expo.out, then the .accent span blurring in at 0.62s.

7. The global clarity curve from MOTION.md section 4, including the three consumers listed there and
   no fourth. Generate the 128x128 tiling noise PNG at build time rather than committing a binary you
   cannot explain.

8. Reduced motion: one static frame at uProgress 1 and uMouse 0.5, 0.62, then stop the loop. No
   SplitText animation, a plain fade instead.

Checks before you say done:
1. The hero holds 60fps on a 1440x900 viewport with the CPU throttled 4x in DevTools.
2. With JavaScript disabled, the poster image and all hero copy are still visible and the phone
   number is still tappable.
3. prefers-reduced-motion produces a still, readable hero with no movement at all.
4. The three stat numerals use tabular figures and do not shift the layout while counting.
5. Lighthouse on / scores 90 or above for Performance on mobile and 100 for Accessibility.
6. npm run shots for /, then show me the 1440 and 390 captures plus the reduced-motion capture.
7. Commit as "Hero: beam shader, clarity curve, type reveal" and push.

```

## Prompt 3: the CompareSlider and the gallery

```
Build the before and after system. This is the commercial core of the site.

1. src/components/ui/CompareSlider.tsx to the full specification in MOTION.md section 6. Every
   behaviour listed there is required, including drag anywhere on the image, click to position,
   arrow keys at 4 percent and shift-arrow at 12 percent, Home and End, the 44px handle, the oxide
   and xenon side overlays, the BEFORE and AFTER pills with their correct text colours, the one-time
   intro animation from 100 to 38 percent on first scroll into view, and the full ARIA slider role.
   No transition on the position during drag.

2. src/components/ui/MediaFrame.tsx implementing the image treatment in DESIGN.md section 5: the
   10px frame, the beam-12 hairline, no shadow, the filter stack, the night multiply overlay, the
   oxide tint for before images and the xenon tint for after images, and the hover transition to
   clarity over 640ms.

3. The gallery grid: 4/3 tiles, 12 items, filterable by service type. Use PlaceholderFrame for every
   slot until real media lands, showing the expected filename and ratio from DESIGN.md section 5.

4. The Cursor behaviour over gallery images from DESIGN.md section 6: the ring grows to 96px and the
   haze overlay is removed inside the ring using a CSS mask. Fine pointers only.

5. The home before and after section, copy verbatim from CONTENT.md section 3.5, and the /gallery
   route.

Checks before you say done:
1. The slider is fully operable by keyboard alone, and a screen reader announces its value.
2. The slider works under prefers-reduced-motion. It is a control, not an animation.
3. Dragging on a touch device does not scroll the page.
4. No layout shift when the images load. Every frame has an explicit aspect ratio.
5. npm run shots for / and /gallery, then show me the captures.
6. Commit as "Compare slider, media frames, gallery" and push.

```

## Prompt 4: the rest of the home page

```
Build every remaining home page section, in the order given in CONTENT.md section 3, copy verbatim.

3.2 The problem, three GlassCards
3.3 The kinetic line, with the width-axis scroll from MOTION.md 5.3. This is the only place on the
    entire site where that effect is used.
3.4 Services, three items
3.6 The process, as the pinned lens cross-section set piece in MOTION.md 5.4. Draw the SVG
    cross-section yourself with the four named layer ids. It is a side-on section through a headlight
    lens, roughly 800 by 500, stroked not filled, built from the token colours.
3.7 Booking, three steps
3.8 Pricing, with the Counter and the oxide caution callout. Remember the DESIGN.md 2.3 rule: text on
    oxide is night, never beam.
3.9 Guarantee
3.10 Story, once only, with the 4/5 owner image slot
3.11 Reviews, built but kept out of the page order until real reviews exist. Use the
     ReviewPlaceholder state.
3.12 Final CTA with the service area Pills

Every section that is not a set piece uses the default reveal in MOTION.md 5.5: y 28, stagger 0.07,
expo.out, once. Do not increase either number.

Leave every TODO(owner) in CONTENT.md visible in the rendered page as a small oxide chip reading
TODO so the client can see exactly what is still missing during review. These are removed in Prompt 6.

Checks before you say done:
1. Read back to me every line of copy you rendered and confirm it matches CONTENT.md word for word.
2. The pinned process section unpins cleanly and does not trap scroll on mobile.
3. Nothing in MOTION.md section 8 animates.
4. The page is readable and complete with JavaScript disabled.
5. npm run shots for / at both sizes plus reduced motion, then show me all three.
6. Commit as "Home: all sections, pinned process" and push.

```

## Prompt 5: inner pages, location pages and SEO

```
Build the remaining routes from CONTENT.md sections 4 through 8.

/headlight-restoration, /fog-light-restoration, /dealer-and-auction, /gallery, /vehicle-guide,
/about, /contact, and the four location pages.

1. Location pages share one template but take their H1, their opening paragraph, their neighbourhood
   list and their three work photos as props. Do not generate them by substituting a city name into
   identical text. The four openings in CONTENT.md section 8 are different on purpose.
2. The vehicle guide tiers use their assigned accent colours: xenon, beam, oxide.
3. /dealer-and-auction drops the story and the first-person warmth. Different audience.
4. Page transitions as MOTION.md 5.7. A beam panel, 520ms each way, no loader, no logo animation.
5. JSON-LD on every page as CONTENT.md section 10. AutoRepair LocalBusiness with GeoCircle and no
   address, Service with minPrice 125, FAQPage on the two pages listed, BreadcrumbList below home.
6. Metadata per page from the meta titles and descriptions in CONTENT.md. Generate a real
   app/sitemap.ts and app/robots.ts. The current site serves its homepage at /sitemap.xml, which is a
   soft 404. That must not survive.
7. Alt text follows the patterns in CONTENT.md section 9. The string "Headlight restoration previous
   work" must not appear anywhere.
8. Add the redirects in DECISIONS.md item 10 to next.config.ts.

Checks before you say done:
1. npm run build passes and every route is statically rendered.
2. /sitemap.xml returns valid XML listing all twelve routes.
3. Validate every JSON-LD block against schema.org. Paste the validator output.
4. No two location pages share an identical paragraph.
5. Every image has unique, descriptive alt text.
6. npm run shots for all twelve routes, then show me the four location pages at 390.
7. Commit as "Inner pages, location pages, schema and sitemap" and push.

```

## Prompt 6: polish, accessibility and performance

```
Final pass. No new features.

1. Accessibility audit. Keyboard-only walk of every route: focus order, skip link, focus trap in the
   mobile menu, focus ring visible on every interactive element at 2px xenon with 3px offset. Run
   axe on every route and fix everything it reports.
2. Re-verify every contrast pair in DESIGN.md section 2.3 against what actually shipped. Confirm in
   particular that no beam or xenon text sits on an oxide background anywhere.
3. Performance against the budget in MOTION.md section 9. Report the real numbers for LCP, CLS, INP,
   gzipped JS on the home route, and Lighthouse Performance and Accessibility on mobile. If three.js
   pushes the home route past 230KB gzipped, apply the fallback recorded in DECISIONS.md item 9: a
   2D canvas radial-gradient beam, not a different 3D library.
4. Remove every PlaceholderFrame and TODO chip for which real content now exists. List the ones that
   remain, with the route and section of each, so I can chase the client.
5. Final grep: no hex outside tokens.css and the documented shader constants, no fourth font, no
   fourth radius, no off-scale spacing, no em dashes or en dashes, no lorem, no console.log,
   no unused dependency in package.json.
6. Write docs/HANDOVER.md: how to run it, how to add a gallery item, how to add a location page, how
   to change a price, and where the tokens live.

Checks before you say done:
1. Paste the axe output for every route, showing zero violations.
2. Paste the real performance numbers against each row of the MOTION.md section 9 table.
3. npm run shots for all routes at both sizes plus reduced motion, then show me the home page set.
4. Commit as "Polish: accessibility, performance, handover" and push.

```

## If Claude Code drifts

Three corrections that fix most of what goes wrong. Paste the relevant one as its own message.

**Colour drift.** `Stop. You have introduced a colour that is not one of the six tokens in DESIGN.md section 2.1. Grep the repo for every hex, rgb, rgba and hsl value outside src/styles/tokens.css, list every one with its file and line, and replace each with the correct token. Do not add a new token.`

**Motion drift.** `The reveals are too large and too slow, which is making the site look generic. Every default reveal is y 28, stagger 0.07, expo.out, 640ms, and fires once. Find every ScrollTrigger-driven entrance animation that is not a named set piece in MOTION.md section 5 and reset it to exactly those values.`

**Copy drift.** `You rewrote copy. Every user-facing string comes from docs/CONTENT.md verbatim. Diff every rendered string on this route against CONTENT.md, list every difference, and restore the CONTENT.md version. Do not improve anything.`
