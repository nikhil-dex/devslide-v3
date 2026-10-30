// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "serial=()",
      "bluetooth=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
    ].join(", "),
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
// {
//   key: "Cross-Origin-Opener-Policy",
//   value: "same-origin-allow-popups",
// },
//  {
//   key: "Cross-Origin-Resource-Policy",
//   value: "cross-origin",
// },
  {
    key: "Content-Security-Policy",
    // value: [
    //   "default-src 'self'",
    //   "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    //   "style-src 'self' 'unsafe-inline' https:",
    //   "img-src 'self' data: blob: https:",
    //   "font-src 'self' data: https:",
    //   "connect-src 'self' blob: https://generativelanguage.googleapis.com",
    // //   "worker-src 'self' blob:",
    //   "frame-src 'self' blob:",
    //   "object-src 'none'",
    //   "base-uri 'self'",
    //   "form-action 'self'",
    // //   "frame-ancestors 'self'",
    //   "upgrade-insecure-requests",
    //   "child-src 'self' blob:",
    // ].join("; "),
    value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Playwright drives a real Chromium install and must be require()d at
  // runtime rather than traced into the server bundle.
  serverExternalPackages: ["playwright"],

  // playwright-core loads its browser registry during module initialization:
  //
  //   registry = new Registry(require(path.join(packageRoot, "browsers.json")))
  //
  // The path is computed, so Next's static tracer (@vercel/nft) never sees the
  // dependency: 84 of playwright-core's 111 files get traced and browsers.json
  // is not one of them. On Vercel the import then throws before any browser is
  // launched:
  //
  //   Cannot find module '/var/task/node_modules/playwright-core/browsers.json'
  //
  // Force the file (1.7 KB) into both export functions.
  outputFileTracingIncludes: {
    "/api/export-pdf": ["./node_modules/playwright-core/browsers.json"],
    "/api/export-pptx": ["./node_modules/playwright-core/browsers.json"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;