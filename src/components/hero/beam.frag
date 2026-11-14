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
