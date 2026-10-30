// Server-side PPTX export.
//
//   compiled HTML (slides[]) ──→ lib/slideRenderer.js ──→ screenshots ──→ .pptx
//
// PowerPoint has no equivalent of a live web page, so slides are flattened to
// images — but they are now photographed by real Chromium AFTER the same
// readiness pipeline the PDF export uses (fonts loaded, images loaded,
// animations settled, then the buffer). That replaces the old client-side
// html-to-image capture, which re-implemented CSS in JavaScript and routinely
// lost web fonts, gradients and pseudo-elements.
//
// Node runtime only (Playwright + Chromium). Never import from client code.

import PptxGenJS from "pptxgenjs";
import {
  withRenderedDeck,
  RENDER_DELAY,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "./slideRenderer.js";

/** Safety buffer applied after all readiness checks pass. Shared with the PDF path. */
export const PPTX_RENDER_DELAY = RENDER_DELAY;

/**
 * Capture density. 2 matches the quality the previous client-side exporter
 * aimed at (pixelRatio: 2) and yields 3840x2160 slide images. Raising it
 * multiplies memory across the whole deck, which MAX_SLIDES already bounds.
 */
export const PPTX_IMAGE_SCALE = 2;

/** LAYOUT_16x9 in pptxgenjs is 10 x 5.625 inches — the same 16:9 as the canvas. */
const SLIDE_INCHES = { w: 10, h: 5.625 };

/**
 * Photograph every slide at its true canvas size.
 * Returns one PNG buffer per slide, in deck order.
 *
 * @param {string[]} slides Compiled standalone HTML documents (compiler output).
 * @param {{ delayMs?: number, scale?: number }} [options]
 * @returns {Promise<Buffer[]>}
 */
export async function renderDeckToImages(
  slides,
  { delayMs = PPTX_RENDER_DELAY, scale = PPTX_IMAGE_SCALE } = {}
) {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error("renderDeckToImages requires a non-empty array of slides");
  }

  return withRenderedDeck(
    slides,
    { delayMs, deviceScaleFactor: scale },
    async ({ page }) => {
      const blocks = await page.$$(".deck-page");
      const shots = [];
      // Sequential on purpose: each screenshot allocates a full-resolution
      // bitmap, and a large deck should not hold N of them in flight at once.
      for (const block of blocks) {
        shots.push(await block.screenshot({ type: "png" }));
      }
      return shots;
    }
  );
}

/**
 * Render compiled slide documents into a 16:9 PowerPoint deck.
 *
 * @param {string[]} slides Compiled standalone HTML documents (compiler output).
 * @param {{ delayMs?: number, scale?: number }} [options]
 * @returns {Promise<Buffer>} .pptx bytes.
 */
export async function renderDeckToPptx(slides, options = {}) {
  const images = await renderDeckToImages(slides, options);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";

  for (const png of images) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: `image/png;base64,${png.toString("base64")}`,
      x: 0,
      y: 0,
      w: SLIDE_INCHES.w,
      h: SLIDE_INCHES.h,
    });
  }

  const out = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}

export { SLIDE_WIDTH, SLIDE_HEIGHT };
