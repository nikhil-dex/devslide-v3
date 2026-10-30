// Hero — the opening/title slide component.
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
// neutral fallback — var(--deck-bg, #101014). Part 4 only has to inject a
// :root token block; this file will not change.

import { requiredText } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "The headline. Short and punchy — it renders at 120px." },
  subtitle: { required: false, type: "string", description: "One supporting sentence, shown under the accent rule." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary:
    "A full-bleed title slide: one headline, an accent rule, and an optional supporting line.",
  bestFor: ["Opening slides", "Section dividers", "Closing slides", "Single-statement moments"],
  avoidFor: ["Dense information", "Bulleted lists", "Metrics and data"],
  keywords: ["title", "opening", "intro", "cover", "section", "divider", "closing"],
};

const example = {
  title: "The Future of Flight",
  subtitle: "Electric aviation, from prototype to fleet",
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  return errors;
}

const css = `
  .hero {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 120px 160px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .hero h1 {
    margin: 0;
    max-width: 1500px;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 120px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
    overflow-wrap: break-word;
  }
  .hero-rule {
    width: 120px;
    height: 4px;
    border-radius: 999px;
    margin: 56px 0 0;
    background: var(--deck-accent, #6e7681);
  }
  .hero p {
    margin: 48px 0 0;
    max-width: 1200px;
    font-size: 44px;
    font-weight: 400;
    line-height: 1.45;
    color: var(--deck-muted, #9aa0aa);
    overflow-wrap: break-word;
  }
`;

function render(props) {
  const subtitle =
    props.subtitle !== undefined && props.subtitle !== ""
      ? `\n<p>${props.subtitle}</p>`
      : "";

  return `<section class="hero">
<h1>${props.title}</h1>
<div class="hero-rule"></div>${subtitle}
</section>`;
}

const hero = {
  name: "hero",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default hero;
