// Shared server-side slide renderer.
//
//   Deck JSON ──→ existing compiler ──→ compiled HTML (slides[]) ──┬─→ interactive HTML
//                                                                  ├─→ PDF   (lib/pdfExport.js)
//                                                                  └─→ PPTX  (lib/pptxExport.js)
//
// Both server exporters need the same thing: every slide mounted at its true
// 1920x1080 size, with fonts, images and animations settled before anything is
// captured. That pipeline lives here once so the two formats can never drift
// apart — a slide that looks right in the PDF looks the same in the PPTX.
//
// This module consumes the SAME artifact every other exporter consumes: an
// array of standalone slide documents produced by deck/compile.js. It never
// compiles, parses or rewrites deck source — the compiler stays the single
// authority on what a slide is.
//
// Node runtime only (Playwright + Chromium). Never import from client code.

import { chromium } from "playwright";
import sparticuzChromium from "@sparticuz/chromium-min";
import { withAutoFit } from "./slideAutofit.js";

/** Safety buffer applied after all readiness checks pass. Single source of truth. */
export const RENDER_DELAY = 3000;

/** The canvas every AIRDeck slide is authored against. */
export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;

/** Upper bounds so one export can never hang a server worker. */
const NAV_TIMEOUT = 30_000;
const FRAME_READY_TIMEOUT = 20_000;
const IMAGE_TIMEOUT = 8_000;

// Some image CDNs reject Playwright's default headless user agent and answer
// with an error page, which Chromium then blocks (ERR_BLOCKED_BY_ORB) and the
// slide exports with a missing image. Presenting as ordinary desktop Chrome
// makes the export match what the author saw in the app.
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";

// ── Security ────────────────────────────────────────────────────
//
// Slide HTML is AI- or user-authored and may reference arbitrary URLs. In the
// browser those requests come from the viewer's machine; rendering server-side
// would otherwise let a slide reach hosts only our server can see. Public
// http(s) is allowed (the presentation system already loads remote images and
// web fonts); everything private, local or non-http is refused.

import { isBlockedResourceUrl, isBlockedResourceRequest } from "./networkSecurity.mjs";

export { isBlockedResourceUrl };

// ── Deterministic capture state ─────────────────────────────────
//
// Injected into each slide document inside the export browser ONLY. The stored
// slide HTML is never modified, so interactive presentation behaviour — in the
// app, the share link and the HTML download — is completely unaffected.
//
// Collapsing durations to zero with `fill-mode: forwards` lands every animation
// on its FINAL keyframe rather than its first. That matters: entrance
// animations typically run opacity 0 → 1, so pausing at the start would export
// invisible content.
const CAPTURE_CSS = `
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    animation-fill-mode: forwards !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
    caret-color: transparent !important;
  }
  html, body { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; }
`;

/**
 * Runs inside a slide document. Resolves once fonts and images have settled.
 * Broken images resolve rather than reject — one dead URL must not fail an
 * entire export — and every wait is individually capped.
 */
/* c8 ignore start — executed in the browser context, not in Node */
function slideReadinessScript(imageTimeout) {
  const waitForImages = () =>
    Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, imageTimeout);
        });
      })
    );

  const waitForFonts = () =>
    document.fonts && document.fonts.ready
      ? Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, imageTimeout)),
        ])
      : Promise.resolve();

  return Promise.all([waitForFonts(), waitForImages()]).then(() => {
    // Land every Web Animation on a stable frame. Finite animations jump to
    // their end; infinite ones cannot finish, so they are cancelled back to a
    // defined base state.
    if (typeof document.getAnimations === "function") {
      for (const animation of document.getAnimations()) {
        try {
          animation.finish();
        } catch {
          try {
            animation.cancel();
          } catch {
            /* animation already detached */
          }
        }
      }
    }
    return document.images.length;
  });
}
/* c8 ignore stop */

/**
 * The host document: one page-sized block per slide, each isolating a slide
 * document in its own iframe. Slide CSS is global (`.hero`, `.canvas`…), so
 * concatenating slides into one document would make them collide.
 *
 * The @page rule is only meaningful for the PDF exporter; it is inert for the
 * image exporter and keeps a single host shared between both.
 */
function buildHostHtml(slideCount) {
  const blocks = Array.from(
    { length: slideCount },
    (_, i) =>
      `<div class="deck-page" data-page="${i}"><iframe data-slide="${i}" title="Slide ${i + 1}" scrolling="no"></iframe></div>`
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AIRDeck export</title>
<style>
  @page { size: ${SLIDE_WIDTH}px ${SLIDE_HEIGHT}px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  .deck-page {
    width: ${SLIDE_WIDTH}px;
    height: ${SLIDE_HEIGHT}px;
    overflow: hidden;
    position: relative;
    break-after: page;
    page-break-after: always;
  }
  /* Without this the final slide forces one trailing blank page. */
  .deck-page:last-child { break-after: auto; page-break-after: auto; }
  .deck-page > iframe {
    width: ${SLIDE_WIDTH}px;
    height: ${SLIDE_HEIGHT}px;
    border: 0;
    display: block;
  }
</style>
</head>
<body>
${blocks}
</body>
</html>`;
}

/**
 * Mount a deck in Chromium, wait until every slide has genuinely finished
 * loading, then hand the ready page to `capture`.
 *
 * Readiness order — the delay is a safety buffer, never the mechanism:
 *   1. every slide frame reaches DOM-complete
 *   2. deterministic animation state injected per slide
 *   3. fonts, images and Web Animations settle inside every slide
 *   4. no in-flight network left in the host or any frame
 *   5. `delayMs` settling buffer
 *
 * One browser, one context, one page for the whole deck.
 *
 * @param {string[]} slides Compiled standalone HTML documents (compiler output).
 * @param {{ delayMs?: number, deviceScaleFactor?: number }} [options]
 * @param {(ctx: { page: import("playwright").Page, slideFrames: import("playwright").Frame[] }) => Promise<T>} capture
 * @returns {Promise<T>}
 * @template T
 */
export async function withRenderedDeck(slides, options, capture) {
  const { delayMs = RENDER_DELAY, deviceScaleFactor = 1 } = options ?? {};

  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error("withRenderedDeck requires a non-empty array of slides");
  }

  // Same overflow guard the HTML export applies, so an export looks like the
  // deck the user already previewed and nothing is clipped.
  const prepared = slides.map((html) => withAutoFit(html));

  let browser;
  try {
if (process.env.VERCEL === "1") {
  const executablePath = await sparticuzChromium.executablePath(
    process.env.CHROMIUM_PACK_URL
  );

  browser = await chromium.launch({
    executablePath,
    args: [
      ...sparticuzChromium.args,
      "--font-render-hinting=none",
    ],
    headless: true,
  });
} else {
  browser = await chromium.launch({
    args: ["--font-render-hinting=none"],
    headless: true,
  });
}

    const context = await browser.newContext({
      viewport: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
      deviceScaleFactor,
      userAgent: DESKTOP_UA,
      // Slides that honour the media query settle on their own without any
      // injected CSS; CAPTURE_CSS then covers the ones that do not.
      reducedMotion: "reduce",
      javaScriptEnabled: true,
    });

    await context.route("**/*", async (route) => {
      if (await isBlockedResourceRequest(route.request().url())) return route.abort();
      return route.continue();
    });

    const page = await context.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT);

    await page.setContent(buildHostHtml(prepared.length), { waitUntil: "load" });

    // Populate the iframes from JS rather than inlining srcdoc into the shell:
    // no HTML-attribute escaping of slide markup, so slide content can never
    // break out of the host document.
    await page.evaluate((documents) => {
      document.querySelectorAll("iframe[data-slide]").forEach((frame, index) => {
        frame.setAttribute("srcdoc", documents[index]);
      });
    }, prepared);

    // 1. every slide frame reaches DOM-complete
    const slideFrames = [];
    for (let i = 0; i < prepared.length; i++) {
      const handle = await page.waitForSelector(`iframe[data-slide="${i}"]`);
      const frame = await handle.contentFrame();
      if (!frame) throw new Error(`Slide ${i + 1} failed to attach a document`);
      await frame.waitForLoadState("load", { timeout: FRAME_READY_TIMEOUT });
      slideFrames.push(frame);
    }

    // 2. deterministic animation state, applied per slide document
    await Promise.all(
      slideFrames.map((frame) =>
        frame.addStyleTag({ content: CAPTURE_CSS }).catch(() => {
          /* a frame that navigated away still gets the readiness pass below */
        })
      )
    );

    // 3. fonts, images and Web Animations settle inside every slide
    await Promise.all(
      slideFrames.map((frame) =>
        frame
          .evaluate(slideReadinessScript, IMAGE_TIMEOUT)
          .catch(() => 0) // never let one slide's script abort the export
      )
    );

    // 4. no in-flight network left in the host or any frame
    await page
      .waitForLoadState("networkidle", { timeout: FRAME_READY_TIMEOUT })
      .catch(() => {
        /* a slide polling a remote resource must not stall the export */
      });

    // 5. safety buffer — deliberately last, and never the only mechanism
    if (delayMs > 0) await page.waitForTimeout(delayMs);

    const result = await capture({ page, slideFrames });

    await context.close();
    return result;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
