// A side-on section through a headlight: reflector and bulb on the left, the lens on the
// right. 800 by 500, stroked and never filled, coloured only by the tokens (see the lens
// rules in components.css). The four named layers and the glow are what the pinned
// process timeline in MOTION.md 5.4 drives:
//
//   #layer-oxidation  the dead, yellowed surface. Oxide.
//   #layer-scratches  hairlines across the surface. Beam-24.
//   #layer-polish     a specular band that sweeps across the lens. Beam.
//   #layer-coating    the new UV coat, drawn along the surface. Xenon.
//   #lens-glow        light leaving the clear lens.
//
// Everything is derived from one curve, the outer surface of the lens, so the layers
// sit exactly on it.

type Point = [number, number];
type Cubic = [Point, Point, Point, Point];

// The outer surface of the lens, top to bottom
const OUTER: Cubic[] = [
  [[440, 60], [520, 100], [560, 180], [560, 250]],
  [[560, 250], [560, 320], [520, 400], [440, 440]],
];

// The inner surface, 24 units behind it at the crown, bottom to top
const INNER_BACK: Cubic[] = [
  [[440, 416], [505, 380], [536, 315], [536, 250]],
  [[536, 250], [536, 185], [505, 120], [440, 84]],
];

/** Length of every scratch. The dash pattern in components.css is built on it. */
export const SCRATCH_LENGTH = 26;

const round = (n: number) => Math.round(n * 10) / 10;

function at([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function tangent([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const x = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const y = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  const length = Math.hypot(x, y) || 1;
  return [x / length, y / length];
}

// Evenly spread samples along the outer surface, each with the direction it runs in and
// the direction that points out of the lamp
const SAMPLES = OUTER.flatMap((curve, index) =>
  Array.from({ length: 33 }, (_, step) => step / 32)
    .filter((t) => index === 0 || t > 0)
    .map((t) => {
      const along = tangent(curve, t);
      return { point: at(curve, t), along, out: [along[1], -along[0]] as Point };
    }),
);

function pathThrough(points: Point[]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${round(x)} ${round(y)}`).join(" ");
}

const curveTo = ([, p1, p2, p3]: Cubic) => `C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;

// The lens body: down the outer surface, across, back up the inner one, and closed
const SHELL = `M440 60 ${OUTER.map(curveTo).join(" ")} L440 416 ${INNER_BACK.map(curveTo).join(" ")} Z`;

// The new coat: a clean line a little outside the surface
const COATING = pathThrough(SAMPLES.map(({ point, out }) => [point[0] + out[0] * 8, point[1] + out[1] * 8]));

// Oxidation: the same line, closer in and uneven
const OXIDATION = pathThrough(
  SAMPLES.map(({ point, out }, index) => {
    const lift = 5 + Math.sin(index * 2.4) * Math.cos(index * 0.9) * 2.6;
    return [point[0] + out[0] * lift, point[1] + out[1] * lift];
  }),
);

// Scratches: short strokes of equal length, cut across the surface at an angle
const SCRATCHES = SAMPLES.filter((_, index) => index % 7 === 3).map(({ point, along, out }) => {
  const dx = along[0] * 0.55 + out[0] * 0.84;
  const dy = along[1] * 0.55 + out[1] * 0.84;
  const scale = SCRATCH_LENGTH / 2 / Math.hypot(dx, dy);
  const cx = point[0] - out[0] * 4;
  const cy = point[1] - out[1] * 4;
  return pathThrough([
    [cx - dx * scale, cy - dy * scale],
    [cx + dx * scale, cy + dy * scale],
  ]);
});

// Light leaving the lens, fanning out a little
const RAYS = [-120, -60, 0, 60, 120].map((offset) => {
  const startX = 574 - Math.abs(offset) * 0.42;
  return `M${round(startX)} ${250 + offset} L784 ${round(250 + offset * 1.5)}`;
});

type LensCrossSectionProps = {
  className?: string;
};

export function LensCrossSection({ className }: LensCrossSectionProps) {
  return (
    <svg
      className={className ? `lens-figure ${className}` : "lens-figure"}
      viewBox="0 0 800 500"
      role="img"
      aria-label="Cross-section of a headlight: the reflector, the bulb and the lens, with the layers the four stages work on"
    >
      <defs>
        <clipPath id="lens-clip">
          <path d={SHELL} />
        </clipPath>
      </defs>

      {/* Reflector, socket and bulb */}
      <g className="lens-structure">
        <path d="M440 60 C300 62 170 150 170 250 C170 350 300 438 440 440" />
        <path d="M170 232 H124 V268 H170" />
        <path d="M170 250 H245" />
        <circle cx="262" cy="250" r="17" />
        <path d="M254 250 q4 -9 8 0 t8 0" />
      </g>

      {/* Light leaving the lens */}
      <g id="lens-glow">
        {RAYS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* The lens itself */}
      <path className="lens-shell" d={SHELL} />

      {/* Stage 3: the specular band. It is clipped to the lens, so it only shows on it. */}
      <g clipPath="url(#lens-clip)">
        <path id="layer-polish" d="M540 30 L440 470" />
      </g>

      {/* Stage 4: the new coat */}
      <path id="layer-coating" d={COATING} />

      {/* Stage 2: what sanding leaves behind */}
      <g id="layer-scratches">
        {SCRATCHES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Stage 1: the oxidized surface */}
      <path id="layer-oxidation" d={OXIDATION} />
    </svg>
  );
}
