// Ownership/security tests for the deck APIs.
// Runs against a live server (default http://localhost:3210):
//   npm run build && PORT=3210 npm start   (in another terminal)
//   npm run test:api
// Sessions are minted with next-auth's own JWT encoder + NEXTAUTH_SECRET,
// so requests are indistinguishable from real signed-in users.
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { encode } from "next-auth/jwt";

if (dns.getServers().every((s) => s === "127.0.0.1" || s === "::1")) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const BASE = process.env.TEST_BASE_URL || "http://localhost:3210";
const SECRET = process.env.NEXTAUTH_SECRET;

const RUN_ID = randomUUID();
const OWNER_EMAIL = `owner-${RUN_ID}@pptgen-tests.local`;
const OTHER_EMAIL = `other-${RUN_ID}@pptgen-tests.local`;
const SLIDE = "<!DOCTYPE html><html><body>test slide</body></html>";

let users, ppts;
let owner, other;
let privateDeckId, sharedDeckId;
let ownerCookie, otherCookie;

async function upsertUser(email, name) {
  await users.updateOne(
    { email },
    {
      $setOnInsert: {
        email,
        name,
        username: email,
        credit: 5,
        ppt_History: [],
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  return users.findOne({ email });
}

async function sessionCookie(user) {
  const token = await encode({
    token: { email: user.email, name: user.name, sub: String(user._id), id: String(user._id) },
    secret: SECRET,
  });
  return `next-auth.session-token=${token}`;
}

function api(path, { method = "GET", cookie, body, headers = {} } = {}) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(180_000),
  });
}

before(async () => {
  assert.ok(SECRET, "NEXTAUTH_SECRET must be set (run with --env-file=.env.local)");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "ppt_generator",
    serverSelectionTimeoutMS: 15000,
  });
  users = mongoose.connection.db.collection("users");
  ppts = mongoose.connection.db.collection("ppts");

  owner = await upsertUser(OWNER_EMAIL, "Owner Test");
  other = await upsertUser(OTHER_EMAIL, "Other Test");

  const privateDeck = await ppts.insertOne({
    userid: String(owner._id),
    titles: "ownership-test-private",
    ppt_History: [SLIDE],
    sharedWith: [],
    createdAt: new Date(),
  });
  privateDeckId = String(privateDeck.insertedId);

  const sharedDeck = await ppts.insertOne({
    userid: String(owner._id),
    titles: "ownership-test-shared",
    ppt_History: [SLIDE],
    sharedWith: [OTHER_EMAIL],
    createdAt: new Date(),
  });
  sharedDeckId = String(sharedDeck.insertedId);

  ownerCookie = await sessionCookie(owner);
  otherCookie = await sessionCookie(other);
});

after(async () => {
  // Remove everything the tests created (including duplicated copies).
  const ids = [owner?._id, other?._id].filter(Boolean);
  if (ppts && ids.length) await ppts.deleteMany({ userid: { $in: ids.map(String) } });
  if (users && ids.length) await users.deleteMany({ _id: { $in: ids } });
  await mongoose.disconnect();
});

// ── Negative cases: the walls must hold ─────────────────────────────

test("an unauthenticated user cannot read a saved deck (401)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`);
  assert.equal(res.status, 401);
});

test("a stranger cannot read someone else's saved deck (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`, { cookie: otherCookie });
  assert.equal(res.status, 403);
});

test("the owner can read their own saved deck (200)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`, { cookie: ownerCookie });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.slides, [SLIDE]);
});

test("a recipient can read a deck shared with them (200)", async () => {
  const res = await api(`/api/ppt/${sharedDeckId}`, { cookie: otherCookie });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.slides, [SLIDE]);
});

test("unauthenticated save-ppt is rejected (401)", async () => {
  const res = await api("/api/save-ppt", {
    method: "POST",
    body: { title: "ownership-test-anon", code: [SLIDE] },
  });
  assert.equal(res.status, 401);
});

test("a stranger cannot rename someone else's deck (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`, {
    method: "PATCH",
    cookie: otherCookie,
    body: { title: "hacked" },
  });
  assert.equal(res.status, 403);
});

test("a stranger cannot delete someone else's deck (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`, {
    method: "DELETE",
    cookie: otherCookie,
  });
  assert.equal(res.status, 403);
});

test("only the owner can view a deck's share list (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}/share`, {
    cookie: otherCookie,
  });
  assert.equal(res.status, 403);
});

test("a stranger cannot share someone else's deck (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}/share`, {
    method: "POST",
    cookie: otherCookie,
    body: { email: "victim@example.com" },
  });
  assert.equal(res.status, 403);
});

test("a stranger cannot duplicate a private deck (403)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}/duplicate`, {
    method: "POST",
    cookie: otherCookie,
  });
  assert.equal(res.status, 403);
});

// ── Positive controls: legitimate access still works ────────────────

test("the owner can rename their own deck (200)", async () => {
  const res = await api(`/api/ppt/${privateDeckId}`, {
    method: "PATCH",
    cookie: ownerCookie,
    body: { title: "ownership-test-private-renamed" },
  });
  assert.equal(res.status, 200);
});

test("a recipient can duplicate a deck shared with them (200)", async () => {
  const res = await api(`/api/ppt/${sharedDeckId}/duplicate`, {
    method: "POST",
    cookie: otherCookie,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.deck?.id, "duplicate should return the new deck");
});

test("all write endpoints reject unauthenticated requests", async () => {
  for (const path of ["/api/generate-ppt", "/api/edit-slide", "/api/export-pdf", "/api/export-pptx",
    `/api/ppt/${privateDeckId}/share`, `/api/ppt/${privateDeckId}/public`, `/api/ppt/${privateDeckId}/duplicate`]) {
    assert.equal((await api(path, { method: "POST", body: {} })).status, 401, path);
  }
});

test("saved slide edits persist and recipients cannot overwrite them", async () => {
  const edited = SLIDE.replace("test slide", "edited checklist slide");
  const created = await api("/api/save-ppt", { method: "POST", cookie: ownerCookie,
    body: { title: `ownership-test-save-${RUN_ID}`, code: [SLIDE] } });
  assert.equal(created.status, 200);
  const { id } = await created.json();
  assert.ok(id);
  assert.equal((await api(`/api/ppt/${id}`, { method: "PATCH", cookie: ownerCookie, body: { code: [edited] } })).status, 200);
  assert.deepEqual((await (await api(`/api/ppt/${id}`, { cookie: ownerCookie })).json()).slides, [edited]);
  assert.equal((await api(`/api/ppt/${id}`, { method: "PATCH", cookie: otherCookie, body: { code: [SLIDE] } })).status, 403);
});

test("sharing grants access and revocation removes it", async () => {
  const path = `/api/ppt/${privateDeckId}/share`;
  assert.equal((await api(path, { method: "POST", cookie: ownerCookie, body: { email: OTHER_EMAIL } })).status, 200);
  assert.equal((await api(`/api/ppt/${privateDeckId}`, { cookie: otherCookie })).status, 200);
  assert.equal((await api(path, { method: "DELETE", cookie: ownerCookie, body: { email: OTHER_EMAIL } })).status, 200);
  assert.equal((await api(`/api/ppt/${privateDeckId}`, { cookie: otherCookie })).status, 403);
});

test("public links enforce passwords, rate limits and revocation", async () => {
  const path = `/api/ppt/${privateDeckId}`;
  assert.equal((await api(`${path}/public`, { method: "POST", cookie: otherCookie })).status, 403);
  const published = await api(`${path}/public`, { method: "POST", cookie: ownerCookie });
  assert.equal(published.status, 200);
  const { shareToken } = await published.json();
  assert.ok(shareToken);
  const publicPath = `/api/ppt/public/${shareToken}`;
  assert.deepEqual((await (await api(publicPath)).json()).slides, [SLIDE]);
  const password = `qa-${RUN_ID}`;
  assert.equal((await api(`${path}/password`, { method: "PATCH", cookie: otherCookie, body: { password } })).status, 403);
  assert.equal((await api(`${path}/password`, { method: "PATCH", cookie: ownerCookie, body: { password } })).status, 200);
  const locked = await api(publicPath);
  assert.match(locked.headers.get("cache-control"), /private.*no-store/);
  const payload = await locked.json();
  assert.equal(payload.requiresPassword, true);
  assert.deepEqual(payload.slides, []);
  const verify = (value) => api(`${publicPath}/verify`, { method: "POST", body: { password: value } });
  assert.equal((await verify("wrong-password")).status, 401);
  const unlocked = await verify(password);
  assert.equal(unlocked.status, 200);
  assert.deepEqual((await unlocked.json()).slides, [SLIDE]);
  for (let i = 0; i < 8; i++) assert.equal((await verify("wrong-password")).status, 401);
  const limited = await verify("wrong-password");
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal((await api(`${path}/public`, { method: "DELETE", cookie: ownerCookie })).status, 200);
  assert.equal((await api(publicPath)).status, 404);
});

test("live pages return CSP and isolation headers", async () => {
  for (const path of ["/", "/sandbox", "/code-ide"]) {
    const response = await fetch(`${BASE}${path}`);
    assert.equal(response.status, 200);
    const policy = response.headers.get("content-security-policy");
    assert.match(policy, /object-src 'none'/);
    assert.match(policy, /style-src[^;]+editor\.main\.css/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    if (path !== "/sandbox") assert.match(policy, /'strict-dynamic'/);
  }
});

// Explicit opt-in: these checks call the real AI service and private Blob store.
const liveServices = process.env.RUN_LIVE_SERVICES === "1";
for (const byok of [false, true]) {
  test(`live generation with ${byok ? "BYOK header" : "platform key"}`, { skip: !liveServices }, async () => {
    const beforeCredit = (await users.findOne({ _id: owner._id })).credit;
    const response = await api("/api/generate-ppt", { method: "POST", cookie: ownerCookie,
      headers: byok ? { "x-gemini-key": process.env.GEMINI_API_KEY } : {},
      body: { prompt: "Create exactly one slide using the linear theme and hero component. Title: QA Checklist. Subtitle: Disposable automated verification." } });
    assert.equal(response.status, 200, `generation returned HTTP ${response.status}`);
    const result = await response.json();
    assert.ok(Array.isArray(result.result) && result.result.length > 0);
    assert.ok(result.result.every((html) => /<!doctype html>/i.test(html)));
    assert.equal(result.byok, byok);
    const afterCredit = (await users.findOne({ _id: owner._id })).credit;
    assert.equal(afterCredit, beforeCredit - (byok ? 0 : 1));
  });
}

for (const format of ["pdf", "pptx"]) {
  test(`live ${format} export uploads and downloads a non-empty artifact`, { skip: !liveServices }, async () => {
    const response = await api(`/api/export-${format}`, { method: "POST", cookie: ownerCookie,
      body: { title: `ownership-test-${RUN_ID}`, slides: [SLIDE] } });
    assert.equal(response.status, 200, `export returned HTTP ${response.status}`);
    const artifact = await response.json();
    assert.ok(artifact.size > 100);
    const download = await fetch(artifact.url, { signal: AbortSignal.timeout(30_000) });
    assert.equal(download.status, 200);
    const bytes = Buffer.from(await download.arrayBuffer());
    assert.equal(bytes.length, artifact.size);
    assert.ok(bytes.subarray(0, 5).toString().startsWith(format === "pdf" ? "%PDF-" : "PK"));
  });
}
