// Proof for PPTX export: compiled HTML → Chromium → screenshots → .pptx.
//
// Same shared renderer as the PDF export, so a slide that loads correctly in
// one loads correctly in the other. Needs the Playwright Chromium download.
//   npm run test:pptx
import test from "node:test";
import assert from "node:assert/strict";
import { compileDeck } from "../deck/compile.js";
import { COMPONENT_LIST } from "../deck/components/index.js";
import {
  renderDeckToPptx,
  renderDeckToImages,
  PPTX_RENDER_DELAY,
  PPTX_IMAGE_SCALE,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "../lib/pptxExport.js";
import { RENDER_DELAY } from "../lib/slideRenderer.js";

const FAST = { delayMs: 150 };

/** Read the entry names out of a zip archive (a .pptx is a zip). */
function zipEntries(buffer) {
  const names = [];
  for (let i = 0; i < buffer.length - 30; i++) {
    if (buffer.readUInt32LE(i) === 0x04034b50) {
      const nameLen = buffer.readUInt16LE(i + 26);
      const extraLen = buffer.readUInt16LE(i + 28);
      names.push(buffer.subarray(i + 30, i + 30 + nameLen).toString("utf8"));
      i += 29 + nameLen + extraLen;
    }
  }
  return names;
}

/** Every embedded PNG's pixel dimensions, read from its IHDR chunk. */
function pngDimensions(buffer) {
  const dims = [];
  for (let i = 0; i < buffer.length - 24; i++) {
    if (buffer.readUInt32BE(i) === 0x89504e47 && buffer.readUInt32BE(i + 4) === 0x0d0a1a0a) {
      dims.push({ w: buffer.readUInt32BE(i + 16), h: buffer.readUInt32BE(i + 20) });
    }
  }
  return dims;
}

function compile(theme, slides) {
  const result = compileDeck({ version: 1, theme, slides });
  assert.equal(result.valid, true, `fixture failed to compile: ${result.errors.join("; ")}`);
  return result.slides;
}

function assertDeck(buffer, expectedSlides) {
  assert.ok(Buffer.isBuffer(buffer), "must return a Buffer");
  assert.equal(buffer.subarray(0, 2).toString("latin1"), "PK", "a .pptx is a zip archive");

  const entries = zipEntries(buffer);
  const slideParts = entries.filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  const mediaParts = entries.filter((n) => /^ppt\/media\/.+\.(png|jpe?g)$/i.test(n));

  assert.equal(slideParts.length, expectedSlides, "one slide part per slide");
  assert.equal(mediaParts.length, expectedSlides, "one embedded image per slide");
  assert.ok(entries.includes("ppt/presentation.xml"), "must contain a presentation part");
  assert.ok(entries.includes("[Content_Types].xml"), "must contain the content-type map");
}

// ── Contract ────────────────────────────────────────────────────

test("the canvas constants match the authoring canvas", () => {
  assert.equal(SLIDE_WIDTH, 1920);
  assert.equal(SLIDE_HEIGHT, 1080);
  assert.equal(SLIDE_WIDTH / SLIDE_HEIGHT, 16 / 9);
});

test("PPTX and PDF share one render delay, defined in one place", () => {
  assert.equal(PPTX_RENDER_DELAY, 3000);
  assert.equal(PPTX_RENDER_DELAY, RENDER_DELAY);
});

// ── Deck shapes ─────────────────────────────────────────────────

test("a one-slide deck produces a one-slide deck file", async () => {
  const slides = compile("linear", [{ component: "hero", props: { title: "Single" } }]);
  assertDeck(await renderDeckToPptx(slides, FAST), 1);
});

test("a multi-slide deck produces one slide per slide", async () => {
  const slides = compile("aurora", [
    { component: "hero", props: { title: "One" } },
    { component: "quote", props: { quote: "Two", author: "Someone" } },
    { component: "steps", props: { title: "Three", steps: ["a", "b"] } },
  ]);
  assertDeck(await renderDeckToPptx(slides, FAST), 3);
});

test("a deck at the MAX_SLIDES limit exports every slide", async () => {
  const deckSlides = Array.from({ length: 50 }, (_, i) => ({
    component: "hero",
    props: { title: `Slide ${i + 1}` },
  }));
  const slides = compile("github-dark", deckSlides);
  assert.equal(slides.length, 50);
  // Full density across 50 slides is the memory worst case; keep the scale
  // low here so CI does not hold 50 4K bitmaps at once.
  assertDeck(await renderDeckToPptx(slides, { ...FAST, scale: 1 }), 50);
});

test("every slide component renders to its own slide", async () => {
  const slides = compile(
    "linear",
    COMPONENT_LIST.map((c) => ({ component: c.name, props: c.example }))
  );
  assertDeck(await renderDeckToPptx(slides, { ...FAST, scale: 1 }), COMPONENT_LIST.length);
});

// ── Capture fidelity ────────────────────────────────────────────

test("slides are captured at the full 16:9 canvas, scaled for density", async () => {
  const slides = compile("cyberpunk", [{ component: "hero", props: { title: "Density" } }]);
  const pptx = await renderDeckToPptx(slides, FAST);

  for (const { w, h } of pngDimensions(pptx)) {
    assert.equal(w, SLIDE_WIDTH * PPTX_IMAGE_SCALE, "image width must be the scaled canvas");
    assert.equal(h, SLIDE_HEIGHT * PPTX_IMAGE_SCALE, "image height must be the scaled canvas");
    assert.ok(Math.abs(w / h - 16 / 9) < 0.001, "every image must be 16:9");
  }
});

test("images are produced one per slide, in deck order", async () => {
  const slides = compile("apple", [
    { component: "hero", props: { title: "First" } },
    { component: "hero", props: { title: "Second" } },
  ]);
  const images = await renderDeckToImages(slides, { ...FAST, scale: 1 });

  assert.equal(images.length, 2);
  for (const png of images) {
    assert.equal(png.subarray(0, 4).toString("latin1"), "\x89PNG", "each capture is a PNG");
    assert.ok(png.length > 1000, "a rendered slide should not be a near-empty image");
  }
  // Different titles must produce different pixels — proof the capture is not
  // repeating one screenshot for every slide.
  assert.notEqual(images[0].length, images[1].length);
});

test("gradients, SVG and web fonts survive the capture", async () => {
  const custom = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { margin: 0; }
    .canvas { width:1920px; height:1080px; display:flex; align-items:center; justify-content:center;
      background: linear-gradient(135deg,#5eadff,#ff6ef7 50%,#b3ffc8); }
    h1 { font-family: Georgia, serif; font-size: 96px; color:#0a0a12; }
  </style></head><body><div class="canvas">
    <svg width="240" height="240" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#fff"/></svg>
    <h1>Gradient</h1></div></body></html>`;

  const pptx = await renderDeckToPptx([custom], FAST);
  assertDeck(pptx, 1);
  // A painted gradient compresses far worse than a blank page.
  assert.ok(pptx.length > 20_000, `expected a painted slide, got ${pptx.length} bytes`);
});

test("animated slides reach a deterministic state", async () => {
  const animated = `<!DOCTYPE html><html><head><style>
    body { margin: 0; }
    .canvas { width:1920px; height:1080px; background:#08090a; display:flex;
      align-items:center; justify-content:center; }
    /* Starts invisible: capturing frame 0 would export a blank slide. */
    h1 { color:#fff; font-size:120px; opacity:0; animation: reveal 4s ease forwards; }
    @keyframes reveal { to { opacity: 1; } }
  </style></head><body><div class="canvas"><h1>Deterministic</h1></div></body></html>`;

  const [first, second] = [
    await renderDeckToImages([animated], { ...FAST, scale: 1 }),
    await renderDeckToImages([animated], { ...FAST, scale: 1 }),
  ];

  const drift = Math.abs(first[0].length - second[0].length) / first[0].length;
  assert.ok(drift < 0.05, `two captures of the same animated slide drifted ${(drift * 100).toFixed(2)}%`);
});

// ── Robustness ──────────────────────────────────────────────────

test("a broken image does not fail the export", async () => {
  const slides = compile("linear", [
    { component: "image", props: { title: "Broken", image: "https://invalid.invalid/x.png" } },
    { component: "hero", props: { title: "Still exported" } },
  ]);
  assertDeck(await renderDeckToPptx(slides, { ...FAST, scale: 1 }), 2);
});

test("an image pointing at a private address is blocked but still exports", async () => {
  const slides = compile("linear", [
    { component: "image", props: { title: "SSRF", image: "http://127.0.0.1:9/secret.png" } },
  ]);
  assertDeck(await renderDeckToPptx(slides, { ...FAST, scale: 1 }), 1);
});

test("repeated exports stay stable", async () => {
  const slides = compile("stripe", [
    { component: "dashboard", props: { title: "Repeat", cards: [{ label: "A", value: "1" }] } },
  ]);
  const runs = [];
  for (let i = 0; i < 2; i++) runs.push(await renderDeckToPptx(slides, { ...FAST, scale: 1 }));
  for (const run of runs) assertDeck(run, 1);
});

test("rendering with no slides throws rather than producing an empty deck", async () => {
  await assert.rejects(() => renderDeckToPptx([]), /non-empty array/);
  await assert.rejects(() => renderDeckToImages(null), /non-empty array/);
});
