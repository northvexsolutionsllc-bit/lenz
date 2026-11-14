// GLSL fragment shaders are imported as strings. See the "*.frag" rule in next.config.ts.
declare module "*.frag" {
  const source: string;
  export default source;
}
