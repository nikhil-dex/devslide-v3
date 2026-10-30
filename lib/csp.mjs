const SELF = "'self'";

function formatDirectives(directives) {
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Build the page CSP.
 *
 * The editor route is intentionally isolated: its preview iframe executes
 * user-authored slide HTML under iframe sandbox="allow-scripts" without
 * allow-same-origin. Other application pages use a per-request nonce.
 */
export function buildCsp({
  nonce,
  isDevelopment = false,
  isSandbox = false,
  isGallery = false,
} = {}) {
  const common = {
    "default-src": [SELF],
    "object-src": ["'none'"],
    "base-uri": [SELF],
    "form-action": [SELF],
    "frame-ancestors": [SELF],
    "img-src": [SELF, "data:", "blob:", "https:"],
    "font-src": [SELF, "data:", "https:"],
    "style-src": [SELF, "'unsafe-inline'"],
    "connect-src": [SELF],
    "frame-src": [SELF, "blob:"],
    "worker-src": [SELF, "blob:"],
    "manifest-src": [SELF],
  };

  if (isGallery) {
    // Repository-controlled static showcase documents contain inline viewer
    // scripts. They receive no eval permission and are embedded in opaque-origin
    // iframes with allow-scripts only.
    return formatDirectives({
      ...common,
      "script-src": [SELF, "'unsafe-inline'"],
    });
  }

  if (isSandbox) {
    return formatDirectives({
      ...common,
      // The preview is a deliberately script-enabled, cross-origin-isolated
      // iframe. Keep this exception scoped to /sandbox only.
      "script-src": [SELF, "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      "base-uri": ["'none'"],
      "form-action": ["'none'"],
    });
  }

  if (typeof nonce !== "string" || !nonce.trim()) {
    throw new TypeError("A per-request CSP nonce is required outside the sandbox.");
  }

  const scriptSources = [SELF, `'nonce-${nonce}'`, "'strict-dynamic'"];
  if (isDevelopment) scriptSources.push("'unsafe-eval'");

  return formatDirectives({
    ...common,
    "script-src": scriptSources,
  });
}
