import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

let reservations, refunds, calls, failure, text;
const originalEnv = { GEMINI_API_KEY: process.env.GEMINI_API_KEY, GROQ_API_KEY: process.env.GROQ_API_KEY };
const stub = (path, exports) => mock.module(new URL(path, import.meta.url).href, { namedExports: exports });
mock.module("next-auth/next", { namedExports: { getServerSession: async () => ({ user: { email: `${randomUUID()}@test.local` } }) } });
stub("../app/api/auth/[...nextauth]/route.js", { authOptions: {} });
stub("../lib/mongodb.js", { dbConnect: async () => {} });
mock.module(new URL("../models/User.js", import.meta.url).href, { defaultExport: {
  findOne: () => ({ select: async () => ({ _id: "fixture" }) }), exists: async () => true,
} });
stub("../lib/credits.js", {
  reserveCredit: async () => { reservations++; return { _id: "fixture", credit: 4 }; },
  refundCredit: async () => { refunds++; },
});
stub("../lib/llm.js", { llmComplete: async (_prompt, options) => {
  calls.push(options);
  if (failure) throw failure;
  return { text, blockReason: null };
} });
const { POST: generate } = await import("../app/api/generate-ppt/route.js");
const { POST: edit } = await import("../app/api/edit-slide/route.js");
const html = "<!DOCTYPE html><html><body>Updated</body></html>";
const source = { version: 1, theme: "linear", slides: [{ component: "hero", props: { title: "Test" } }] };
test.beforeEach(() => {
  reservations = refunds = 0; calls = []; failure = null;
  process.env.GEMINI_API_KEY = "gemini-test";
  process.env.GROQ_API_KEY = "groq-test";
});
test.after(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
const request = (body, headers = {}) => new Request("http://localhost/api/ai", {
  method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
});

for (const [name, route, body, output] of [
  ["generation", generate, { prompt: "One slide" }, JSON.stringify(source)],
  ["editing", edit, { slideHtml: html, instruction: "Update" }, html],
]) {
  test(`${name}: Groq succeeds without reserving credits and receives the chosen model`, async () => {
    text = output;
    const response = await route(request({ ...body, provider: "groq", model: "openai/gpt-oss-120b" }));
    assert.equal(response.status, 200);
    assert.equal(reservations, 0);
    assert.equal(refunds, 0);
    assert.equal(calls[0].provider, "groq");
    assert.equal(calls[0].model, "openai/gpt-oss-120b");
    assert.equal((await response.json()).credit, null);
  });
  test(`${name}: model validation and missing keys happen before credit reservation`, async () => {
    assert.equal((await route(request({ ...body, model: "unapproved" }))).status, 400);
    delete process.env.GROQ_API_KEY;
    assert.equal((await route(request({ ...body, provider: "groq" }))).status, 503);
    assert.equal(reservations, 0);
    assert.equal(calls.length, 0);
  });
  test(`${name}: Gemini timeout refunds the reserved credit`, async () => {
    failure = Object.assign(new Error("Timed out"), { status: 504 });
    assert.equal((await route(request(body))).status, 504);
    assert.equal(reservations, 1);
    assert.equal(refunds, 1);
  });
  test(`${name}: invalid Gemini output refunds the reserved credit`, async () => {
    text = "invalid output";
    assert.equal((await route(request(body))).status, 502);
    assert.equal(reservations, 1);
    assert.equal(refunds, 1);
  });
  test(`${name}: Gemini BYOK bypasses credits`, async () => {
    text = output;
    assert.equal((await route(request(body, { "x-gemini-key": "own-key" }))).status, 200);
    assert.equal(reservations, 0);
    assert.equal(calls[0].apiKey, "own-key");
  });
}
