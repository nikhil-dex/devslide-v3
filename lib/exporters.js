// Client-side deck exporters, shared by the export page and My Decks.
//
// The HTML export is built here in the browser. The PDF and PPTX exports are
// rendered server-side by Chromium (lib/slideRenderer.js) so slide HTML and CSS
// are fully loaded before capture; this file only requests them and saves the
// response.
import { withAutoFit } from "./slideAutofit";

// True when slides contain animation or interactivity that a .pptx export
// cannot keep (slides are flattened to images) — used to warn before export.
export function deckHasDynamicContent(slides) {
  if (!Array.isArray(slides)) return false;
  const all = slides.join("\n");
  return /@keyframes|animation\s*:|:hover|<script/i.test(all);
}

export const PPTX_EXPORT_WARNING =
  "This deck has animations or interactive elements. Exporting as .pptx flattens every slide to a static image, so all of that is lost.\n\n" +
  "Tip: use “Generate Link” or “Download HTML” to keep the deck fully alive.\n\n" +
  "Export as .pptx anyway?";

/**
 * How long the object URL is kept alive after the click.
 *
 * Revoking in the same task as click() is a race: browsers are free to read
 * the blob URL on a LATER task, and a revoked URL yields nothing — which is
 * exactly how a download lands on disk as a 0-byte file. Deferring cleanup by
 * one second costs nothing (no user-visible wait; the blob is simply freed a
 * moment later) and removes the race for every caller.
 */
const DOWNLOAD_CLEANUP_DELAY = 1000;

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  // The anchor now lives briefly past the click, so keep it out of the layout.
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Clean up on a later task, once the browser has taken ownership of the blob.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, DOWNLOAD_CLEANUP_DELAY);
}

export function buildStandaloneHtml(title, slides) {
  const safeTitle = String(title).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  // Escape "</" so slide HTML can't terminate the viewer's <script> block.
  const slidesJson = JSON.stringify(slides.map(withAutoFit)).replace(/<\//g, "<\\/");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0b0f1a; height: 100vh; overflow: hidden; font-family: system-ui, sans-serif; }
  /* Slides are authored at 1920x1080; render at that size and scale to fit the window. */
  #frame { position: absolute; width: 1920px; height: 1080px; border: 0; background: #fff; transform-origin: top left; }
  .hud { position: fixed; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,.65); padding: 8px 14px; border-radius: 999px; opacity: 0; transition: opacity .25s; z-index: 10; }
  body:hover .hud { opacity: 1; }
  .hud button { background: rgba(255,255,255,.12); color: #fff; border: 0; border-radius: 8px; padding: 6px 14px; font-size: 14px; cursor: pointer; }
  .hud button:hover { background: rgba(255,255,255,.28); }
  .hud span { color: #fff; font-size: 14px; min-width: 52px; text-align: center; }
  /* Touch navigation: invisible edge strips (tap = prev/next, swipe works too).
     Touches on the slide iframe never reach this page, so these are the touch surface. */
  .tapzone { position: fixed; top: 0; bottom: 0; width: 18%; z-index: 5; display: none; }
  #tapL { left: 0; } #tapR { right: 0; }
  @media (pointer: coarse) {
    .tapzone { display: block; }
    .hud { opacity: 1; } /* no hover on touch screens — keep controls visible */
  }
</style>
</head>
<body>
<iframe id="frame" sandbox="allow-scripts" title="Slide"></iframe>
<div id="tapL" class="tapzone"></div>
<div id="tapR" class="tapzone"></div>
<div class="hud">
  <button id="prev">&#8592;</button>
  <span id="counter"></span>
  <button id="next">&#8594;</button>
  <button id="fs">Fullscreen</button>
</div>
<script>
  var slides = ${slidesJson};
  var i = 0;
  var frame = document.getElementById("frame");
  var counter = document.getElementById("counter");
  function layout() {
    var w = window.innerWidth, h = window.innerHeight;
    var s = Math.min(w / 1920, h / 1080);
    frame.style.transform = "scale(" + s + ")";
    frame.style.left = ((w - 1920 * s) / 2) + "px";
    frame.style.top = ((h - 1080 * s) / 2) + "px";
  }
  window.addEventListener("resize", layout);
  layout();
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    frame.srcdoc = slides[i];
    counter.textContent = (i + 1) + " / " + slides.length;
  }
  document.getElementById("prev").onclick = function () { show(i - 1); };
  document.getElementById("next").onclick = function () { show(i + 1); };
  var fsBtn = document.getElementById("fs");
  var docEl = document.documentElement;
  if (!docEl.requestFullscreen && !docEl.webkitRequestFullscreen) {
    fsBtn.style.display = "none"; // iOS Safari: no Fullscreen API; page already fills the screen
  }
  fsBtn.onclick = function () {
    if (docEl.requestFullscreen) docEl.requestFullscreen();
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
  };
  function bindZone(el, dir) {
    var sx = 0, sy = 0;
    el.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1));
      else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) show(i + dir);
    }, { passive: true });
  }
  bindZone(document.getElementById("tapL"), -1);
  bindZone(document.getElementById("tapR"), 1);
  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); show(i + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(i - 1); }
    else if (e.key === "f" || e.key === "F") { document.documentElement.requestFullscreen(); }
  });
  show(0);
</script>
</body>
</html>`;
}

export function downloadHtmlFile(title, slides) {
  const html = buildStandaloneHtml(title, slides);
  const blob = new Blob([html], { type: "text/html" });
  triggerDownload(blob, `${String(title).trim() || "presentation"}.html`);
}

/**
 * Start a download from a URL the server produced.
 *
 * The artifact lives in Blob storage, so this is a plain cross-origin link.
 * The `download` attribute is ignored cross-origin — the filename comes from
 * the Content-Disposition the Blob store sends (the URL carries `download=1`),
 * which is why the server puts the real filename in the object path.
 */
function startRemoteDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  if (filename) a.download = filename; // honoured if the URL ever becomes same-origin
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), DOWNLOAD_CLEANUP_DELAY);
}

/**
 * Ask the server to render an export, then download it from the URL it returns.
 *
 * The artifact never travels through the API response. Vercel Functions cap a
 * response body at 4.5 MB and AIRDeck exports pass that at ~16 slides (PDF) or
 * ~2 slides (PPTX), so the bytes go to Blob storage and the browser fetches
 * them directly.
 *
 * A JSON response is also invisible to download managers, which is what broke
 * the previous binary response: IDM hijacked the fetch and left it empty.
 */
async function requestServerExport({ endpoint, title, slides, label }) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, slides }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body — handled below */
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `${label} export failed. Please try again.`);
  }
  if (typeof data.url !== "string" || data.url === "") {
    throw new Error(
      `The ${label} export did not return a download link. Please try again.`
    );
  }

  startRemoteDownload(data.url, data.filename);
  return data;
}

/** PDF: one 16:9 page per slide, vector text, backgrounds preserved. */
export function downloadAsPdf(title, slides) {
  return requestServerExport({
    endpoint: "/api/export-pdf",
    title,
    slides,
    label: "PDF",
  });
}

/** PPTX: one 16:9 slide per slide, each a full-resolution render of the page. */
export function downloadAsPptx(title, slides) {
  return requestServerExport({
    endpoint: "/api/export-pptx",
    title,
    slides,
    label: "PowerPoint file",
  });
}
