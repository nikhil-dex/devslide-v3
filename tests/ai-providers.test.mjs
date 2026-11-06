import test from "node:test";
import assert from "node:assert/strict";
import { resolveAiSelection } from "../lib/aiModels.js";
import { getAiRequestOptions } from "../lib/aiRequest.js";
import { llmComplete } from "../lib/llm.js";
import { byokHeaders } from "../lib/byok.js";

const originalFetch = globalThis.fetch;
const originalEnv = { GEMINI_API_KEY: process.env.GEMINI_API_KEY, GROQ_API_KEY: process.env.GROQ_API_KEY };
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete globalThis.window;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

test("rejects arbitrary providers and cross-provider model IDs", () => {
  for (const selection of [{ provider: "__proto__" }, { provider: "unknown" },
    { provider: "groq", model: "gemini-3.6-flash" }, { model: "../anything" }]) {
    assert.throws(() => resolveAiSelection(selection), { status: 400 });
  }
});

test("Groq selects only Groq credentials and consumes no app credits", () => {
  process.env.GROQ_API_KEY = "groq-platform";
  process.env.GEMINI_API_KEY = "gemini-platform";
  const req = new Request("https://app.test", { headers: { "x-gemini-key": "gemini-user" } });
  const options = getAiRequestOptions(req, { provider: "groq" });
  assert.equal(options.apiKey, "groq-platform");
  assert.equal(options.usingByok, false);
  assert.equal(options.chargeCredits, false);
  const byok = getAiRequestOptions(new Request("https://app.test", {
    headers: { "x-groq-key": "groq-user", "x-gemini-key": "gemini-user" },
  }), { provider: "groq" });
  assert.equal(byok.apiKey, "groq-user");
  assert.equal(byok.usingByok, true);
});

test("Gemini platform requests charge credits; Gemini BYOK does not", () => {
  process.env.GEMINI_API_KEY = "gemini-platform";
  assert.equal(getAiRequestOptions(new Request("https://app.test"), {}).chargeCredits, true);
  const options = getAiRequestOptions(new Request("https://app.test", {
    headers: { "x-gemini-key": "gemini-user" },
  }), {});
  assert.equal(options.chargeCredits, false);
  assert.equal(options.apiKey, "gemini-user");
});

test("missing Groq credentials do not fall back to a Gemini key", () => {
  delete process.env.GROQ_API_KEY;
  process.env.GEMINI_API_KEY = "gemini-only";
  assert.throws(() => getAiRequestOptions(new Request("https://app.test"), { provider: "groq" }), { status: 503 });
});

test("browser headers contain only the selected provider key", () => {
  globalThis.window = { localStorage: { getItem: (key) => ({ pptGeminiKey: "google-key", pptGroqKey: "groq-key" })[key] } };
  assert.deepEqual(byokHeaders("groq"), { "x-groq-key": "groq-key" });
  assert.deepEqual(byokHeaders("gemini"), { "x-gemini-key": "google-key" });
  window.localStorage.getItem = () => { throw new Error("unavailable"); };
  assert.deepEqual(byokHeaders("groq"), {});
});

test("Groq sends the chosen model, header-only key and JSON mode for decks", async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, ...options, body: JSON.parse(options.body) };
    return Response.json({ choices: [{ finish_reason: "stop", message: { content: '{"version":1}' } }] });
  };
  const result = await llmComplete("Return JSON", { provider: "groq", model: "openai/gpt-oss-120b", apiKey: "secret", json: true });
  assert.equal(captured.url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(captured.headers.Authorization, "Bearer secret");
  assert.equal(captured.body.model, "openai/gpt-oss-120b");
  assert.deepEqual(captured.body.response_format, { type: "json_object" });
  assert.ok(captured.signal instanceof AbortSignal);
  assert.equal(JSON.stringify(captured.body).includes("secret"), false);
  assert.equal(result.text, '{"version":1}');
});

test("Groq HTML editing uses text mode and rejects truncated output", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(JSON.parse(options.body).response_format, undefined);
    return Response.json({ choices: [{ finish_reason: "length", message: { content: "<!DOCTYPE html>" } }] });
  };
  await assert.rejects(llmComplete("Edit HTML", { provider: "groq", apiKey: "secret" }), /output limit/);
});

test("Groq quota errors are actionable and do not echo upstream secrets", async () => {
  globalThis.fetch = async () => new Response("sensitive upstream payload", { status: 429 });
  await assert.rejects(llmComplete("x", { provider: "groq", apiKey: "secret" }), (error) =>
    error.status === 429 && /usage limit/.test(error.message) && !/sensitive/.test(error.message));
});

test("explicit Gemini model does not silently fall back or retry", async () => {
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    assert.match(url, /gemini-3\.8-flash:generateContent$/);
    return new Response("unavailable", { status: 503 });
  };
  await assert.rejects(llmComplete("x", { model: "gemini-3.8-flash", apiKey: "secret" }));
  assert.equal(calls, 1);
});

test("cancellation stops provider requests instead of falling back", async () => {
  const controller = new AbortController();
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    controller.abort();
  });
  await assert.rejects(llmComplete("x", { apiKey: "secret", signal: controller.signal }), { status: 499 });
});
