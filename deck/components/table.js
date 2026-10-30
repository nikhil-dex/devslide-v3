// Table — displays structured tabular data.
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

import { requiredText, requiredStringArray, requiredRowsArray } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "What the table shows." },
  headers: { required: true, type: "string[]", description: "Column headings. Must not be empty." },
  rows: {
    required: true,
    type: "string[][]",
    description: "One array per row, with a cell for each header.",
  },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A titled data table with a header row and string cells.",
  bestFor: ["Feature matrices", "Pricing tiers", "Benchmarks", "Structured datasets"],
  avoidFor: ["Two-way narrative comparisons (use Comparison)", "Single metrics", "Long prose in cells"],
  keywords: ["table", "matrix", "grid", "dataset", "pricing", "benchmark", "rows", "columns"],
};

const example = {
  title: "Model Comparison",
  headers: ["Model", "Accuracy", "Speed"],
  rows: [
    ["Random Forest", "96%", "Fast"],
    ["SVM", "94%", "Medium"],
    ["Neural Network", "98%", "Slow"],
  ],
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredStringArray(errors, props, "headers", { requireNonEmpty: true });
  requiredRowsArray(errors, props, "rows", { requireNonEmpty: true });
  return errors;
}

const css = `
  .table-slide {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 80px 100px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .table-slide h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 82px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .table-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 34px auto 56px;
    background: var(--deck-accent, #6e7681);
  }
  .table-wrapper {
    flex: 1;
    overflow: auto;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .deck-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .deck-table thead {
    background: rgba(255, 255, 255, 0.08);
  }
  .deck-table th {
    padding: 22px 20px;
    text-align: left;
    font-size: 30px;
    font-weight: 700;
    color: var(--deck-text, #f4f5f7);
    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  }
  .deck-table td {
    padding: 20px;
    font-size: 28px;
    line-height: 1.45;
    color: var(--deck-muted, #9aa0aa);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    overflow-wrap: break-word;
  }
  .deck-table tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.025);
  }
  .deck-table tbody tr:last-child td {
    border-bottom: none;
  }
`;

function render(props) {
  const headers = props.headers
    .map((header) => `<th>${header}</th>`)
    .join("");

  const rows = props.rows
    .map((row) => {
      const cells = row
        .map((cell) => `<td>${cell}</td>`)
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("\n");

  return `<section class="table-slide">

<h1>${props.title}</h1>

<div class="table-rule"></div>

<div class="table-wrapper">

<table class="deck-table">

<thead>
<tr>
${headers}
</tr>
</thead>

<tbody>
${rows}
</tbody>

</table>

</div>

</section>`;
}

const table = {
  name: "table",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default table;
