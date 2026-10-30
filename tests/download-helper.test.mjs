// Regression proof for the client-side download path in lib/exporters.js.
//
// Covers two distinct mechanisms:
//   • HTML export  — built in the browser, saved from an object URL. Guards the
//     0-byte-download defect: revoking the object URL in the same task as
//     click() left deferred readers with nothing.
//   • PDF / PPTX   — rendered server-side and delivered by URL. The client must
//     read JSON and download from the returned link, never touch the bytes.
//
// The real module is served over HTTP and imported by a real browser, with only
// the npm dependencies and the export endpoints stubbed. Downloads are captured
// and measured ON DISK, which is the only place a broken download shows.
//   npm run test:download
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORIGIN = "https://airdeck.test";

// A small but unmistakably non-empty PDF, served from the stubbed blob URL.
const PDF_BYTES = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n" +
    "x".repeat(5000),
  "latin1"
);

const HTI_STUB = `export async function toPng(){return "data:image/png;base64,STUB";}
export default { toPng };`;
const PPTX_STUB = `export default class P { addSlide(){return{addImage(){}}} async writeFile(){} }`;

const HARNESS = `<!DOCTYPE html><html><head><meta charset="utf-8">
<script type="importmap">
{"imports":{"html-to-image":"/stub-hti.js","pptxgenjs":"/stub-pptx.js"}}
<\/script></head><body><script type="module">
  const m = await import("/lib/exporters.js");
  globalThis.__exporters = m;
  globalThis.__ready = true;
<\/script></body></html>`;

const js = (body) => ({
  status: 200,
  contentType: "application/javascript; charset=utf-8",
  body,
});

// Stands in for Blob storage on a REAL origin. Playwright's request
// interception cannot serve a browser download — the download manager sits
// below the renderer — so the artifact must come from an actual server. This
// is also closer to production, where the artifact is genuinely cross-origin.
let artifactServer;
let artifactBase = "";

test.before(async () => {
  artifactServer = http.createServer((_req, res) => {
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      // Exactly what a `?download=1` Blob URL sends.
      "Content-Disposition": 'attachment; filename="Deck.pdf"',
      "Content-Length": String(PDF_BYTES.length),
    });
    res.end(PDF_BYTES);
  });
  await new Promise((resolve) => artifactServer.listen(0, "127.0.0.1", resolve));
  artifactBase = `http://127.0.0.1:${artifactServer.address().port}`;
});

test.after(() => {
  artifactServer?.close();
});

/**
 * Boot a browser with the real exporters module loaded.
 * `apiJson` controls what the export endpoint answers with, so the client's
 * validation branches can be driven precisely.
 */
async function withHarness(
  run,
  {
    apiStatus = 200,
    apiJson = null, // defaults to a success payload pointing at the artifact server
    apiBody = null, // raw body, overrides apiJson (for non-JSON responses)
  } = {}
) {
  const payload =
    apiJson ?? {
      success: true,
      url: `${artifactBase}/Deck.pdf`,
      filename: "Deck.pdf",
      size: PDF_BYTES.length,
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
    };
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    await context.route(`${ORIGIN}/**`, (route) => {
      const p = new URL(route.request().url()).pathname;
      if (p === "/harness")
        return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HARNESS });
      if (p === "/lib/exporters.js")
        return route.fulfill(js(readFileSync(path.join(ROOT, "lib/exporters.js"), "utf8")));
      if (p === "/lib/slideAutofit" || p === "/lib/slideAutofit.js")
        return route.fulfill(js(readFileSync(path.join(ROOT, "lib/slideAutofit.js"), "utf8")));
      if (p === "/stub-hti.js") return route.fulfill(js(HTI_STUB));
      if (p === "/stub-pptx.js") return route.fulfill(js(PPTX_STUB));

      // The export API — JSON only, never bytes.
      if (p === "/api/export-pdf" || p === "/api/export-pptx") {
        return route.fulfill({
          status: apiStatus,
          contentType: apiBody === null ? "application/json" : "text/html",
          body: apiBody === null ? JSON.stringify(payload) : apiBody,
        });
      }
      return route.continue();
    });

    const page = await context.newPage();
    await page.goto(`${ORIGIN}/harness`, { waitUntil: "load" });
    await page.waitForFunction(() => globalThis.__ready === true, null, { timeout: 20000 });
    return await run(page);
  } finally {
    await browser.close();
  }
}

// ── PDF / PPTX: URL delivery ────────────────────────────────────

test("a PDF export downloads from the URL the API returns", async () => {
  const result = await withHarness(async (page) => {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.evaluate(() =>
        globalThis.__exporters.downloadAsPdf("My Deck", ["<html><body>s</body></html>"])
      ),
    ]);
    const failure = await download.failure();
    const file = failure ? null : await download.path();
    return {
      failure,
      filename: download.suggestedFilename(),
      size: file ? statSync(file).size : 0,
      signature: file ? readFileSync(file).subarray(0, 5).toString("latin1") : "",
    };
  });

  assert.equal(result.failure, null, "the download must not fail");
  assert.equal(result.filename, "Deck.pdf", "the server-provided filename is used");
  assert.equal(result.size, PDF_BYTES.length, "every byte must arrive");
  assert.notEqual(result.size, 0, "a 0-byte download is the defect under test");
  assert.equal(result.signature, "%PDF-");
});

test("the client never reads the artifact bytes from the API response", async () => {
  // The API answers with JSON only. If the client still tried to treat the
  // response as a file it would fail here rather than download anything.
  const bodyType = await withHarness((page) =>
    page.evaluate(async () => {
      let sawBinaryRead = false;
      const realBlob = Response.prototype.blob;
      const realArrayBuffer = Response.prototype.arrayBuffer;
      Response.prototype.blob = function (...a) {
        sawBinaryRead = true;
        return realBlob.apply(this, a);
      };
      Response.prototype.arrayBuffer = function (...a) {
        sawBinaryRead = true;
        return realArrayBuffer.apply(this, a);
      };
      try {
        await globalThis.__exporters.downloadAsPdf("My Deck", ["<html></html>"]);
      } catch {
        /* download navigation is irrelevant here */
      }
      Response.prototype.blob = realBlob;
      Response.prototype.arrayBuffer = realArrayBuffer;
      return sawBinaryRead;
    })
  );

  assert.equal(bodyType, false, "neither .blob() nor .arrayBuffer() may be used on the API response");
});

test("a PPTX export downloads from the URL the API returns", async () => {
  const filename = await withHarness(async (page) => {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.evaluate(() =>
        globalThis.__exporters.downloadAsPptx("My Deck", ["<html><body>s</body></html>"])
      ),
    ]);
    return download.suggestedFilename();
  });
  assert.equal(filename, "Deck.pdf", "the stub blob serves the filename the API named");
});

// ── PDF / PPTX: failure handling ────────────────────────────────

test("an API error message is surfaced to the caller", async () => {
  const message = await withHarness(
    (page) =>
      page.evaluate(async () => {
        try {
          await globalThis.__exporters.downloadAsPdf("Deck", ["<html></html>"]);
          return null;
        } catch (e) {
          return e.message;
        }
      }),
    { apiStatus: 503, apiJson: { error: "Export storage is not configured on this deployment." } }
  );
  assert.match(message ?? "", /storage is not configured/i);
});

test("a success response without a URL is rejected", async () => {
  const message = await withHarness(
    (page) =>
      page.evaluate(async () => {
        try {
          await globalThis.__exporters.downloadAsPdf("Deck", ["<html></html>"]);
          return null;
        } catch (e) {
          return e.message;
        }
      }),
    { apiJson: { success: true, filename: "Deck.pdf" } }
  );
  assert.match(message ?? "", /did not return a download link/i);
});

test("a non-JSON response is rejected rather than saved", async () => {
  const message = await withHarness(
    (page) =>
      page.evaluate(async () => {
        try {
          await globalThis.__exporters.downloadAsPdf("Deck", ["<html></html>"]);
          return null;
        } catch (e) {
          return e.message;
        }
      }),
    { apiBody: "<!DOCTYPE html><html>gateway error</html>" }
  );
  assert.match(message ?? "", /export failed/i);
});

// ── HTML export: object-URL lifetime (unchanged mechanism) ──────

test("the object URL outlives the click so a deferred reader still gets the bytes", async () => {
  const outcome = await withHarness((page) =>
    page.evaluate(async () => {
      const created = [];
      let revokedSynchronously = false;
      let clickDone = false;

      const realCreate = URL.createObjectURL.bind(URL);
      const realRevoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (b) => {
        const u = realCreate(b);
        created.push(u);
        return u;
      };
      URL.revokeObjectURL = (u) => {
        if (!clickDone) revokedSynchronously = true;
        return realRevoke(u);
      };

      globalThis.__exporters.downloadHtmlFile("Deck", ["<html><body>slide</body></html>"]);
      clickDone = true;

      // Yield one task — exactly what a deferred download consumer does.
      await new Promise((r) => setTimeout(r, 0));

      let readableAfterOneTask = 0;
      try {
        const res = await fetch(created[0]);
        readableAfterOneTask = (await res.blob()).size;
      } catch {
        readableAfterOneTask = 0;
      }

      URL.createObjectURL = realCreate;
      URL.revokeObjectURL = realRevoke;
      return { urls: created.length, revokedSynchronously, readableAfterOneTask };
    })
  );

  assert.equal(outcome.urls, 1, "one object URL should be created");
  assert.equal(outcome.revokedSynchronously, false, "must not revoke in the click's own task");
  assert.ok(
    outcome.readableAfterOneTask > 0,
    "the blob URL must still be readable one task after the click — this is the 0-byte defect"
  );
});

test("the object URL is eventually revoked, so blobs are not leaked", async () => {
  const stillAlive = await withHarness((page) =>
    page.evaluate(async () => {
      const created = [];
      const realCreate = URL.createObjectURL.bind(URL);
      URL.createObjectURL = (b) => {
        const u = realCreate(b);
        created.push(u);
        return u;
      };

      globalThis.__exporters.downloadHtmlFile("Deck", ["<html><body>x</body></html>"]);
      URL.createObjectURL = realCreate;

      await new Promise((r) => setTimeout(r, 1600));
      try {
        await fetch(created[0]);
        return true;
      } catch {
        return false;
      }
    })
  );

  assert.equal(stillAlive, false, "the object URL should be revoked after the cleanup delay");
});

test("an HTML export writes a complete file to disk", async () => {
  const result = await withHarness(async (page) => {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.evaluate(() =>
        globalThis.__exporters.downloadHtmlFile("My Deck", ["<html><body>slide one</body></html>"])
      ),
    ]);
    const file = await download.path();
    return {
      filename: download.suggestedFilename(),
      size: statSync(file).size,
      head: readFileSync(file).subarray(0, 15).toString("utf8"),
    };
  });

  assert.equal(result.filename, "My Deck.html");
  assert.ok(result.size > 500, `expected a full viewer document, got ${result.size} bytes`);
  assert.match(result.head, /^<!DOCTYPE html>/);
});
