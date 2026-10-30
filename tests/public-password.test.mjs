import test, { mock } from "node:test";
import assert from "node:assert/strict";

globalThis.__publicDeck = {
  _id: "507f1f77bcf86cd799439011",
  titles: "Protected deck",
  ppt_History: ["<html>secret slide</html>"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  shareToken: "public-token",
  passwordHash: "hashed-password",
  viewCount: 0,
};

globalThis.__rateLimitResult = { ok: true };
globalThis.__passwordMatches = true;

mock.module(new URL("../lib/mongodb.js", import.meta.url).href, {
  namedExports: { dbConnect: async () => {} },
});

mock.module(new URL("../models/Ppts.js", import.meta.url).href, {
  namedExports: {
    findOneAndUpdate: () => ({
      select: () => ({
        lean: async () => ({ ...globalThis.__publicDeck }),
      }),
    }),
    findOne: () => ({
      select: () => ({
        lean: async () => ({ ...globalThis.__publicDeck }),
      }),
    }),
  },
});

mock.module(new URL("../lib/rateLimit.js", import.meta.url).href, {
  namedExports: {
    rateLimit: () => globalThis.__rateLimitResult,
    rateLimitResponse: (seconds) =>
      Response.json({ error: `Too many requests — try again in ${seconds}s.` }, { status: 429 }),
  },
});

mock.module("bcryptjs", {
  namedExports: {
    default: {
      compare: async () => globalThis.__passwordMatches,
    },
    compare: async () => globalThis.__passwordMatches,
  },
});

const { GET } = await import("../app/api/ppt/public/[token]/route.js");
const { POST } = await import("../app/api/ppt/public/[token]/verify/route.js");

function request(body) {
  return new Request("https://airdeck.test/api/ppt/public/public-token/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test.beforeEach(() => {
  globalThis.__publicDeck.passwordHash = "hashed-password";
  globalThis.__rateLimitResult = { ok: true };
  globalThis.__passwordMatches = true;
});

test("public GET never returns slide HTML for a password-protected deck", async () => {
  const response = await GET(new Request("https://airdeck.test"), {
    params: Promise.resolve({ token: "public-token" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.requiresPassword, true);
  assert.deepEqual(body.slides, []);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.doesNotMatch(JSON.stringify(body), /secret slide/);
});

test("public GET still returns slides for an unprotected public deck", async () => {
  globalThis.__publicDeck.passwordHash = null;
  const response = await GET(new Request("https://airdeck.test"), {
    params: Promise.resolve({ token: "public-token" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.requiresPassword, false);
  assert.deepEqual(body.slides, ["<html>secret slide</html>"]);
});

test("wrong password does not disclose slide HTML", async () => {
  globalThis.__passwordMatches = false;
  const response = await POST(request({ password: "wrong-password" }), {
    params: Promise.resolve({ token: "public-token" }),
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.authenticated, false);
  assert.equal(body.slides, undefined);
});

test("correct password returns slide HTML only after verification", async () => {
  const response = await POST(request({ password: "correct-password" }), {
    params: Promise.resolve({ token: "public-token" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.authenticated, true);
  assert.deepEqual(body.slides, ["<html>secret slide</html>"]);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("password verification rejects missing and oversized passwords", async () => {
  const missing = await POST(request({ password: "" }), {
    params: Promise.resolve({ token: "public-token" }),
  });
  const oversized = await POST(request({ password: "x".repeat(257) }), {
    params: Promise.resolve({ token: "public-token" }),
  });

  assert.equal(missing.status, 400);
  assert.equal(oversized.status, 400);
});

test("password verification is rate limited", async () => {
  globalThis.__rateLimitResult = { ok: false, retryAfterSeconds: 30 };
  const response = await POST(request({ password: "guess" }), {
    params: Promise.resolve({ token: "public-token" }),
  });

  assert.equal(response.status, 429);
});
