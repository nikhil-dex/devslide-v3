const SELF = "'self'";
// Match the runtime shipped by @monaco-editor/loader. Keep this URL in sync
// when upgrading the loader; only its editor stylesheet is permitted.
const MONACO_STYLESHEET = "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/editor/editor.main.css";

function formatDirectives(directives) {
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Build the page CSP.
 *
 * @param {{ nonce?: string, isDevelopment?: boolean, isSandbox?: boolean, isGallery?: boolean }} [options]
 * @returns {string}
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
    // Client-side navigation into the editor retains the initial document's
    // policy, so this must also be allowed on non-editor entry pages.
    "style-src": [SELF, "'unsafe-inline'", MONACO_STYLESHEET],
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
      "script-src": [SELF, "https://cdn.jsdelivr.net", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
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
