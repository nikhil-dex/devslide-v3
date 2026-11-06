import test from "node:test";
import assert from "node:assert/strict";
import { buildCsp } from "../lib/csp.mjs";

function directive(policy, name) {
  return policy.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name} `));
}

test("production pages use a per-request nonce and strict-dynamic", () => {
  const policy = buildCsp({ nonce: "test-nonce" });

  assert.match(directive(policy, "script-src"), /'nonce-test-nonce'/);
  assert.match(directive(policy, "script-src"), /'strict-dynamic'/);
  assert.doesNotMatch(directive(policy, "script-src"), /'unsafe-inline'/);
  assert.doesNotMatch(directive(policy, "script-src"), /'unsafe-eval'/);
  assert.equal(directive(policy, "default-src"), "default-src 'self'");
  assert.equal(directive(policy, "object-src"), "object-src 'none'");
});

test("development pages allow eval only for the development runtime", () => {
  const policy = buildCsp({ nonce: "dev-nonce", isDevelopment: true });
  assert.match(directive(policy, "script-src"), /'unsafe-eval'/);
});

test("sandbox policy permits inline slide scripts only on the isolated editor route", () => {
  const policy = buildCsp({ isSandbox: true });
  assert.match(directive(policy, "script-src"), /'unsafe-inline'/);
  assert.match(directive(policy, "script-src"), /'unsafe-eval'/);
  assert.deepEqual(directive(policy, "script-src").split(" ").slice(1), [
    "'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'", "'unsafe-eval'", "blob:",
  ]);
  assert.equal(directive(policy, "base-uri"), "base-uri 'none'");
  assert.equal(directive(policy, "form-action"), "form-action 'none'");
});

test("editor styles load on direct visits and after client-side navigation", () => {
  for (const options of [{ isSandbox: true }, { nonce: "entry-page" }]) {
    assert.equal(
      directive(buildCsp(options), "style-src"),
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/editor/editor.main.css",
    );
  }
});

test("non-sandbox policy rejects a missing nonce", () => {
  assert.throws(() => buildCsp(), /nonce is required/);
});

test("static gallery pages allow inline scripts but not eval", () => {
  const policy = buildCsp({ isGallery: true });
  assert.match(directive(policy, "script-src"), /'unsafe-inline'/);
  assert.doesNotMatch(directive(policy, "script-src"), /'unsafe-eval'/);
  assert.equal(directive(policy, "object-src"), "object-src 'none'");
});
