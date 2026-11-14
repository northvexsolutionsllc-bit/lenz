# MOTION.md

Lenz Rescue. Motion, scroll and WebGL specification.

This file contains working code, not descriptions. Where code is given, use it. Do not substitute a
different library, a different easing curve, or a "simpler equivalent". The reason this file is so
literal is that motion and shader work written from prose always drifts into something generic.

Stack, locked: **GSAP 3 + ScrollTrigger + SplitText**, **Lenis** for smooth scroll, **three.js** via
**@react-three/fiber** for the hero only. No Framer Motion, no AOS, no Locomotive, no CSS scroll-driven
animations as a primary mechanism.

---

## 1. Tokens

In `src/styles/tokens.css`, alongside the colour tokens.

```css
:root {
  /* easing */
  --ease-beam:  cubic-bezier(0.16, 1, 0.30, 1);    /* expo out. Reveals, entrances, the default. */
  --ease-swap:  cubic-bezier(0.65, 0, 0.35, 1);    /* in-out. State changes, toggles, menu. */
  --ease-snap:  cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot. Counters and the cursor only. */

  /* duration */
  --dur-1: 160ms;   /* micro: cursor, icon colour */
  --dur-2: 320ms;   /* standard: hover, link underline, header state */
  --dur-3: 640ms;   /* reveal: a single element entering */
  --dur-4: 1200ms;  /* set piece: hero lines, counters, the pinned process */
}
```

GSAP equivalents, defined once in `src/lib/gsap.ts` and imported everywhere:

```ts
export const EASE = {
  beam: "expo.out",
  swap: "power2.inOut",
  snap: "back.out(1.7)",
} as const;

export const DUR = { d1: 0.16, d2: 0.32, d3: 0.64, d4: 1.2 } as const;
```

Nothing animates with `linear` except the marquee and the shader clock.

---

## 2. Reduced motion

A single hook, `useReducedMotion()`, read at the top of every animated component. When true:

- Lenis is not instantiated. Native scroll.
- The hero shader renders one static frame at `uProgress = 1` and `uMouse = vec2(0.5, 0.62)`, then
  stops the render loop.
- All ScrollTrigger scrubs are replaced by a single `opacity 0 to 1` over `--dur-2`.
- The custom cursor does not mount.
- The marquee becomes a static wrapped list.
- Magnetic buttons do not attach listeners.
- The CompareSlider still works. It is a control, not an animation.

This is checked in QA. A build that moves under `prefers-reduced-motion: reduce` fails.

---

## 3. Lenis wired to ScrollTrigger

`src/components/providers/SmoothScroll.tsx`. Mounted once in the root layout, wrapping children.

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // native scroll on touch

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
```

---

## 4. The global clarity curve

The one idea that makes this site feel designed rather than assembled. A single CSS variable
`--clarity` runs from `0` at the top of the page to `1` at the contact section, driven by one
ScrollTrigger on `<body>`.

```ts
gsap.to(document.documentElement, {
  "--clarity": 1,
  ease: "none",
  scrollTrigger: {
    trigger: document.body,
    start: "top top",
    end: () => document.querySelector("#contact")!.getBoundingClientRect().top + window.scrollY,
    scrub: 0.6,
  },
});
```

Registered with `@property` so it interpolates:

```css
@property --clarity {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
```

Three things consume it, and nothing else:

```css
/* 1. Page grain fades out */
body::after {
  content: "";
  position: fixed; inset: 0; pointer-events: none; z-index: 60;
  opacity: calc(0.07 * (1 - var(--clarity)));
  background-image: url("/noise.png");   /* 128x128 tiling, 8-bit, generated at build */
  background-repeat: repeat;
  mix-blend-mode: overlay;
}

/* 2. Section bands warm down from oxide toward neutral */
.section-band {
  background-color: color-mix(
    in oklab,
    var(--pine) calc(100% - 6% * (1 - var(--clarity))),
    var(--oxide)
  );
}

/* 3. Image haze overlay lifts */
.media-frame::before {
  opacity: calc(0.18 + 0.14 * (1 - var(--clarity)));
}
```

Do not add a fourth consumer without updating this file. The effect works because it is subtle and
systemic. If six things respond to it, it reads as a bug.

---

## 5. Set pieces

### 5.1 Hero: the beam

Full-viewport `<canvas>` behind the hero type, rendered with @react-three/fiber as a single fullscreen
plane with the shader in section 7. Above it, the H1 sits in normal DOM with `mix-blend-mode: plus-lighter`
on a wrapper so the beam appears to light the letterforms.

Mouse is lerped, never applied raw:

```ts
mouse.current.x += (target.x - mouse.current.x) * 0.06;
mouse.current.y += (target.y - mouse.current.y) * 0.06;
```

0.06 is the value. A higher lerp makes the beam feel like a cursor instead of a heavy lamp.

On touch devices there is no pointer, so the beam drifts on its own:

```ts
target.x = 0.5 + Math.sin(t * 0.21) * 0.18;
target.y = 0.58 + Math.cos(t * 0.17) * 0.10;
```

### 5.2 Hero type reveal

SplitText by line, each line in an `overflow: hidden` mask.

```ts
const split = new SplitText(".display", { type: "lines", linesClass: "line" });
split.lines.forEach((l) => l.parentElement?.classList.add("line-mask"));

gsap.from(split.lines, {
  yPercent: 112,
  duration: DUR.d4,
  ease: EASE.beam,
  stagger: 0.09,
  delay: 0.15,
});
```

The `.accent` serif span gets one extra beat so the eye lands on it:

```ts
gsap.from(".display .accent", {
  opacity: 0, filter: "blur(14px)",
  duration: DUR.d4, ease: EASE.beam, delay: 0.62,
});
```

### 5.3 Width-axis scroll on the kinetic line

This is the Archivo `wdth` axis earning its place. One section only: the big "RESTORE / PROTECT /
REPEAT" kinetic line.

```ts
gsap.fromTo(".kinetic",
  { fontVariationSettings: '"wght" 700, "wdth" 62' },
  {
    fontVariationSettings: '"wght" 700, "wdth" 118',
    ease: "none",
    scrollTrigger: { trigger: ".kinetic", start: "top 85%", end: "bottom 35%", scrub: 0.5 },
  }
);
```

Use it exactly once on the site. Twice and it stops being a moment.

### 5.4 Pinned process: the lens cross-section

Section "Three steps. One clear result." plus the four-stage correction. Pinned for 300vh. An inline
SVG cross-section of a headlight lens sits centred. Four layers, each a `<path>` with
`stroke-dasharray` set to its own length:

1. `#layer-oxidation` amber, `--oxide`, starts at full opacity, is wiped away during stage 1
2. `#layer-scratches` hairlines in `--beam-24`, removed during stage 2
3. `#layer-polish` a specular sweep in `--beam`, drawn during stage 3
4. `#layer-coating` a `--xenon` outline, drawn during stage 4

```ts
const tl = gsap.timeline({
  scrollTrigger: { trigger: "#process", start: "top top", end: "+=300%", pin: true, scrub: 0.8 },
});

tl.to("#layer-oxidation", { opacity: 0, duration: 1 })
  .to("#layer-scratches", { strokeDashoffset: 0, duration: 1 }, "<0.3")
  .fromTo("#layer-polish", { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 1, duration: 1.2 })
  .fromTo("#layer-coating", { strokeDashoffset: (i, el) => (el as SVGPathElement).getTotalLength() },
          { strokeDashoffset: 0, duration: 1.2 }, "<0.2")
  .to("#lens-glow", { opacity: 1, duration: 0.8 }, "<0.6");
```

Step copy to the left of the SVG cross-fades in sync, one step active at a time, inactive steps at
`--beam-24`.

### 5.5 Section reveals, the default

Every section that is not a set piece uses the same reveal. Build it once as `useReveal()`.

```ts
gsap.from(el.querySelectorAll("[data-reveal]"), {
  y: 28,
  opacity: 0,
  duration: DUR.d3,
  ease: EASE.beam,
  stagger: 0.07,
  scrollTrigger: { trigger: el, start: "top 78%", once: true },
});
```

`y: 28` and `stagger: 0.07`. Not 60 and 0.15. Large travel and slow stagger is the most common reason
a site looks amateur: it reads as "animated" instead of as the content arriving.

### 5.6 Magnetic primary button

Fine pointers only.

```ts
const strength = 0.35, max = 18;
el.addEventListener("pointermove", (e) => {
  const r = el.getBoundingClientRect();
  const x = gsap.utils.clamp(-max, max, (e.clientX - (r.left + r.width / 2)) * strength);
  const y = gsap.utils.clamp(-max, max, (e.clientY - (r.top + r.height / 2)) * strength);
  gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
});
el.addEventListener("pointerleave", () => {
  gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
});
```

### 5.7 Page transition

A single `--beam` panel wipes up from the bottom, holds 120ms, wipes off the top. 520ms each way,
`--ease-swap`. During the hold, the incoming page's hero shader is already warmed. No spinners, no
percentage loaders, no logo animation. This is a four-page local business site, not a portfolio.

---

## 6. CompareSlider

The commercial heart of the site. Get this wrong and the redesign is pointless.

Behaviour:

- Two images stacked, identical dimensions, `before` underneath and `after` clipped on top using
  `clip-path: inset(0 0 0 var(--pos))` where `--pos` is a percentage.
- Drag anywhere on the image, not just the handle. Also responds to click-to-position, to arrow keys
  (4 percent per press, 12 percent with shift), to Home and End, and to a touch drag.
- The handle is a `2px` vertical line in `--beam` with `--glow-beam` applied, plus a `44px` circle at
  the vertical centre, `--smoke` fill, `--beam-12` hairline, containing two chevrons in `--beam`.
  44px because that is the minimum touch target.
- The before side carries the `--oxide` colour overlay from DESIGN.md section 5. The after side
  carries the `--xenon` overlay. The divider therefore reads as the boundary between the two states,
  warm on the left, cool on the right.
- Labels: `.caps` pills reading `BEFORE` and `AFTER`, bottom left and bottom right, `--beam-08` fill.
  `BEFORE` gets `--oxide` text, `AFTER` gets `--xenon` text.
- On first scroll into view, animate `--pos` from 100 to 38 over `--dur-4` with `--ease-beam`, once.
  This teaches the interaction without a tooltip.
- Accessibility: the wrapper is `role="slider"` with `aria-valuemin="0"`, `aria-valuemax="100"`,
  `aria-valuenow`, `aria-label="Reveal the restored headlight"`, and `tabindex="0"`.
- No `transition` on `--pos` during drag. Transition only for the keyboard and the intro.

Never autoplay the slider on a loop. A comparison that moves by itself cannot be read.

---

## 7. The hero shader

`src/components/hero/beam.frag`. This is the whole 3D budget for the site. One fullscreen plane, one
fragment shader, no models, no loaders, no HDRIs, no post-processing passes. It costs about 14KB and
renders at 60fps on a phone.

Uniforms: `uRes` (vec2, pixels), `uMouse` (vec2, 0 to 1, already lerped), `uTime` (float, seconds),
`uProgress` (float, 0 hazy to 1 clear, driven by the hero's own ScrollTrigger scrub).

```glsl
precision highp float;

uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uTime;
uniform float uProgress;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),            hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv  = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p   = uv * asp;
  vec2 m   = uMouse * asp;

  // drifting haze, the oxidised lens
  float h = fbm(p * 2.4 + vec2(uTime * 0.020, uTime * 0.013));
  h = smoothstep(0.25, 0.95, h);

  // the beam. squashed vertically so it reads as a lamp, not a dot
  vec2 d = p - m;
  d.y *= 0.62;
  float dist = length(d);
  float core = exp(-dist * dist * 26.0);
  float halo = exp(-dist * dist *  5.0);
  float beam = core * 0.90 + halo * 0.45;

  // clarity burns off inside the beam and as the hero scrolls away
  float clarity = clamp(beam * 1.6 + uProgress, 0.0, 1.0);

  const vec3 NIGHT = vec3(0.016, 0.063, 0.039); // #04100A
  const vec3 OXIDE = vec3(0.784, 0.510, 0.184); // #C8822F
  const vec3 XENON = vec3(0.486, 0.776, 0.961); // #7CC6F5
  const vec3 BEAMW = vec3(0.918, 0.965, 1.000); // #EAF6FF

  vec3 haze = mix(NIGHT, OXIDE, h * 0.30);
  vec3 col  = mix(haze, NIGHT, clarity * 0.55);
  col += beam * mix(OXIDE, mix(XENON, BEAMW, 0.65), clarity) * 1.25;

  // vignette
  col *= smoothstep(1.25, 0.25, length(uv - 0.5));

  // grain, ties the canvas to the CSS grain in section 4
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
```

Every colour constant above is the sRGB value of a token in DESIGN.md section 2.1, converted to 0 to 1.
If a token changes, these change with it. They are the only place colour values legitimately appear
outside `tokens.css`, and the comment next to each one is mandatory.

Performance guards, all required:

- `dpr={[1, 1.75]}` on the Canvas. Never uncapped.
- `frameloop="demand"` is wrong here because the shader animates. Use `frameloop="always"` but pause
  the loop with an IntersectionObserver the moment the hero leaves the viewport.
- `gl={{ antialias: false, powerPreference: "high-performance" }}`. Antialiasing does nothing for a
  fullscreen fragment shader and costs real frames.
- If `uRes.x * uRes.y > 2_600_000`, render at 0.75 scale and let CSS upscale. Nobody can see it.
- Static `/media/hero-poster.jpg` renders behind the canvas and shows if WebGL is unavailable.

---

## 8. What not to animate

- The header logo
- Anything in the footer
- Form fields, beyond the focus ring and a 160ms border colour change
- The phone number and the primary CTA, beyond hover. These must be instantly tappable at all times.
- Prices. A number that animates while someone is trying to read it is hostile.
- Anything, at all, during the first 200ms after a route change

---

## 9. Performance budget, enforced in QA

| Metric | Budget |
|---|---|
| LCP, mobile, throttled 4G | under 2.5s |
| CLS | under 0.02 |
| INP | under 200ms |
| Total JS, gzipped, home route | under 230KB, of which three.js is roughly 140KB |
| Hero shader frame time, mid phone | under 8ms |
| Lighthouse Performance, mobile | 90 or above |
| Lighthouse Accessibility | 100 |

If three.js cannot fit the budget, the fallback is a `<canvas>` 2D radial-gradient beam, not a
different 3D library. That decision is recorded in DECISIONS.md item 9.
