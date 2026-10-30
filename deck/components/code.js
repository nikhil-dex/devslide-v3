// Code — displays source code, SQL, JSON, shell commands or configuration.
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

import { requiredText } from "./validators.js";

const PROPS = {
  title: { required: true, type: "string", description: "What the snippet demonstrates." },
  language: { required: true, type: "string", description: "Language label shown on the block, e.g. \"js\"." },
  code: { required: true, type: "string", description: "The source itself. Newlines are preserved." },
};

// Authoring metadata. Same shape as a theme's `ai` block so docs, tooling and
// prompts can read one uniform contract across both registries.
const ai = {
  summary: "A titled code panel with a language label and preserved formatting.",
  bestFor: ["Source code", "SQL queries", "Config files", "Shell commands", "API payloads"],
  avoidFor: ["Prose explanation", "Metrics", "Long files that will not fit one slide"],
  keywords: ["code", "snippet", "programming", "syntax", "api", "config", "shell", "query"],
};

const example = {
  title: "Compile a deck",
  language: "js",
  code: 'const result = compileDeck(source);\nif (result.valid) {\n  present(result.slides);\n}',
};

function validateProps(props) {
  const errors = [];
  requiredText(errors, props, "title");
  requiredText(errors, props, "language");
  requiredText(errors, props, "code");
  return errors;
}

const css = `
  .code {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 80px 100px;
    background: var(--deck-bg, #101014);
    font-family: var(--deck-font-body, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }
  .code h1 {
    margin: 0;
    text-align: center;
    font-family: var(--deck-font-display, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 82px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--deck-text, #f4f5f7);
  }
  .code-rule {
    width: 140px;
    height: 4px;
    border-radius: 999px;
    margin: 32px auto 50px;
    background: var(--deck-accent, #6e7681);
  }
  .code-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 26px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
    border-radius: 22px 22px 0 0;
  }
  /* #ffffff is intentional: contrast text on the accent chip. It should
     become a theme token (e.g. --deck-accent-contrast) when the token
     vocabulary grows. */
  .code-language {
    padding: 8px 18px;
    border-radius: 999px;
    background: var(--deck-accent, #6e7681);
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  /* The editor surface is intentionally NOT themed: #1e1e1e / #d4d4d4 are
     the familiar dark-editor colors, kept constant across themes so code
     always looks like code. */
  .code-body {
    flex: 1;
    overflow: auto;
    padding: 36px;
    background: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0 0 22px 22px;
  }
  .code-body pre {
    margin: 0;
    white-space: pre;
    font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
    font-size: 28px;
    line-height: 1.6;
    color: #d4d4d4;
  }
  .code-body code {
    font: inherit;
  }
`;

function render(props) {
  return `<section class="code">

<h1>${props.title}</h1>

<div class="code-rule"></div>

<div class="code-wrapper">

  <div class="code-header">
    <div class="code-language">${props.language}</div>
  </div>

  <div class="code-body">
<pre><code>${props.code}</code></pre>
  </div>

</div>

</section>`;
}

const code = {
  name: "code",
  props: PROPS,
  ai,
  example,
  validateProps,
  css,
  render,
};

export default code;
