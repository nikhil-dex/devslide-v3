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
  const hasDoctype = /^\s*<!doctype\s+html\s*>/i.test(source);
  const document = hasDoctype ? source : "<!DOCTYPE html>" + source;

  if (/<head\b[^>]*>/i.test(document)) {
    return document.replace(/<head\b[^>]*>/i, (head) => head + CONSOLE_BRIDGE);
  }

  if (/<html\b[^>]*>/i.test(document)) {
    return document.replace(/<html\b[^>]*>/i, (root) => root + "<head>" + CONSOLE_BRIDGE + "</head>");
  }

  const doctype = document.match(/^\s*<!doctype\s+html\s*>/i);
  const body = doctype ? document.slice(doctype[0].length) : document;
  return (doctype ? doctype[0] : "<!DOCTYPE html>") +
    "<html><head>" + CONSOLE_BRIDGE + "</head><body>" + body + "</body></html>";
}
