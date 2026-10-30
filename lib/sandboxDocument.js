const CONSOLE_BRIDGE = `<script>
(() => {
  const forward = (type, args) => {
    try {
      parent.postMessage({ type: "log", data: args }, "*");
    } catch {}
  };

  const originalLog = console.log.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args) => {
    forward("log", args);
    originalLog(...args);
  };

  console.error = (...args) => {
    forward("log", ["ERROR:", ...args]);
    originalError(...args);
  };

  window.addEventListener("error", (event) => {
    forward("log", ["RUNTIME:", event.message || "Unknown runtime error"]);
  });
})();
<\/script>`;

export function withConsoleBridge(html) {
  const source = typeof html === "string" ? html : "";
  if (/<head\\b[^>]*>/i.test(source)) {
    return source.replace(/<head\\b[^>]*>/i, (head) => head + CONSOLE_BRIDGE);
  }

  if (/<html\\b[^>]*>/i.test(source)) {
    return source.replace(/<html\\b[^>]*>/i, (root) => root + "<head>" + CONSOLE_BRIDGE + "</head>");
  }

  const doctype = source.match(/^\\s*<!doctype\\s+html\\s*>/i);
  const body = doctype ? source.slice(doctype[0].length) : source;
  return (doctype ? doctype[0] : "<!DOCTYPE html>") +
    "<html><head>" + CONSOLE_BRIDGE + "</head><body>" + body + "</body></html>";
}
