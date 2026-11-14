import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The whole stylesheet is about 8KB compressed. Inlining it removes the one
    // render-blocking request between the HTML arriving and first paint.
    inlineCss: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // GLSL sources are imported as plain strings
      "*.frag": {
        type: "text",
      },
    },
  },
};

export default nextConfig;
