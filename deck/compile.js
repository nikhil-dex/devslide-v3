// AIRDeck Compiler — turns a validated Deck Source into standalone HTML slides.
//
//   Deck JSON ──→ Compiler ──→ Component ──→ Standalone HTML
//
// Contract (frozen — parts change internals, never this):
//   compileDeck(source) → { valid: true,  errors: [],   slides: [html…] }
//                       | { valid: false, errors: […],  slides: [] }
//
// The compiler owns: the document shell, the 1920×1080 canvas element,
// prop escaping, and error aggregation. Components own their layout,
// structure and CSS. The compiler calls the same four members on any
// component — name, validateProps, css, render — and knows nothing else
// about them.
//
// Deterministic by construction: pure function of its input. No clock,
// no randomness, no environment, no I/O.
//
// Dependency-free: imports only the deck's own modules.

import { validateDeck } from "./schema.js";

import { getComponent } from "./components/index.js";
import { getTheme } from "./themes/index.js";

// Direct lookup maps — deliberately not registry systems. Resolution is
// generic: the compiler only ever looks up by the name the deck provides;
// no theme or component name appears in compiler logic.




// Explicit, ordered theme → CSS custom property mapping. Fixed order keeps
// output byte-deterministic; the explicit list documents the entire theme
// contract in one place. Themes are structured data (colors, typography,
// cards, radius, …) — flattening them onto the component-facing --deck-*
// variables is the compiler's job.
//
// Value shapes follow how components consume each variable:
//   • --deck-card-border is wrapped in `border: 1px solid var(…)` by
//     components, so it must be a color — never a border shorthand.
//   • --deck-card-bg and --deck-card-shadow are full background / box-shadow
//     values, so layered fills and shadow lists are fine.
//   • --deck-accent maps to colors.primary: the theme's brand color, which is
//     the legacy accent role. colors.accent is a secondary decorative hue.
const THEME_VARS = [
  // Core
  ["--deck-bg", (theme) => theme.colors?.background],
  ["--deck-surface", (theme) => theme.colors?.surface],
  ["--deck-surface-alt", (theme) => theme.colors?.surfaceElevated],

  ["--deck-text", (theme) => theme.colors?.textPrimary],
  ["--deck-muted", (theme) => theme.colors?.textMuted],
  ["--deck-accent", (theme) => theme.colors?.primary],
  ["--deck-accent-soft", (theme) => theme.colors?.primarySubtle],
  ["--deck-accent-contrast", (theme) => theme.colors?.primaryContrast],

  // Cards
  ["--deck-card-bg", (theme) => theme.cards?.base?.background],
  ["--deck-card-border", (theme) => theme.colors?.border],
  ["--deck-card-shadow", (theme) => theme.cards?.base?.boxShadow],

  // Typography
  ["--deck-font-display", (theme) => theme.typography?.display?.fontFamily],
  ["--deck-font-body", (theme) => theme.typography?.body?.fontFamily],
  ["--deck-font-mono", (theme) => theme.typography?.code?.fontFamily],

  // Code
  ["--deck-code-bg", (theme) => theme.colors?.surfaceSunken],
  ["--deck-code-text", (theme) => theme.colors?.textSecondary],
  ["--deck-code-border", (theme) => theme.colors?.borderSubtle],

  // Layout
  ["--deck-radius-sm", (theme) => theme.radius?.sm],
  ["--deck-radius-md", (theme) => theme.radius?.md],
  ["--deck-radius-lg", (theme) => theme.radius?.lg],
  ["--deck-divider", (theme) => theme.colors?.divider],
];

function themeToCss(theme) {
  const lines = THEME_VARS
    .map(([cssVar, pick]) => [cssVar, pick(theme)])
    .filter(([, value]) => value !== undefined)
    .map(([cssVar, value]) => `    ${cssVar}: ${value};`);
  return `  :root {\n${lines.join("\n")}\n  }\n`;
}

// Central escaping: AI- or user-supplied text can never inject markup.
// Components receive pre-escaped props and interpolate freely.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Recursively escape every string leaf while preserving the original JSON
// structure exactly. Object keys are structure, not rendered content — they
// pass through untouched (a component that intentionally renders keys must
// escape them itself). Numbers and booleans keep their original types.
// Exported for direct testing; not part of the public compile contract.
export function escapeDeep(value) {
  if (typeof value === "string") {
    return escapeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(escapeDeep);
  }
  if (typeof value === "object" && value !== null) {
    const out = {};
    for (const [key, inner] of Object.entries(value)) {
      out[key] = escapeDeep(inner);
    }
    return out;
  }
  // number | boolean — the schema guarantees nothing else reaches here.
  return value;
}

function compileSlide(component, slide, themeCss) {
  const markup = component.render(escapeDeep(slide.props));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AIRDeck Slide</title>
<style>
  html, body { margin: 0; padding: 0; }
  .deck-canvas {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
  }
${themeCss}${component.css}</style>
</head>
<body>
<main class="deck-canvas" data-component="${escapeHtml(component.name)}">
${markup}
</main>
</body>
</html>
`;
}

export function compileDeck(source) {
  const validation = validateDeck(source);
  if (!validation.valid) {
    return { valid: false, errors: validation.errors, slides: [] };
  }

  // An unknown theme is a deck-level failure: nothing can be styled
  // correctly, so fail immediately instead of aggregating slide errors.
const theme = getTheme(source.theme);
  if (!theme) {
    return { valid: false, errors: [`Unknown theme "${source.theme}"`], slides: [] };
  }
  const themeCss = themeToCss(theme);

  // Resolve components and collect ALL errors before compiling anything —
  // callers get the complete picture, never partial output.
  const errors = [];
  const resolved = source.slides.map((slide, i) => {
    const component = getComponent(slide.component);
    if (!component) {
      errors.push(`Slide ${i + 1}: unknown component "${slide.component}"`);
      return null;
    }
    for (const problem of component.validateProps(slide.props)) {
      errors.push(`Slide ${i + 1}: ${component.name}: ${problem}`);
    }
    return component;
  });
  if (errors.length > 0) {
    return { valid: false, errors, slides: [] };
  }

  return {
    valid: true,
    errors: [],
    slides: source.slides.map((slide, i) => compileSlide(resolved[i], slide, themeCss)),
  };
}
