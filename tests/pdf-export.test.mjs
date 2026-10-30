// Proof for PDF export: compiled HTML → Chromium → 16:9 PDF.
//
// These tests drive the real renderer and inspect the real PDF bytes. They
// need the Playwright Chromium download to be present.
//   npm run test:pdf
import test from "node:test";
import assert from "node:assert/strict";
import { compileDeck } from "../deck/compile.js";
import { COMPONENT_LIST } from "../deck/components/index.js";
import {
  renderDeckToPdf,
  isBlockedResourceUrl,
  PDF_RENDER_DELAY,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "../lib/pdfExport.js";

// Slides are authored on a 1920x1080 canvas; at 96dpi that is a 1440x810pt
// PDF page. 1440/810 === 16/9 exactly.
const EXPECTED_MEDIABOX = "/MediaBox [0 0 1440 810]";
const EXPECTED_RATIO = 16 / 9;

// Keep the suite quick: the 3s buffer is exercised once, explicitly.
const FAST = { delayMs: 150 };

function parsePdf(buffer) {
  const raw = buffer.toString("latin1");
  const mediaBoxes = raw.match(/\/MediaBox\s*\[[^\]]*\]/g) || [];
  // Chromium emits a BALANCED page tree for decks beyond ~8 pages: intermediate
  // /Pages nodes carry partial counts and only the root carries the total, so
  // the largest /Count is the page count.
  const counts = (raw.match(/\/Count\s+(\d+)/g) || []).map((m) => Number(m.match(/\d+/)[0]));

  return {
    isPdf: raw.startsWith("%PDF-"),
    hasEof: raw.trimEnd().endsWith("%%EOF"),
    pageCount: counts.length ? Math.max(...counts) : 0,
    pageObjects: (raw.match(/\/Type\s*\/Page[^s]/g) || []).length,
    mediaBoxes,
    fontCount: (raw.match(/\/Type\s*\/Font/g) || []).length,
    imageCount: (raw.match(/\/Subtype\s*\/Image/g) || []).length,
    bytes: buffer.length,
  };
}

function compile(theme, slides) {
  const result = compileDeck({ version: 1, theme, slides });
  assert.equal(result.valid, true, `fixture failed to compile: ${result.errors.join("; ")}`);
  return result.slides;
}

/** Every page must be present, 16:9, and origin-aligned (no margin offset). */
function assertPageGeometry(pdf, expectedPages) {
  assert.equal(pdf.isPdf, true, "must start with a %PDF- header");
  assert.equal(pdf.hasEof, true, "must end with %%EOF");
  assert.equal(pdf.pageCount, expectedPages, "page count must equal slide count");
  assert.equal(pdf.pageObjects, expectedPages, "page objects must equal slide count");
  assert.equal(pdf.mediaBoxes.length, expectedPages, "every page needs a MediaBox");

  for (const box of pdf.mediaBoxes) {
    assert.equal(box, EXPECTED_MEDIABOX, "every page must be 1440x810pt");
    const [x0, y0, x1, y1] = box.match(/[\d.]+/g).map(Number);
    assert.equal(x0, 0, "page origin x must be 0 — no margin offset");
    assert.equal(y0, 0, "page origin y must be 0 — no margin offset");
    assert.ok(
      Math.abs((x1 - x0) / (y1 - y0) - EXPECTED_RATIO) < 0.001,
      "page aspect ratio must be exactly 16:9"
    );
  }
}

// ── The canvas contract ─────────────────────────────────────────

test("the slide canvas constants match the authoring canvas", () => {
  assert.equal(SLIDE_WIDTH, 1920);
  assert.equal(SLIDE_HEIGHT, 1080);
  assert.equal(SLIDE_WIDTH / SLIDE_HEIGHT, EXPECTED_RATIO);
});

test("the render delay is defined in one place and is 3 seconds", () => {
  assert.equal(PDF_RENDER_DELAY, 3000);
});

// ── Deck shapes ─────────────────────────────────────────────────

test("a one-slide deck produces a one-page PDF", async () => {
  const slides = compile("linear", [
    { component: "hero", props: { title: "Single Slide" } },
  ]);
  const pdf = parsePdf(await renderDeckToPdf(slides, FAST));
  assertPageGeometry(pdf, 1);
  assert.ok(pdf.fontCount > 0, "text must be embedded as fonts, not rasterized");
});

test("a multi-slide deck produces one page per slide", async () => {
  const slides = compile("aurora", [
    { component: "hero", props: { title: "One" } },
    { component: "quote", props: { quote: "Two", author: "Someone" } },
    { component: "steps", props: { title: "Three", steps: ["a", "b", "c"] } },
  ]);
  assert.equal(slides.length, 3);
  assertPageGeometry(parsePdf(await renderDeckToPdf(slides, FAST)), 3);
});

test("a deck at the MAX_SLIDES limit exports every page", async () => {
  const deckSlides = Array.from({ length: 50 }, (_, i) => ({
    component: "hero",
    props: { title: `Slide ${i + 1}`, subtitle: "Large deck stress test" },
  }));
  const slides = compile("github-dark", deckSlides);
  assert.equal(slides.length, 50);
  const pdf = parsePdf(await renderDeckToPdf(slides, FAST));
  assertPageGeometry(pdf, 50);
});

test("every slide component renders to its own page", async () => {
  const deckSlides = COMPONENT_LIST.map((component) => ({
    component: component.name,
    props: component.example,
  }));
  const slides = compile("linear", deckSlides);
  assert.equal(slides.length, COMPONENT_LIST.length);
  assertPageGeometry(parsePdf(await renderDeckToPdf(slides, FAST)), COMPONENT_LIST.length);
});

// ── Themes, gradients, SVG, fonts ───────────────────────────────

for (const theme of ["linear", "apple", "cyberpunk", "notion"]) {
  test(`theme "${theme}" exports a valid 16:9 page`, async () => {
    const slides = compile(theme, [
      { component: "hero", props: { title: `${theme} theme`, subtitle: "Background and type" } },
    ]);
    const pdf = parsePdf(await renderDeckToPdf(slides, FAST));
    assertPageGeometry(pdf, 1);
    assert.ok(pdf.fontCount > 0, "theme typography must embed fonts");
  });
}

test("gradients, SVG and web fonts survive the render", async () => {
  const custom = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @font-face { font-family: "LocalTest"; src: local("Georgia"); }
  body { margin: 0; }
  .canvas { width: 1920px; height: 1080px;
    background: linear-gradient(135deg, #5eadff 0%, #ff6ef7 50%, #b3ffc8 100%);
    display: flex; align-items: center; justify-content: center; }
  h1 { font-family: "LocalTest", Georgia, serif; font-size: 96px; color: #0a0a12; }
</style></head><body><div class="canvas">
  <svg width="300" height="300" viewBox="0 0 100 100" aria-hidden="true">
    <defs><radialGradient id="g"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#5eadff"/></radialGradient></defs>
    <circle cx="50" cy="50" r="45" fill="url(#g)" stroke="#0a0a12" stroke-width="2"/>
  </svg>
  <h1>Gradient + SVG</h1>
</div></body></html>`;

  const pdf = parsePdf(await renderDeckToPdf([custom], FAST));
  assertPageGeometry(pdf, 1);
  assert.ok(pdf.fontCount > 0, "the heading must be embedded as real text");
  assert.ok(pdf.bytes > 2000, "a painted gradient page should not be near-empty");
});

// ── Robustness ──────────────────────────────────────────────────

test("a broken image does not fail the export", async () => {
  const slides = compile("linear", [
    { component: "image", props: { title: "Broken", image: "https://invalid.invalid/missing.png" } },
    { component: "hero", props: { title: "Still exported" } },
  ]);
  const pdf = parsePdf(await renderDeckToPdf(slides, FAST));
  assertPageGeometry(pdf, 2);
});

test("an image pointing at a private address is blocked but still exports", async () => {
  const slides = compile("linear", [
    { component: "image", props: { title: "SSRF attempt", image: "http://127.0.0.1:9/secret.png" } },
  ]);
  assertPageGeometry(parsePdf(await renderDeckToPdf(slides, FAST)), 1);
});

test("animated slides reach a deterministic state and export identically", async () => {
  const animated = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { margin: 0; }
    .canvas { width: 1920px; height: 1080px; background: #08090a; display: flex;
      align-items: center; justify-content: center; }
    /* Entrance animation: invisible at 0%, visible at 100%. Capturing the
       start frame would export a blank slide. */
    h1 { color: #fff; font-size: 120px; opacity: 0; animation: reveal 4s ease forwards; }
    @keyframes reveal { from { opacity: 0; transform: translateY(80px); }
                        to   { opacity: 1; transform: none; } }
    .ring { position: absolute; width: 400px; height: 400px; border: 8px dashed #5eadff;
      border-radius: 50%; animation: spin 8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style></head><body><div class="canvas"><div class="ring"></div><h1>Deterministic</h1></div></body></html>`;

  const first = await renderDeckToPdf([animated], FAST);
  const second = await renderDeckToPdf([animated], FAST);

  assertPageGeometry(parsePdf(first), 1);
  assertPageGeometry(parsePdf(second), 1);

  // Byte length is a coarse but effective determinism signal: a mid-animation
  // capture changes the painted content and therefore the stream size.
  const drift = Math.abs(first.length - second.length) / first.length;
  assert.ok(drift < 0.02, `two exports of the same animated deck drifted ${(drift * 100).toFixed(2)}%`);
});

test("repeated exports of the same deck stay stable", async () => {
  const slides = compile("stripe", [
    { component: "dashboard", props: { title: "Repeat", cards: [{ label: "A", value: "1" }] } },
  ]);
  const runs = [];
  for (let i = 0; i < 3; i++) runs.push(await renderDeckToPdf(slides, FAST));
  for (const run of runs) assertPageGeometry(parsePdf(run), 1);
  const sizes = runs.map((r) => r.length);
  const spread = (Math.max(...sizes) - Math.min(...sizes)) / Math.min(...sizes);
  assert.ok(spread < 0.02, `repeated exports varied by ${(spread * 100).toFixed(2)}%`);
});

test("the 3 second safety buffer is honoured", async () => {
  const slides = compile("linear", [{ component: "hero", props: { title: "Timed" } }]);
  const started = Date.now();
  await renderDeckToPdf(slides); // no override — uses PDF_RENDER_DELAY
  const elapsed = Date.now() - started;
  assert.ok(elapsed >= PDF_RENDER_DELAY, `export finished in ${elapsed}ms, before the buffer elapsed`);
});

// ── Failure modes ───────────────────────────────────────────────

test("an invalid deck never reaches the renderer", () => {
  const result = compileDeck({ version: 1, theme: "linear", slides: [{ component: "hero", props: {} }] });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /missing required prop "title"/);
});

test("an unknown theme is rejected by the compiler", () => {
  const result = compileDeck({
    version: 1,
    theme: "does-not-exist",
    slides: [{ component: "hero", props: { title: "x" } }],
  });
  assert.equal(result.valid, false);
});

test("rendering with no slides throws rather than producing an empty PDF", async () => {
  await assert.rejects(() => renderDeckToPdf([]), /non-empty array/);
  await assert.rejects(() => renderDeckToPdf(null), /non-empty array/);
});

// ── URL policy ──────────────────────────────────────────────────

test("resource URL policy blocks private and non-http targets", () => {
  for (const blocked of [
    "http://localhost/x.png",
    "http://127.0.0.1/x.png",
    "http://10.0.0.5/x.png",
    "http://192.168.1.10/x.png",
    "http://172.16.4.4/x.png",
    "http://169.254.169.254/latest/meta-data/",
    "http://metadata.google.internal/x",
    "file:///etc/passwd",
    "ftp://example.com/x",
    "not a url",
  ]) {
    assert.equal(isBlockedResourceUrl(blocked), true, `${blocked} must be blocked`);
  }

  for (const allowed of [
    "https://example.com/image.png",
    "http://example.com/image.png",
    "https://fonts.googleapis.com/css2?family=Inter",
    "data:image/png;base64,iVBORw0KGgo=",
    "about:blank",
  ]) {
    assert.equal(isBlockedResourceUrl(allowed), false, `${allowed} must be allowed`);
  }
});
