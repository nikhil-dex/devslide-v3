// Dashboard — displays key metrics as a grid of KPI cards.
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
  title: { required: true, type: "string", description: "What the metrics describe." },
  cards: {
    required: true,
    type: "{ label, value }[]",
    description: "Metric cards. `value` is the number, `label` names it.",
  },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A grid of metric cards, each pairing a large value with its label.",
  bestFor: ["KPIs", "Business statistics", "Financial summaries", "Benchmark results"],
  avoidFor: ["Narrative explanation", "Chronological data", "Long text"],
  keywords: ["dashboard", "metrics", "kpi", "stats", "numbers", "analytics", "performance"],
};

const example = {
  title: "Company Performance",
  cards: [
    { label: "Revenue", value: "$2.4M" },
    { label: "Users", value: "48K" },
    { label: "Growth", value: "+32%" },
    { label: "Retention", value: "91%" },
  ],
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredObjectArray(errors, props, "cards", ["label", "value"]);
  return errors;
}

const css = `
  .dashboard {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 90px 120px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .dashboard h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 88px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .dashboard-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 36px auto 72px;
    background: var(--deck-accent, #6e7681);
  }
  .dashboard-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 1fr;
    gap: 42px;
    align-content: stretch;
  }
 .dashboard-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 42px;
  border-radius: var(--deck-radius-lg, 26px);
  background: var(--deck-card-bg, rgba(255, 255, 255, 0.035));
  border: 1px solid var(--deck-card-border, rgba(255, 255, 255, 0.07));
 box-shadow: var(--deck-card-shadow, 0 20px 50px rgba(0, 0, 0, 0.25));
}
  .dashboard-card::before {
    content: "";
    display: block;
    width: 48px;
    height: 4px;
    border-radius: 999px;
    margin-bottom: 20px;
    background: var(--deck-accent, #6e7681);
  }
  .dashboard-label {
    margin-bottom: 18px;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--deck-muted, #9aa0aa);
  }
  .dashboard-value {
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 72px;
    font-weight: 700;
    line-height: 1.05;
    color: var(--deck-text, #f4f5f7);
    overflow-wrap: break-word;
  }
`;

function render(props) {
  const cards = props.cards
    .map(
      (card) => `
<section class="dashboard-card">
  <div class="dashboard-label">${card.label}</div>
  <div class="dashboard-value">${card.value}</div>
</section>`
    )
    .join("");

  return `<section class="dashboard">
<h1>${props.title}</h1>
<div class="dashboard-rule"></div>

<div class="dashboard-grid">
${cards}
</div>

</section>`;
}

const dashboard = {
  name: "dashboard",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default dashboard;
