// Proof for the Blob delivery seam: object naming, per-user scoping, forced
// download and configuration guarding.
//
// These are pure unit tests — no Blob store, no network. The upload itself is
// exercised through the route tests, which mock this module.
//   npm run test:storage
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExportPathname,
  userScopeKey,
  withForcedDownload,
  isExportStorageConfigured,
  storeExportArtifact,
  ExportStorageNotConfiguredError,
  EXPORT_URL_TTL_MS,
  BLOB_ACCESS,
} from "../lib/exportStorage.js";

// ── Access model ────────────────────────────────────────────────

test("artifacts are stored privately, never public", () => {
  assert.equal(BLOB_ACCESS, "private", "user artifacts must not be publicly readable");
});

test("download URLs are short-lived", () => {
  assert.ok(EXPORT_URL_TTL_MS > 0);
  assert.ok(
    EXPORT_URL_TTL_MS <= 60 * 60 * 1000,
    "a download link should not outlive the session that made it"
  );
});

// ── Object naming and scoping ───────────────────────────────────

test("the user scope is a stable, non-reversible digest", () => {
  const a = userScopeKey("someone@example.com");
  const b = userScopeKey("someone@example.com");
  const c = userScopeKey("other@example.com");

  assert.equal(a, b, "the same user always maps to the same scope");
  assert.notEqual(a, c, "different users never share a scope");
  assert.match(a, /^[0-9a-f]{16}$/, "scope is a hex digest");
  assert.doesNotMatch(a, /someone|example|@/, "the address must not appear in the path");
});

test("pathnames are user-scoped, unguessable and keep the filename", () => {
  const one = buildExportPathname({ identity: "a@example.com", filename: "My Deck.pdf" });
  const two = buildExportPathname({ identity: "a@example.com", filename: "My Deck.pdf" });

  assert.match(one, /^exports\/[0-9a-f]{16}\/[0-9a-f-]{36}\/My Deck\.pdf$/);
  assert.notEqual(one, two, "identical requests must never collide or overwrite");
  assert.ok(one.endsWith("My Deck.pdf"), "the browser-facing filename ends the path");
});

test("one user's path cannot be derived from another's", () => {
  const mine = buildExportPathname({ identity: "me@example.com", filename: "Deck.pdf" });
  const theirs = buildExportPathname({ identity: "you@example.com", filename: "Deck.pdf" });

  const scopeOf = (p) => p.split("/")[1];
  assert.notEqual(scopeOf(mine), scopeOf(theirs), "scopes differ per user");
  // The uuid segment is what makes an object unguessable even inside a scope.
  assert.notEqual(mine.split("/")[2], theirs.split("/")[2]);
});

test("anonymous identities still produce a valid scope", () => {
  assert.match(buildExportPathname({ filename: "x.pdf" }), /^exports\/[0-9a-f]{16}\//);
});

// ── Forced download ─────────────────────────────────────────────

test("the download flag is appended without breaking existing query params", () => {
  assert.equal(withForcedDownload("https://x/y.pdf"), "https://x/y.pdf?download=1");
  assert.equal(
    withForcedDownload("https://x/y.pdf?sig=abc"),
    "https://x/y.pdf?sig=abc&download=1"
  );
  assert.equal(
    withForcedDownload("https://x/y.pdf?download=1"),
    "https://x/y.pdf?download=1",
    "already-flagged URLs are left alone"
  );
});

// ── Configuration guard ─────────────────────────────────────────

test("missing Blob credentials are reported clearly, not as a generic crash", async () => {
  const saved = {
    rw: process.env.BLOB_READ_WRITE_TOKEN,
    oidc: process.env.VERCEL_OIDC_TOKEN,
    store: process.env.BLOB_STORE_ID,
  };
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.BLOB_STORE_ID;

  try {
    assert.equal(isExportStorageConfigured(), false);
    await assert.rejects(
      () =>
        storeExportArtifact({
          bytes: Buffer.from("%PDF-fake"),
          filename: "x.pdf",
          contentType: "application/pdf",
          identity: "a@example.com",
        }),
      (error) => {
        assert.ok(error instanceof ExportStorageNotConfiguredError);
        assert.match(error.message, /Blob/i);
        return true;
      }
    );
  } finally {
    if (saved.rw) process.env.BLOB_READ_WRITE_TOKEN = saved.rw;
    if (saved.oidc) process.env.VERCEL_OIDC_TOKEN = saved.oidc;
    if (saved.store) process.env.BLOB_STORE_ID = saved.store;
  }
});

test("an empty artifact is refused before any upload is attempted", async () => {
  await assert.rejects(
    () =>
      storeExportArtifact({
        bytes: Buffer.alloc(0),
        filename: "x.pdf",
        contentType: "application/pdf",
        identity: "a@example.com",
      }),
    /non-empty artifact/
  );
});
