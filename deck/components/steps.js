// Steps — displays a sequential workflow, process, lifecycle or pipeline.
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
// neutral fallback. Exceptions below are intentional and documented.

import { requiredText, requiredStringArray } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "What the process accomplishes." },
  steps: {
    required: true,
    type: "string[]",
    description: "Ordered actions, one per step. Must not be empty.",
  },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A numbered sequence of actions, rendered as connected steps.",
  bestFor: ["Workflows", "Pipelines", "Methodologies", "Setup instructions"],
  avoidFor: ["Dated milestones (use Timeline)", "Comparisons", "Unordered lists"],
  keywords: ["steps", "process", "workflow", "pipeline", "how-to", "sequence", "procedure"],
};

const example = {
  title: "How AIRDeck Works",
  steps: ["Write a prompt", "Generate deck source", "Validate slides", "Compile to HTML", "Present or export"],
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredStringArray(errors, props, "steps", { requireNonEmpty: true });
  return errors;
}

const css = `
  .steps {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 80px 120px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .steps h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 84px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .steps-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 34px auto 64px;
    background: var(--deck-accent, #6e7681);
  }
  .steps-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .step {
    display: flex;
    align-items: center;
  }
  .step + .step {
    margin-top: 36px;
  }
  /* #ffffff is intentional: contrast text on the accent circle. It should
     become a theme token (e.g. --deck-accent-contrast) when the token
     vocabulary grows. */
  .step-number {
    width: 74px;
    height: 74px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: var(--deck-accent, #6e7681);
    color: #ffffff;
    font-size: 34px;
    font-weight: 700;
  }
  .step-content {
    flex: 1;
    margin-left: 32px;
    padding: 24px 34px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .step-title {
    font-size: 38px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--deck-text, #f4f5f7);
  }
  .step-arrow {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .step-arrow::before {
    content: "";
    width: 4px;
    height: 40px;
    border-radius: 999px;
    background: var(--deck-accent, #6e7681);
  }
  .step-arrow::after {
    content: "▼";
    margin-top: 4px;
    color: var(--deck-accent, #6e7681);
    font-size: 18px;
  }
`;

function render(props) {
  const steps = props.steps
    .map((step, index) => {
      const arrow =
        index < props.steps.length - 1
          ? `<div class="step-arrow">↓</div>`
          : "";

      return `<div class="step">

<div class="step-number">${index + 1}</div>

<div class="step-content">
  <div class="step-title">${step}</div>
</div>

</div>

${arrow}`;
    })
    .join("\n");

  return `<section class="steps">

<h1>${props.title}</h1>

<div class="steps-rule"></div>

<div class="steps-list">

${steps}

</div>

</section>`;
}

const steps = {
  name: "steps",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default steps;
