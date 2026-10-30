import test from "node:test";
import assert from "node:assert/strict";
import { getPublicDeckPayload } from "../lib/publicDeckAccess.mjs";

test("protected public decks never include slide content in the public response", () => {
  const result = getPublicDeckPayload({
    passwordHash: "bcrypt-hash",
    ppt_History: ["secret slide"],
  });
  assert.equal(result.requiresPassword, true);
  assert.deepEqual(result.slides, []);
});

test("unprotected public decks include their slides", () => {
  const result = getPublicDeckPayload({
    passwordHash: null,
    ppt_History: ["slide one", "slide two"],
  });
  assert.equal(result.requiresPassword, false);
  assert.deepEqual(result.slides, ["slide one", "slide two"]);
});

test("legacy nested slide arrays are normalized", () => {
  const result = getPublicDeckPayload({
    passwordHash: null,
    ppt_History: [["slide one", "slide two"]],
  });
  assert.deepEqual(result.slides, ["slide one", "slide two"]);
});
