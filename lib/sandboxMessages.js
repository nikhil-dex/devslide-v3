/**
 * Accept console bridge messages only from the currently mounted sandbox
 * iframe. Sandboxed srcDoc documents have an opaque origin, so source-window
 * identity is the trust boundary rather than event.origin.
 */
export function readSandboxConsoleMessage(event, iframeWindow) {
  if (!iframeWindow || event?.source !== iframeWindow) return null;

  const payload = event.data;
  if (payload?.type !== "log" || !Array.isArray(payload.data)) return null;

  return payload.data;
}
