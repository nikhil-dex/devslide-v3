import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Playwright drives a real Chromium install and must be require()d at
  // runtime rather than traced into the server bundle.
  serverExternalPackages: ["playwright"],

  // playwright-core loads its browser registry during module initialization.
  // Force the file into both export functions for Vercel deployments.
  outputFileTracingIncludes: {
    "/api/export-pdf": ["./node_modules/playwright-core/browsers.json"],
    "/api/export-pptx": ["./node_modules/playwright-core/browsers.json"],
  },
};

export default nextConfig;
