import test from "node:test";
import assert from "node:assert/strict";
import { sendRequestToGemini } from "../lib/gemini.js";

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
});

test("Gemini API keys are sent in a header, never in the request URL", async () => {
  process.env.GEMINI_API_KEY = "platform-secret-key";
  delete process.env.GEMINI_MODEL;

  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return Response.json({ candidates: [{ content: { parts: [{ text: "ok" }] } }] });
  };

  const result = await sendRequestToGemini("hello");
  assert.equal(result.candidates[0].content.parts[0].text, "ok");
  assert.equal(new URL(captured.url).searchParams.has("key"), false);
  assert.equal(captured.options.headers["x-goog-api-key"], "platform-secret-key");
});

test("a BYOK key overrides the platform key without entering the URL", async () => {
  process.env.GEMINI_API_KEY = "platform-secret-key";

  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return Response.json({ candidates: [{ content: { parts: [{ text: "ok" }] } }] });
  };

  await sendRequestToGemini("hello", { apiKey: "user-owned-secret" });
  assert.equal(new URL(captured.url).searchParams.has("key"), false);
  assert.equal(captured.options.headers["x-goog-api-key"], "user-owned-secret");
});
