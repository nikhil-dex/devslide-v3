// Image — displays an image with an optional title and caption.
//
// A component owns: layout, typography, spacing, HTML structure, its CSS.
// It does NOT own: themes, the compiler, the document shell, escaping.
//
// Contracts with the compiler:
//   • render(props) receives props ALREADY HTML-escaped — interpolate freely.
//   • render(props) returns component markup only; the compiler wraps it in
//     the standalone document and the 1920×1080 canvas.
//   • css is a static string the compiler places in <head>.
//
// Theme-readiness: every color/font references a CSS custom property with a
// neutral fallback — var(--deck-bg, #101014). Themes inject only tokens.

import { requiredText } from "./validators.js";

const PROPS = {
  image: { required: true, type: "string (URL)", description: "Absolute URL of the image to display." },
  title: { required: false, type: "string", description: "Heading shown above the image." },
  caption: { required: false, type: "string", description: "Short caption shown beneath the image." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A single image sized to the slide, with an optional title and caption.",
  bestFor: ["Diagrams", "Screenshots", "Charts produced elsewhere", "Photographs"],
  avoidFor: ["Multiple images at once", "Text-only content", "Data better shown as a table"],
  keywords: ["image", "photo", "diagram", "screenshot", "figure", "illustration", "visual"],
};

const example = {
  title: "CNN Architecture",
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Typical_cnn.png/640px-Typical_cnn.png",
  caption: "A typical convolutional neural network.",
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "image");
  return errors;
}

const css = `
  .image-slide {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 70px 90px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .image-title {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 82px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .image-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 34px auto 44px;
    background: var(--deck-accent, #6e7681);
  }
  .image-frame {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  }
  .image-frame img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
  .image-caption {
    margin-top: 28px;
    text-align: center;
    font-size: 30px;
    line-height: 1.45;
    color: var(--deck-muted, #9aa0aa);
    overflow-wrap: break-word;
  }
`;

function render(props) {
  const title =
    props.title !== undefined && String(props.title).trim() !== ""
      ? `<h1 class="image-title">${props.title}</h1>
<div class="image-rule"></div>`
      : "";

  const caption =
    props.caption !== undefined && String(props.caption).trim() !== ""
      ? `<div class="image-caption">${props.caption}</div>`
      : "";

  return `<section class="image-slide">

${title}

<div class="image-frame">
  <img
    src="${props.image}"
    alt="${props.caption || props.title || "Presentation Image"}"
  />
</div>

${caption}

</section>`;
}

const image = {
  name: "image",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default image;
