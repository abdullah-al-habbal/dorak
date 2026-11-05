import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The E2E server sets this so it can run next to `npm run dev`; Next allows one dev server per distDir.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // The dev badge floats over bottom-anchored controls and swallows E2E clicks on phones.
  devIndicators: process.env.DASHBOARD_E2E === "1" ? false : undefined,
  cacheComponents: true,
  partialPrefetching: true,
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
