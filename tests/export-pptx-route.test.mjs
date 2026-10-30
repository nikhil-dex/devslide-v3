// Proof for the /api/export-pptx route JSON download contract.
//
// PPTX is the format the 4.5 MB response cap hurts most (~1.7 MB per slide),
// so the hand-off to Blob storage matters more here than anywhere else.
//   npm run test:pptx:route
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

globalThis.__pptxNoSession = false;

mock.module("next-auth/next", {
  namedExports: {
    getServerSession: async () =>
      globalThis.__pptxNoSession
        ? null
        : { user: { email: `pptx-${randomUUID()}@example.com` } },
  },
});

mock.module(
  new URL("../app/api/auth/[...nextauth]/route.js", import.meta.url).href,
  { namedExports: { authOptions: {} } }
);

class ExportStorageNotConfiguredError extends Error {}

globalThis.__pptxUploads = [];
globalThis.__pptxBlobMode = "ok";

mock.module(new URL("../lib/exportStorage.js", import.meta.url).href, {
  namedExports: {
    ExportStorageNotConfiguredError,
    storeExportArtifact: async ({ bytes, filename, contentType }) => {
      globalThis.__pptxUploads.push({
        size: bytes.length,
        signature: bytes.subarray(0, 2).toString("latin1"),
        filename,
        contentType,
      });
      if (globalThis.__pptxBlobMode === "fail") throw new Error("upload exploded");
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

const { POST } = await import("../app/api/export-pptx/route.js");

function request(body) {
  return new Request("http://localhost/api/export-pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const SLIDE = "<!DOCTYPE html><html><body style='margin:0'><h1>Deck</h1></body></html>";

test.beforeEach(() => {
  globalThis.__pptxUploads = [];
  globalThis.__pptxBlobMode = "ok";
  globalThis.__pptxNoSession = false;
});

test("the API returns JSON with a download URL, not the artifact", async () => {
  const res = await POST(request({ title: "Slides", slides: [SLIDE] }));

  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  assert.equal(res.headers.get("content-disposition"), null, "must not send Content-Disposition");

  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.filename, "Slides.pptx", "filename must be preserved");
  assert.ok(body.url.startsWith("https://"), "an absolute URL must be returned");
  assert.ok(body.size > 0);
  assert.ok(!Number.isNaN(Date.parse(body.expiresAt)));
});

test("a real .pptx is uploaded with the Office content type", async () => {
  await POST(request({ title: "Typed", slides: [SLIDE] }));
  const [upload] = globalThis.__pptxUploads;
  assert.equal(upload.signature, "PK", "a .pptx is a zip archive");
  assert.equal(
    upload.contentType,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
  assert.equal(upload.filename, "Typed.pptx");
});

test("the artifact does not pass through the function response", async () => {
  const res = await POST(request({ title: "Heavy", slides: [SLIDE, SLIDE] }));
  const raw = await res.text();
  const [upload] = globalThis.__pptxUploads;

  assert.equal(res.status, 200);
  assert.ok(upload.size > 10_000, `artifact should be substantial, was ${upload.size}`);
  assert.ok(raw.length < 2_000, `response body must stay tiny, was ${raw.length}`);
  assert.ok(
    upload.size > raw.length * 20,
    `artifact (${upload.size}B) must dwarf the response describing it (${raw.length}B)`
  );
});

test("an unauthenticated request is rejected before any rendering", async () => {
  globalThis.__pptxNoSession = true;
  const res = await POST(request({ title: "Nope", slides: [SLIDE] }));
  assert.equal(res.status, 401);
  assert.equal(globalThis.__pptxUploads.length, 0);
});

test("a failed Blob upload surfaces as a clean 500", async () => {
  globalThis.__pptxBlobMode = "fail";
  const res = await POST(request({ title: "Fails", slides: [SLIDE] }));
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.match(body.error, /Could not generate the PowerPoint file/);
  assert.ok(!/upload exploded/i.test(body.error), "internal detail must not leak");
});

test("an invalid deck is rejected before rendering", async () => {
  const res = await POST(request({
    source: { version: 1, theme: "linear", slides: [{ component: "hero", props: {} }] },
  }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /missing required prop "title"/);
  assert.equal(globalThis.__pptxUploads.length, 0);
});

test("duplicate exports each produce their own artifact and URL", async () => {
  const a = await (await POST(request({ title: "Dupe", slides: [SLIDE] }))).json();
  const b = await (await POST(request({ title: "Dupe", slides: [SLIDE] }))).json();
  assert.equal(a.filename, b.filename);
  assert.notEqual(a.url, b.url, "each export gets its own object");
});
