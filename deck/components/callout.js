// Callout — highlights an important fact, warning, takeaway or insight.
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
  title: { required: true, type: "string", description: "The headline of the takeaway." },
  body: { required: true, type: "string", description: "One or two sentences of supporting detail." },
  icon: { required: false, type: "string", description: "A short glyph or emoji shown above the title." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A single highlighted message given the full slide, with an optional icon.",
  bestFor: ["Key takeaways", "Warnings", "Surprising statistics", "Tips worth pausing on"],
  avoidFor: ["Multiple points", "Comparisons", "Tabular data"],
  keywords: ["callout", "highlight", "takeaway", "insight", "warning", "tip", "fact"],
};

const example = {
  title: "Did You Know?",
  body: "Every AIRDeck slide is standard HTML — you can open, edit and host it anywhere.",
  icon: "✦",
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredText(errors, props, "body");
  return errors;
}

const css = `
  .callout {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .callout-card {
    width: 1320px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px;
    border-radius: 34px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
    text-align: center;
  }
  .callout-card::before {
    content: "";
    width: 100%;
    height: 6px;
    margin-bottom: 48px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, var(--deck-accent, #6e7681), transparent);
    opacity: 0.65;
  }
  .callout-icon {
    width: 120px;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 58px;
    margin-bottom: 42px;
  }
  .callout-title {
    margin: 0;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 74px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
    overflow-wrap: break-word;
  }
  .callout-rule {
    width: 120px;
    height: 4px;
    border-radius: 999px;
    margin: 38px 0 46px;
    background: var(--deck-accent, #6e7681);
  }
  .callout-body {
    max-width: 1040px;
    margin: 0;
    font-size: 40px;
    line-height: 1.55;
    font-weight: 400;
    color: var(--deck-muted, #9aa0aa);
    overflow-wrap: break-word;
  }
`;

function render(props) {
  const icon =
    props.icon !== undefined && String(props.icon).trim() !== ""
      ? props.icon
      : "●";

  return `<section class="callout">

<div class="callout-card">

<div class="callout-icon">
${icon}
</div>

<h1 class="callout-title">
${props.title}
</h1>

<div class="callout-rule"></div>

<p class="callout-body">
${props.body}
</p>

</div>

</section>`;
}

const callout = {
  name: "callout",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default callout;
