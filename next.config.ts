import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // DECISIONS.md 10. The old site was one page, so these are defensive against links
  // already in the wild. Both are permanent. The old in-page anchors are not here: a
  // fragment never reaches the server, so the root layout handles those in the browser.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/assets/:path*", destination: "/media/:path*", permanent: true },
    ];
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
    },
  },
};

export default nextConfig;
