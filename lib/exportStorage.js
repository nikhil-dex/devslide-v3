// Artifact delivery for server-side exports.
//
//   Chromium ──→ bytes ──→ Vercel Blob ──→ presigned URL ──→ browser
//
// Vercel Functions cap a response body at 4.5 MB, and AIRDeck exports exceed
// that easily (a 50-slide PPTX is ~84 MB). So the bytes must never travel back
// through the function. They are uploaded to Blob storage and the client is
// handed a short-lived URL it downloads directly from.
//
// Access model: a PRIVATE store plus a presigned GET URL.
//   • Public + random suffix would be a capability URL that never expires.
//   • Streaming a private blob back through a route — the pattern in Vercel's
//     docs — would put the bytes through the function again and reinstate the
//     4.5 MB limit.
// Presigning is the only option that is both private and a direct download.
//
// Node runtime only. Never import from client code: it reads Blob credentials.

import { put, issueSignedToken, presignUrl } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
const EXPORTS_BLOB_TOKEN = process.env.EXPORTS_BLOB_READ_WRITE_TOKEN;
const EXPORTS_STORE_ID = process.env.EXPORTS_STORE_ID;

/** How long a download URL stays valid. Long enough to click, short enough to matter. */
export const EXPORT_URL_TTL_MS = 15 * 60 * 1000;

/** Artifacts are user data, so the store must be private. */
export const BLOB_ACCESS = "private";

/** CDN retention for the object itself. Pathnames are unique, so this is safe. */
const CACHE_MAX_AGE_SECONDS = 3600;

/** Raised when the Blob store is not wired up, so routes can explain the fix. */
export class ExportStorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Vercel Blob is not configured. Create a private Blob store and connect " +
        "it to this project (vercel blob create-store --access private), then " +
        "run `vercel env pull` so the credentials are available locally."
    );
    this.name = "ExportStorageNotConfiguredError";
  }
}

/**
 * The SDK authenticates with OIDC on Vercel and falls back to a static
 * read-write token elsewhere. Checking up front turns a confusing SDK error
 * into an actionable one.
 */

export function isExportStorageConfigured() {
  return Boolean(
    process.env.EXPORTS_BLOB_READ_WRITE_TOKEN &&
    process.env.EXPORTS_STORE_ID
  );
}

/**
 * Stable, non-reversible per-user prefix. Scopes objects to an owner without
 * writing the email address into a storage path.
 */
export function userScopeKey(identity) {
  return createHash("sha256")
    .update(String(identity ?? "anonymous"))
    .digest("hex")
    .slice(0, 16);
}

/**
 * Object name for one export.
 *
 * `exports/<userScope>/<uuid>/<filename>`
 *
 * The uuid makes the path unguessable, the scope groups an owner's objects for
 * later lifecycle work, and the trailing filename is what the browser saves as.
 */
export function buildExportPathname({ identity, filename }) {
  return `exports/${userScopeKey(identity)}/${randomUUID()}/${filename}`;
}

/**
 * Upload an artifact and return a short-lived URL that downloads it directly
 * from Blob storage.
 *
 * @param {object} params
 * @param {Buffer} params.bytes        The rendered artifact.
 * @param {string} params.filename     Name the browser should save, e.g. "Deck.pdf".
 * @param {string} params.contentType  Real MIME type of the artifact.
 * @param {string} params.identity     Owner identity (an email); never stored verbatim.
 * @param {number} [params.ttlMs]      URL lifetime.
 * @returns {Promise<{url:string,pathname:string,filename:string,size:number,expiresAt:string}>}
 */
export async function storeExportArtifact({
  bytes,
  filename,
  contentType,
  identity,
  ttlMs = EXPORT_URL_TTL_MS,
}) {
  if (!bytes || bytes.length === 0) {
    throw new Error("storeExportArtifact requires a non-empty artifact");
  }
  console.log("[export-storage] env status:", {
  hasBlobToken: Boolean(process.env.EXPORTS_BLOB_READ_WRITE_TOKEN),
  hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
  hasStoreId: Boolean(process.env.EXPORTS_STORE_ID),
});
  if (!isExportStorageConfigured()) {
    throw new ExportStorageNotConfiguredError();
  }

  const pathname = buildExportPathname({ identity, filename });

  const blob = await put(pathname, bytes, {
    access: BLOB_ACCESS,
    token: EXPORTS_BLOB_TOKEN,
    contentType,
    // Belt and braces against collisions; the uuid already guarantees them.
    addRandomSuffix: true,
    allowOverwrite: false,
    cacheControlMaxAge: CACHE_MAX_AGE_SECONDS,
  });

  // put() applies the random suffix, so sign the pathname it actually wrote.
  const storedPathname = blob.pathname ?? pathname;
  const validUntil = Date.now() + ttlMs;

  const signedToken = await issueSignedToken({
  pathname: storedPathname,
  operations: ["get"],
  validUntil,
  token: EXPORTS_BLOB_TOKEN,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
  operation: "get",
  pathname: storedPathname,
  access: BLOB_ACCESS,
  validUntil,
  token: EXPORTS_BLOB_TOKEN,
  });

  return {
    // `download=1` makes Blob answer with Content-Disposition: attachment so
    // the browser saves the file under `filename` instead of, say, rendering
    // the PDF inline.
    url: withForcedDownload(presignedUrl),
    pathname: storedPathname,
    filename,
    size: bytes.length,
    expiresAt: new Date(validUntil).toISOString(),
  };
}

// ── Lifecycle / cleanup ─────────────────────────────────────────
//
// NOT IMPLEMENTED, deliberately. Vercel Blob has no object TTL or lifecycle
// rule today: `put()` accepts no expiry, and `cacheControlMaxAge` only governs
// CDN caching, not deletion. Objects therefore persist until explicitly
// deleted, and every export adds one.
//
// What expires today is only the *download URL* (EXPORT_URL_TTL_MS), so a stale
// link stops working — but the bytes stay billable.
//
// Required future cleanup, in preference order:
//
//   1. Scheduled purge (smallest change). A cron route enumerates objects with
//      `list({ prefix: "exports/", cursor })` and calls `del()` on anything
//      whose `uploadedAt` is older than a retention window (24h is ample for a
//      download link that lives 15 minutes). Vercel Cron can invoke it daily.
//
//   2. Delete-on-delivery. Have the client confirm a completed download and
//      delete immediately, with (1) as the backstop for abandoned exports.
//
//   3. Per-user quota. `exports/<userScope>/` already groups objects by owner,
//      so a purge can keep only the N most recent per user.
//
// Until one of these ships, storage grows without bound and should be watched
// in the Blob usage dashboard.

/** Append Blob's forced-download flag without disturbing existing query params. */
export function withForcedDownload(url) {
  return url.includes("download=1")
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}download=1`;
}
