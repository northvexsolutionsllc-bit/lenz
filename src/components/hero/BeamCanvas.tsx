"use client";

import { useEffect, useRef, type RefObject } from "react";
import { tokens } from "@/generated/tokens";
import { beamAt, clarityAt, CLEAR_MIX, COOL_MIX, LIGHT_GAIN, REST, SQUASH, vignetteAt } from "./beam-model";

// MOTION.md 7: above this many pixels, render at 0.75 scale and let CSS upscale
const MAX_PIXELS = 2_600_000;
const MAX_DPR = 1.75;

// A 2D canvas goes further than that. On a device without an accelerated canvas every
// pixel is drawn by the processor, on the main thread. The beam and the haze are soft,
// so the canvas renders at about this many pixels whatever the screen, and CSS scales
// it up. Nobody can see it, and a frame costs a small fraction of what it would.
const TARGET_PIXELS = 100_000;

// The haze layer, rendered at build time by scripts/generate.ts
const HAZE_SRC = "/generated/hero-haze.webp";

// How far the beam's gradients reach, in viewport heights. By here the halo is under a
// thousandth of full strength.
const REACH = 1.2;
const STOPS = 40;
const VIGNETTE_STOPS = 16;
// The furthest any pixel is from the centre, in the vignette's own units
const CORNER = Math.SQRT1_2;

// The haze sways a little so the lens looks alive. A fraction of the canvas, each way.
const SWAY = 0.025;

export type BeamInput = {
  /** Where the beam is heading. 0 to 1, origin bottom left, as the shader expects. */
  x: number;
  y: number;
  /** uProgress: 0 hazy to 1 clear */
  progress: number;
};

type BeamCanvasProps = {
  input: RefObject<BeamInput>;
  /** False pauses the render loop. Set by the hero's IntersectionObserver. */
  running: boolean;
  /** Reduced motion: one static frame, then no loop at all. */
  still: boolean;
  /** Called once the first frame is on screen. */
  onPainted: () => void;
};

type Rgb = [number, number, number];

const unit = (value: number) => Math.min(Math.max(value, 0), 1);
const channels = (hex: string): Rgb => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255) as Rgb;
const byte = (value: number) => Math.round(unit(value) * 255).toString(16).padStart(2, "0");
const colour = ([r, g, b]: Rgb, alpha?: number) => `#${byte(r)}${byte(g)}${byte(b)}${alpha === undefined ? "" : byte(alpha)}`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const scale = ([r, g, b]: Rgb, by: number): Rgb => [r * by, g * by, b * by];

// The four colours of the shader are four tokens. Read from the tokens, never restated.
const NIGHT = channels(tokens.night);
const OXIDE = channels(tokens.oxide);
const COOL = mix(channels(tokens.xenon), channels(tokens.beam), COOL_MIX);

// The ground every frame starts from: the haze, with the vignette already multiplied
// into it. It is composed once, off screen, a little larger than the canvas so that it
// can sway, and again only when the canvas changes size.
type Ground = { canvas: HTMLCanvasElement; padX: number; padY: number };

function buildGround(width: number, height: number, haze: HTMLImageElement | null): Ground {
  const padX = Math.ceil(width * SWAY);
  const padY = Math.ceil(height * SWAY);
  const canvas = document.createElement("canvas");
  canvas.width = width + padX * 2;
  canvas.height = height + padY * 2;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return { canvas, padX, padY };

  // Haze, the oxidised lens, drawn to cover
  ctx.fillStyle = tokens.night;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (haze) {
    const fit = Math.max(canvas.width / haze.naturalWidth, canvas.height / haze.naturalHeight);
    const w = haze.naturalWidth * fit;
    const h = haze.naturalHeight * fit;
    ctx.drawImage(haze, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }

  // Vignette, a multiply from the centre of the frame
  ctx.setTransform(width, 0, 0, height, canvas.width / 2, canvas.height / 2);
  ctx.globalCompositeOperation = "multiply";
  const vignette = ctx.createRadialGradient(0, 0, 0, 0, 0, CORNER);
  for (let stop = 0; stop <= VIGNETTE_STOPS; stop += 1) {
    const at = stop / VIGNETTE_STOPS;
    const level = vignetteAt(at * CORNER);
    vignette.addColorStop(at, colour([level, level, level]));
  }
  ctx.fillStyle = vignette;
  ctx.fillRect(-1, -1, 2, 2);

  return { canvas, padX, padY };
}

// The beam's two gradients depend only on the clarity that scroll has reached. They are
// built once and kept until that changes.
type Gradients = { progress: number; clearing: CanvasGradient; light: CanvasGradient };

function buildGradients(ctx: CanvasRenderingContext2D, progress: number): Gradients {
  const clearing = ctx.createRadialGradient(0, 0, 0, 0, 0, REACH);
  const light = ctx.createRadialGradient(0, 0, 0, 0, 0, REACH);
  for (let stop = 0; stop <= STOPS; stop += 1) {
    // Squared, so the stops crowd in where the core changes fastest
    const at = (stop / STOPS) ** 2;
    const distance = at * REACH;
    const beam = beamAt(distance * distance);
    const clarity = clarityAt(beam, progress);
    // Clarity burns the haze off, back toward night
    clearing.addColorStop(at, colour(NIGHT, clarity * CLEAR_MIX));
    // The light itself: amber where it is still hazy, cool where it is clear
    light.addColorStop(at, colour(scale(mix(OXIDE, COOL, clarity), beam * LIGHT_GAIN)));
  }
  return { progress, clearing, light };
}

type Frame = {
  width: number;
  height: number;
  /** 0 to 1, origin bottom left */
  mouse: { x: number; y: number };
  time: number;
};

// One frame, three passes: the ground, the clearing, the light.
//
// The shader multiplies the vignette in last, over everything. Here it is already in the
// ground, and the light takes the vignette's value at the centre of the beam. The
// clearing colour is night, which is all but black, so leaving the vignette off it
// changes nothing that can be seen. One pass fewer per frame, for the same picture.
function draw(ctx: CanvasRenderingContext2D, ground: Ground, gradients: Gradients, { width, height, mouse, time }: Frame) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(
    ground.canvas,
    -ground.padX + Math.sin(time * 0.05) * ground.padX,
    -ground.padY + Math.sin(time * 0.037) * ground.padY,
  );

  // The beam's own space: its centre at the origin, one unit to a viewport height, and
  // the vertical axis squashed as the shader squashes it.
  const cx = mouse.x * width;
  const cy = (1 - mouse.y) * height;
  const unitY = height * SQUASH;
  ctx.setTransform(height, 0, 0, unitY, cx, cy);

  // The whole canvas, in the beam's coordinates
  const left = -cx / height;
  const top = -cy / unitY;
  ctx.fillStyle = gradients.clearing;
  ctx.fillRect(left, top, width / height, height / unitY);

  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = vignetteAt(Math.hypot(mouse.x - 0.5, mouse.y - 0.5));
  ctx.fillStyle = gradients.light;
  ctx.fillRect(left, top, width / height, height / unitY);
}

// The hero beam. MOTION.md 5.1, 7 and 9, DECISIONS.md 9
//
// This is the 2D canvas beam. three.js took the home route far past its JavaScript
// budget, so the fallback written into MOTION.md 9 and DECISIONS.md 9 is in force: a 2D
// canvas beam that follows the same lerped pointer. It is drawn from the shader's own
// figures (beam-model.ts), over a haze layer rendered from the shader at build time, so
// it matches the poster it fades in over.
//
// The shader's guards still hold: the pixel ratio is capped at 1.75, the canvas renders
// at 0.75 scale above 2.6 megapixels (and, being 2D, far smaller than that: see
// TARGET_PIXELS), and the loop stops when the hero leaves the viewport. The pointer is
// lerped at 0.06, never applied raw. On touch there is no pointer and the beam drifts.
// Under reduced motion it draws one frame, at full clarity with the beam at rest, and
// stops.
export function BeamCanvas({ input, running, still, onPainted }: BeamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: REST[0], y: REST[1] });
  const time = useRef(0);
  const announced = useRef(false);
  const hazeRef = useRef<HTMLImageElement | null>(null);
  const painted = useRef(onPainted);

  useEffect(() => {
    painted.current = onPainted;
  }, [onPainted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let haze = hazeRef.current;
    let ground: Ground | null = null;
    let gradients: Gradients | null = null;
    let frame = 0;
    let last = 0;
    let stopped = false;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DPR);
      const capped = box.width * dpr * box.height * dpr > MAX_PIXELS ? dpr * 0.75 : dpr;
      const ratio = Math.min(capped, Math.sqrt(TARGET_PIXELS / Math.max(1, box.width * box.height)));
      const width = Math.max(1, Math.round(box.width * ratio));
      const height = Math.max(1, Math.round(box.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        // Both are made for one size of canvas
        ground = null;
        gradients = null;
      }
    };

    const paint = () => {
      if (!ground) ground = buildGround(canvas.width, canvas.height, haze);
      // Scroll moves clarity in small steps. A thousandth is finer than a colour level.
      const progress = still ? 1 : Math.round(input.current.progress * 1000) / 1000;
      if (!gradients || gradients.progress !== progress) gradients = buildGradients(ctx, progress);

      const size = { width: canvas.width, height: canvas.height };
      if (still) draw(ctx, ground, gradients, { ...size, mouse: { x: REST[0], y: REST[1] }, time: 0 });
      else draw(ctx, ground, gradients, { ...size, mouse: mouse.current, time: time.current });

      if (!announced.current) {
        announced.current = true;
        // Report on the frame after this one, once it is on screen
        requestAnimationFrame(() => painted.current());
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      // A capped step keeps the haze from jumping after the loop has been paused
      const delta = Math.min((now - (last || now)) / 1000, 0.1);
      last = now;
      time.current += delta;
      const t = time.current;

      let targetX = input.current.x;
      let targetY = input.current.y;
      if (coarse) {
        // No pointer on touch devices, so the beam drifts on its own
        targetX = 0.5 + Math.sin(t * 0.21) * 0.18;
        targetY = 0.58 + Math.cos(t * 0.17) * 0.10;
      }

      // Lerped, never applied raw. 0.06 is the value.
      mouse.current.x += (targetX - mouse.current.x) * 0.06;
      mouse.current.y += (targetY - mouse.current.y) * 0.06;

      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      resize();
      if (still || !running) {
        // One frame: the static frame under reduced motion, or the last state while paused
        paint();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (still || !running) paint();
    });
    observer.observe(canvas);

    // The haze is a small image. The first frame waits for it, so the canvas never
    // shows a frame without it. Once loaded it is kept for every later run.
    let image: HTMLImageElement | null = null;
    if (haze) {
      start();
    } else {
      image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (stopped) return;
        haze = image;
        hazeRef.current = image;
        ground = null;
        start();
      };
      image.onerror = () => {
        if (!stopped) start();
      };
      image.src = HAZE_SRC;
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [input, running, still]);

  return <canvas ref={canvasRef} className="beam-canvas" />;
}
