"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector2, type RawShaderMaterial } from "three";
import fragmentShader from "./beam.frag";

// One fullscreen plane. The vertex stage only has to cover the viewport.
const VERTEX_SHADER = `
attribute vec3 position;

void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// MOTION.md 2: the one static frame, and where the beam rests before the pointer moves
const REST: [number, number] = [0.5, 0.62];

// MOTION.md 7: above this many pixels, render at 0.75 scale and let CSS upscale
const MAX_PIXELS = 2_600_000;
const MAX_DPR = 1.75;

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

// The hero beam. MOTION.md 5.1 and 7
// A @react-three/fiber Canvas holding one fullscreen plane with the beam shader.
export function BeamCanvas({ input, running, still, onPainted }: BeamCanvasProps) {
  return (
    <Canvas
      dpr={[1, MAX_DPR]}
      frameloop={still ? "demand" : running ? "always" : "never"}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      flat
    >
      <RenderScale />
      <BeamPlane input={input} still={still} onPainted={onPainted} />
    </Canvas>
  );
}

// Holds the pixel ratio inside the budget. It reads the current ratio as well as the
// size, because the Canvas re-applies its own dpr range whenever it re-renders, and
// this has to win again each time that happens.
function RenderScale() {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const current = useThree((state) => state.viewport.dpr);
  const setDpr = useThree((state) => state.setDpr);

  useEffect(() => {
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DPR);
    const pixels = width * dpr * height * dpr;
    const wanted = pixels > MAX_PIXELS ? dpr * 0.75 : dpr;
    if (Math.abs(current - wanted) > 0.001) setDpr(wanted);
  }, [width, height, current, setDpr]);

  return null;
}

type BeamPlaneProps = Pick<BeamCanvasProps, "input" | "still" | "onPainted">;

function BeamPlane({ input, still, onPainted }: BeamPlaneProps) {
  const material = useRef<RawShaderMaterial>(null);
  const mouse = useRef({ x: REST[0], y: REST[1] });
  const aim = useRef({ x: REST[0], y: REST[1] });
  const time = useRef(0);
  const coarse = useRef(false);
  const announced = useRef(false);

  const [uniforms] = useState(() => ({
    uRes: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(REST[0], REST[1]) },
    uTime: { value: 0 },
    uProgress: { value: 0 },
  }));

  useEffect(() => {
    coarse.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useFrame((state, delta) => {
    const live = material.current?.uniforms;
    if (!live) return;

    state.gl.getDrawingBufferSize(live.uRes.value);

    if (still) {
      live.uMouse.value.set(REST[0], REST[1]);
      live.uTime.value = 0;
      live.uProgress.value = 1;
    } else {
      // A capped step keeps the haze from jumping after the loop has been paused
      time.current += Math.min(delta, 0.1);
      const t = time.current;
      const target = aim.current;

      if (coarse.current) {
        // No pointer on touch devices, so the beam drifts on its own
        target.x = 0.5 + Math.sin(t * 0.21) * 0.18;
        target.y = 0.58 + Math.cos(t * 0.17) * 0.10;
      } else {
        target.x = input.current.x;
        target.y = input.current.y;
      }

      // Lerped, never applied raw. 0.06 is the value.
      mouse.current.x += (target.x - mouse.current.x) * 0.06;
      mouse.current.y += (target.y - mouse.current.y) * 0.06;

      live.uMouse.value.set(mouse.current.x, mouse.current.y);
      live.uTime.value = t;
      live.uProgress.value = input.current.progress;
    }

    if (!announced.current) {
      announced.current = true;
      // This callback runs just before the frame is drawn. Report on the frame after.
      requestAnimationFrame(onPainted);
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
