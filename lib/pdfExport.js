// Server-side PDF export.
//
//   compiled HTML (slides[]) ──→ lib/slideRenderer.js ──→ page.pdf() ──→ 16:9 PDF
//
// The rendering pipeline (mounting each slide at 1920x1080, waiting for fonts,
// images and animations, then the settling buffer) lives in lib/slideRenderer.js
// and is shared with the PPTX exporter. This file only turns a ready page into
// a PDF.
//
// Node runtime only (Playwright + Chromium). Never import from client code.

import {
  withRenderedDeck,
  RENDER_DELAY,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  isBlockedResourceUrl,
} from "./slideRenderer.js";

/** Safety buffer applied after all readiness checks pass. Single source of truth. */
export const PDF_RENDER_DELAY = RENDER_DELAY;

export { SLIDE_WIDTH, SLIDE_HEIGHT, isBlockedResourceUrl };

/**
 * Render compiled slide documents into a single 16:9 PDF.
 *
 * Slides become pages of one print job rather than separate captures that need
 * stitching: 1920x1080 CSS pixels map to a 1440x810pt page, which is exactly
 * 16:9, with zero margins and vector text.
 *
 * @param {string[]} slides Compiled standalone HTML documents (compiler output).
 * @param {{ delayMs?: number }} [options]
 * @returns {Promise<Buffer>} PDF bytes.
 */
export async function renderDeckToPdf(slides, { delayMs = PDF_RENDER_DELAY } = {}) {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error("renderDeckToPdf requires a non-empty array of slides");
  }

  return withRenderedDeck(slides, { delayMs }, ({ page }) =>
    page.pdf({
      width: `${SLIDE_WIDTH}px`,
      height: `${SLIDE_HEIGHT}px`,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false,
      scale: 1,
    })
  );
}
