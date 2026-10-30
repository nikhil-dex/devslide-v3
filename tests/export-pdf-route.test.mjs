// Proof for the /api/export-pdf route: validation, compiler delegation, Blob
// hand-off and the JSON download contract.
//
// Auth and Blob storage are mocked so the authenticated branches can be tested
// without a database, a session or a Blob store. Everything below those two
// seams is the real implementation, including the compiler and Chromium.
//   npm run test:pdf:route
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// PDF export is rate limited per user (5/min). Each test gets a fresh identity
// so the limiter never bleeds between cases; the limiter itself is asserted in
// its own test by pinning the identity.
globalThis.__pdfTestEmail = null;

mock.module("next-auth/next", {
  namedExports: {
    getServerSession: async () =>
      globalThis.__pdfNoSession
        ? null
        : {
            user: {
              email: globalThis.__pdfTestEmail ?? `pdf-${randomUUID()}@example.com`,
            },
          },
  },
});

// The route imports authOptions purely to hand it to getServerSession, which
// is mocked above — a stub keeps NextAuth's DB/provider wiring out of the test.
mock.module(
  new URL("../app/api/auth/[...nextauth]/route.js", import.meta.url).href,
  { namedExports: { authOptions: {} } }
);

// Blob storage seam. Records what the route tried to upload so a test can prove
// the artifact bypassed the HTTP response entirely.
class ExportStorageNotConfiguredError extends Error {
  constructor() {
    super("not configured");
    this.name = "ExportStorageNotConfiguredError";
  }
}

globalThis.__uploads = [];
globalThis.__blobMode = "ok"; // ok | fail | unconfigured

mock.module(new URL("../lib/exportStorage.js", import.meta.url).href, {
  namedExports: {
    ExportStorageNotConfiguredError,
    storeExportArtifact: async ({ bytes, filename, contentType, identity }) => {
      globalThis.__uploads.push({
        size: bytes.length,
        signature: bytes.subarray(0, 5).toString("latin1"),
        filename,
        contentType,
        identity,
      });
      if (globalThis.__blobMode === "fail") throw new Error("blob upload failed");
      if (globalThis.__blobMode === "unconfigured") {
        throw new ExportStorageNotConfiguredError();
      }
      const pathname = `exports/${randomUUID()}/${filename}`;
      return {
        url: `https://store.private.blob.vercel-storage.com/${pathname}?download=1`,
        pathname,
        filename,
        size: bytes.length,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
      };
    },
  },
});

const { POST } = await import("../app/api/export-pdf/route.js");

function request(body) {
  return new Request("http://localhost/api/export-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const SLIDE = "<!DOCTYPE html><html><body style='margin:0'><h1>Slide</h1></body></html>";
const HERO = {
  version: 1,
  theme: "linear",
  slides: [{ component: "hero", props: { title: "Route Test" } }],
};

test.beforeEach(() => {
  globalThis.__uploads = [];
  globalThis.__blobMode = "ok";
  globalThis.__pdfNoSession = false;
});

// ── The JSON download contract ──────────────────────────────────

test("the API returns JSON with a download URL, not the artifact", async () => {
  const res = await POST(request({ title: "My Deck", slides: [SLIDE] }));

  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  assert.equal(res.headers.get("cache-control"), "no-store");

  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.filename, "My Deck.pdf", "filename must be preserved");
  assert.ok(typeof body.url === "string" && body.url.length > 0, "a URL must be returned");
  assert.ok(body.url.startsWith("https://"), "the URL must be absolute");
  assert.ok(Number.isInteger(body.size) && body.size > 0, "size must be reported");
  assert.ok(!Number.isNaN(Date.parse(body.expiresAt)), "an expiry must be reported");
});

test("the response never advertises itself as a file download", async () => {
  // Regression guard: `Content-Disposition: attachment` plus a binary content
  // type makes download managers (IDM) hijack the request, so the browser's
  // fetch() receives an empty body and the export appears to fail.
  const res = await POST(request({ title: "No Grab", slides: [SLIDE] }));

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-disposition"), null, "must not send Content-Disposition");
  assert.doesNotMatch(
    res.headers.get("content-type"),
    /application\/(pdf|octet-stream|zip)/,
    "must not use a content type download managers watch for"
  );
});

test("the artifact does not pass through the function response", async () => {
  // Vercel caps a response body at 4.5 MB. Render several slides so the
  // artifact is substantial, then prove the HTTP body stayed tiny.
  const res = await POST(
    request({
      title: "Big Deck",
      source: {
        version: 1,
        theme: "aurora",
        slides: Array.from({ length: 4 }, (_, i) => ({
          component: "hero",
          props: { title: `Slide ${i + 1}`, subtitle: "payload" },
        })),
      },
    })
  );

  assert.equal(res.status, 200);
  const raw = await res.text();
  const [upload] = globalThis.__uploads;

  assert.ok(upload, "the route must have uploaded an artifact");
  assert.equal(upload.signature, "%PDF-", "a real PDF must have been uploaded");
  assert.ok(upload.size > 10_000, `artifact should be substantial, was ${upload.size}`);
  assert.ok(raw.length < 2_000, `response body must stay tiny, was ${raw.length}`);
  // The ratio is the real claim: the bytes are delivered out-of-band, so the
  // response size is decoupled from the artifact size and the 4.5 MB body cap
  // no longer bounds an export.
  assert.ok(
    upload.size > raw.length * 20,
    `artifact (${upload.size}B) must dwarf the response describing it (${raw.length}B)`
  );
});

test("the upload is scoped to the requesting user and correctly typed", async () => {
  globalThis.__pdfTestEmail = `owner-${randomUUID()}@example.com`;
  try {
    await POST(request({ title: "Scoped", slides: [SLIDE] }));
    const [upload] = globalThis.__uploads;
    assert.equal(upload.identity, globalThis.__pdfTestEmail, "owner must be passed to storage");
    assert.equal(upload.contentType, "application/pdf");
    assert.equal(upload.filename, "Scoped.pdf");
  } finally {
    globalThis.__pdfTestEmail = null;
  }
});

test("a deck source is compiled by the existing compiler and exported", async () => {
  const res = await POST(request({ title: "From Source", source: HERO }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(globalThis.__uploads[0].signature, "%PDF-");
});

// ── Failure modes ───────────────────────────────────────────────

test("an unauthenticated request is rejected before any rendering", async () => {
  globalThis.__pdfNoSession = true;
  const res = await POST(request({ title: "Nope", slides: [SLIDE] }));
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /Sign in/);
  assert.equal(globalThis.__uploads.length, 0, "must not render for anonymous callers");
});

test("a failed Blob upload surfaces as a clean 500", async () => {
  globalThis.__blobMode = "fail";
  const res = await POST(request({ title: "Fails", slides: [SLIDE] }));
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.match(body.error, /Could not generate the PDF/);
  assert.ok(!("stack" in body), "no stack trace in the response");
  assert.ok(!/blob upload failed/i.test(body.error), "internal detail must not leak");
});

test("missing Blob configuration is reported as a service problem", async () => {
  globalThis.__blobMode = "unconfigured";
  const res = await POST(request({ title: "Unconfigured", slides: [SLIDE] }));
  assert.equal(res.status, 503);
  assert.match((await res.json()).error, /storage is not configured/i);
});

test("an invalid deck source is rejected with the compiler's errors", async () => {
  const res = await POST(request({
    title: "Bad",
    source: { version: 1, theme: "linear", slides: [{ component: "hero", props: {} }] },
  }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /Invalid deck/);
  assert.match(body.error, /missing required prop "title"/);
  assert.equal(globalThis.__uploads.length, 0, "nothing should be uploaded for an invalid deck");
});

test("an unknown theme is rejected", async () => {
  const res = await POST(request({
    source: { version: 1, theme: "nope", slides: [{ component: "hero", props: { title: "x" } }] },
  }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Unknown theme/);
});

test("slide payload bounds are enforced", async () => {
  const cases = [
    { slides: [] },
    { slides: Array.from({ length: 51 }, () => "<html></html>") },
    { slides: ["ok", 42] },
    { slides: ["x".repeat(200_001)] },
  ];
  for (const payload of cases) {
    const res = await POST(request(payload));
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(payload).slice(0, 40)}`);
    assert.equal((await res.json()).error, "Invalid slides data.");
  }
});

test("a request with neither slides nor source is rejected", async () => {
  const res = await POST(request({ title: "Nothing" }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Provide either compiled slides or a deck source/);
});

test("filenames are sanitised and fall back when empty", async () => {
  const res = await POST(request({ title: '../../etc/pa*sswd"', slides: [SLIDE] }));
  assert.equal(res.status, 200);
  const { filename } = await res.json();
  assert.doesNotMatch(filename, /[/\\"*<>:|?]/, "path and illegal characters must be stripped");
  assert.equal(filename, "....etcpasswd.pdf");

  const blank = await POST(request({ title: "   ", slides: [SLIDE] }));
  assert.equal((await blank.json()).filename, "presentation.pdf");
});

// ── Repeat behaviour ────────────────────────────────────────────

test("duplicate exports each produce their own artifact and URL", async () => {
  const first = await POST(request({ title: "Dupe", slides: [SLIDE] }));
  const second = await POST(request({ title: "Dupe", slides: [SLIDE] }));

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);

  const a = await first.json();
  const b = await second.json();
  assert.equal(a.filename, b.filename, "the saved name stays stable");
  assert.notEqual(a.url, b.url, "each export gets its own object, never overwriting the other");
  assert.equal(globalThis.__uploads.length, 2);
});

test("repeated exports are rate limited per user", async () => {
  globalThis.__pdfTestEmail = `ratelimit-${randomUUID()}@example.com`;
  try {
    const statuses = [];
    // The limit is 5 per minute; the sixth request must be refused.
    for (let i = 0; i < 6; i++) {
      statuses.push((await POST(request({ title: "R", slides: [SLIDE] }))).status);
    }
    assert.deepEqual(statuses.slice(0, 5), [200, 200, 200, 200, 200]);
    assert.equal(statuses[5], 429, "the sixth export in a minute must be refused");
  } finally {
    globalThis.__pdfTestEmail = null;
  }
});
