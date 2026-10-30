import test from "node:test";
import assert from "node:assert/strict";
import { withConsoleBridge } from "../lib/sandboxDocument.js";
import { readStoredSlides } from "../lib/sandboxStorage.js";

test("console bridge stays after the doctype and inside an existing head", () => {
  const html = "<!DOCTYPE html><html><head><title>Slide</title></head><body></body></html>";
  const result = withConsoleBridge(html);
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(result.indexOf("<head>") < result.indexOf("parent.postMessage"));
  assert.ok(result.indexOf("parent.postMessage") < result.indexOf("</head>"));
  assert.ok(result.includes("</script><title>Slide</title>"));
});

test("console bridge creates a head for a full HTML document without one", () => {
  const result = withConsoleBridge("<!DOCTYPE html><html><body>Slide</body></html>");
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(result.includes("<html><head>"));
  assert.ok(result.includes("parent.postMessage"));
  assert.ok(result.includes("</head><body>"));
});

test("console bridge wraps an HTML fragment in a standards-mode document", () => {
  const result = withConsoleBridge("<main>Slide</main>");
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(result.includes("<body><main>Slide</main></body>"));
});

test("valid stored slides are returned", () => {
  assert.deepEqual(readStoredSlides(() => '[ "<html>one</html>", "<html>two</html>" ]'), [
    "<html>one</html>", "<html>two</html>",
  ]);
});

test("malformed JSON and non-array values recover to an empty slide list", () => {
  assert.deepEqual(readStoredSlides(() => "{broken"), []);
  assert.deepEqual(readStoredSlides(() => '{"slide":"not-an-array"}'), []);
});

test("non-string slide entries are discarded", () => {
  assert.deepEqual(readStoredSlides(() => '["<html>ok</html>", 42, null, {}]'), [
    "<html>ok</html>",
  ]);
});

test("storage read failures recover without crashing the Sandbox", () => {
  assert.deepEqual(readStoredSlides(() => { throw new Error("Storage unavailable"); }), []);
});

test("console bridge adds a doctype to full documents that omit it", () => {
  const result = withConsoleBridge("<html><head></head><body>Slide</body></html>");
  assert.ok(result.startsWith("<!DOCTYPE html>"));
});
