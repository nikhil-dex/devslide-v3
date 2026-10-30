// Timeline — displays chronological events vertically.
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

import { requiredText, requiredObjectArray } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "What the timeline covers." },
  items: {
    required: true,
    type: "{ year, title, description }[]",
    description: "Ordered entries. Every field is a required non-empty string.",
  },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A horizontal sequence of dated milestones, each with a title and a short description.",
  bestFor: ["Company history", "Product roadmaps", "Evolution of a field", "Project phases"],
  avoidFor: ["Unordered processes", "Comparisons", "Pure metrics"],
  keywords: ["timeline", "history", "roadmap", "milestones", "chronology", "evolution", "phases"],
};

const example = {
  title: "Our Roadmap",
  items: [
    { year: "2024", title: "Deck Engine", description: "The compiler and slide language ship." },
    { year: "2025", title: "Theme System", description: "Ten hand-crafted design systems." },
    { year: "2026", title: "Community", description: "Publishing and shared components." },
  ],
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredObjectArray(errors, props, "items", ["year", "title", "description"]);
  return errors;
}

const css = `
  .timeline {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 90px 150px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .timeline h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 88px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .timeline-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 36px auto 72px;
    background: var(--deck-accent, #6e7681);
  }
  .timeline-list {
    position: relative;
    flex: 1;
    padding-left: 95px;
  }
  .timeline-list::before {
    content: "";
    position: absolute;
    left: 34px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
  }
  .timeline-item {
    position: relative;
    margin-bottom: 42px;
    margin-left: 28px;
    padding: 26px 34px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .timeline-dot {
    position: absolute;
    left: -51px;
    top: 34px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--deck-accent, #6e7681);
    border: 5px solid var(--deck-bg, #101014);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
  }
  /* TODO(theme): the year-chip tint below is a hardcoded alpha variant of the
     netflix accent (#c9161f). It should become a theme token (e.g.
     --deck-accent-soft) when the token vocabulary grows — components cannot
     derive translucent colors from an opaque token with CSS variables alone. */
  .timeline-year {
    display: inline-block;
    padding: 6px 16px;
    margin-bottom: 18px;
    border-radius: 999px;
    background: rgba(201, 22, 31, 0.14);
    border: 1px solid rgba(201, 22, 31, 0.25);
    color: var(--deck-accent, #6e7681);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .timeline-title {
    font-size: 40px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--deck-text, #f4f5f7);
  }
  .timeline-description {
    margin-top: 12px;
    max-width: 1100px;
    font-size: 28px;
    line-height: 1.6;
    color: var(--deck-muted, #9aa0aa);
  }
`;

function render(props) {
  const items = props.items
    .map(
      (item) => `
<div class="timeline-item">
  <div class="timeline-dot"></div>
  <div class="timeline-year">${item.year}</div>
  <div class="timeline-title">${item.title}</div>
  <div class="timeline-description">${item.description}</div>
</div>`
    )
    .join("");

  return `<section class="timeline">
<h1>${props.title}</h1>
<div class="timeline-rule"></div>

<div class="timeline-list">
${items}
</div>

</section>`;
}

const timeline = {
  name: "timeline",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default timeline;
