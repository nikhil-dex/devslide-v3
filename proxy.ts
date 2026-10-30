import { NextRequest, NextResponse } from "next/server";
import { buildCsp } from "@/lib/csp.mjs";

function createNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const isSandbox = request.nextUrl.pathname === "/sandbox" ||
    request.nextUrl.pathname.startsWith("/sandbox/");
  const isDevelopment = process.env.NODE_ENV === "development";

  const csp = buildCsp({
    nonce,
    isDevelopment,
    isSandbox,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    [
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
    ].join(", ")
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  return response;
}

export const config = {
  matcher: [
    /*
     * Apply to application routes and API routes. Skip Next.js internals and
     * static assets; API routes still receive the baseline security headers.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
