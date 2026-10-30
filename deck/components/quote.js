// Quote — displays an emphasized quotation with an optional author.
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
  quote: { required: true, type: "string", description: "The quotation itself, without surrounding quote marks." },
  author: { required: false, type: "string", description: "Who said it. Omit for anonymous principles or maxims." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary:
    "One quotation given the whole canvas, with an optional attribution line.",
  bestFor: ["Memorable statements", "Guiding principles", "Customer testimonials", "Chapter openers"],
  avoidFor: ["Multiple ideas at once", "Explanatory prose", "Data"],
  keywords: ["quote", "quotation", "testimonial", "saying", "principle", "citation"],
};

const example = {
  quote:
    "Programs must be written for people to read, and only incidentally for machines to execute.",
  author: "Harold Abelson",
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "quote");
  return errors;
}

const css = `
  .quote {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 120px 180px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
    text-align: center;
  }
  /* Georgia is intentional: a serif quotation mark is a typographic device,
     not themed text — it stays constant across themes. */
  .quote-mark {
    margin-bottom: 20px;
    font-family: Georgia, serif;
    font-size: 220px;
    line-height: 0.8;
    color: var(--deck-accent, #6e7681);
    opacity: 0.18;
  }
  .quote-text {
    max-width: 1450px;
    margin: 0;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 76px;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
    overflow-wrap: break-word;
  }
  .quote-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 56px 0 42px;
    background: var(--deck-accent, #6e7681);
  }
  .quote-author {
    font-size: 38px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--deck-muted, #9aa0aa);
  }
`;

function render(props) {
  const author =
    props.author !== undefined && props.author !== ""
      ? `\n<div class="quote-author">— ${props.author}</div>`
      : "";

  return `<section class="quote">
<div class="quote-mark">“</div>

<p class="quote-text">${props.quote}</p>

<div class="quote-rule"></div>${author}

</section>`;
}

const quote = {
  name: "quote",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default quote;
