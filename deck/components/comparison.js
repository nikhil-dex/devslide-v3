// Comparison — compares two ideas side-by-side.
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

import { requiredText, requiredStringArray } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "What is being compared." },
  leftTitle: { required: true, type: "string", description: "Heading for the left column." },
  rightTitle: { required: true, type: "string", description: "Heading for the right column." },
  leftPoints: { required: true, type: "string[]", description: "Short bullet items for the left side." },
  rightPoints: { required: true, type: "string[]", description: "Short bullet items for the right side." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "Two labelled columns set side by side, each with its own bullet list.",
  bestFor: ["Pros vs cons", "Before vs after", "Product A vs B", "Old approach vs new"],
  avoidFor: ["Three or more options", "Chronological sequences", "Single-column lists"],
  keywords: ["comparison", "versus", "vs", "pros", "cons", "before", "after", "tradeoff"],
};

const example = {
  title: "Manual Decks vs AIRDeck",
  leftTitle: "Manual",
  rightTitle: "AIRDeck",
  leftPoints: ["Hours of formatting", "Generic templates", "Static slides"],
  rightPoints: ["Describe the idea", "Ten design systems", "Interactive HTML"],
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredText(errors, props, "leftTitle");
  requiredText(errors, props, "rightTitle");
  requiredStringArray(errors, props, "leftPoints");
  requiredStringArray(errors, props, "rightPoints");
  return errors;
}

const css = `
  .comparison {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 90px 120px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .comparison h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 88px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .comparison-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 36px auto 72px;
    background: var(--deck-accent, #6e7681);
  }
  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    flex: 1;
  }
  .comparison-card {
    padding: 48px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .comparison-card h2 {
    margin: 0 0 32px;
    text-align: center;
    font-size: 42px;
    color: var(--deck-text, #f4f5f7);
  }
  .comparison-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .comparison-item {
    display: flex;
    gap: 16px;
    margin-bottom: 22px;
    font-size: 30px;
    line-height: 1.45;
    color: var(--deck-muted, #9aa0aa);
  }
  .comparison-icon {
    flex-shrink: 0;
    font-weight: 700;
    color: var(--deck-accent, #6e7681);
  }
`;

function render(props) {
  const left = props.leftPoints
    .map(
      (point) => `<li class="comparison-item">
<span class="comparison-icon">✕</span>
<span>${point}</span>
</li>`
    )
    .join("");

  const right = props.rightPoints
    .map(
      (point) => `<li class="comparison-item">
<span class="comparison-icon">✓</span>
<span>${point}</span>
</li>`
    )
    .join("");

  return `<section class="comparison">
<h1>${props.title}</h1>
<div class="comparison-rule"></div>

<div class="comparison-grid">

<section class="comparison-card">
<h2>${props.leftTitle}</h2>
<ul class="comparison-list">
${left}
</ul>
</section>

<section class="comparison-card">
<h2>${props.rightTitle}</h2>
<ul class="comparison-list">
${right}
</ul>
</section>

</div>

</section>`;
}

const comparison = {
  name: "comparison",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default comparison;
