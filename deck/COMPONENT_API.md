# AIRDeck Component API — v1 (frozen)

This is the required standard for every AIRDeck component, current and
future. The conformance suite in `tests/deck-compile.test.mjs` enforces it
mechanically — a component that violates this document fails CI.

## Required exports

Every component file in `deck/components/` exports **exactly** this surface,
as a single default-exported object:

```js
const PROPS = { ... };            // declarative props contract
function validateProps(props) {}  // → array of error strings ([] = valid)
const css = ` ... `;              // static string, placed in <head>
function render(props) {}         // → component markup string only

const myComponent = {
  name: "mycomponent",            // lowercase, matches the registry key
  props: PROPS,
  validateProps,
  css,
  render,
};

export default myComponent;
```

Nothing more, nothing less. Helper imports (e.g. `./validators.js`) are
allowed; extra exports are not.

## Responsibilities

| Owner | Owns |
|---|---|
| **Component** | Layout, typography, spacing, HTML structure, its own CSS. |
| **Compiler** (`deck/compile.js`) | The document shell, the 1920×1080 canvas element, recursive prop **escaping**, theme-token injection, error aggregation, component/theme lookup. |
| **Theme** (`deck/themes/*`) | Presentation tokens only (colors, fonts) as pure data. No layout, no spacing, no logic. |
| **Schema** (`deck/schema.js`) | The deck language: what a structurally valid deck and prop value is. |

Responsibilities never move. A component must not: escape values, build the
document shell, read themes directly, know about other components, or perform
I/O of any kind.

## Prop validation rules

- `validateProps(props)` is pure: array of human-readable strings in, no
  exceptions, no side effects. Empty array means valid.
- Validation uses the shared helpers in `deck/components/validators.js` —
  do not hand-roll checks that a helper covers.
- Canonical error wording:
  - missing/empty required prop → `missing required prop "name"`
  - wrong container type → `prop "name" must be an array`
  - wrong element type → `prop "name[2]" must be a string`
  - wrong nested field → `prop "items[2].label" must be a string`
- **Every array or object prop that `render` iterates MUST be
  shape-validated.** Validation is what stands between malformed model
  output and a crash in render.
- Optional props are not validated beyond their use in render (render must
  tolerate their absence).
- No character limits in components — the schema bounds string leaves
  globally; layout handles long content (`max-width`, `overflow-wrap`).

## Rendering contract

- `render(props)` receives props **already recursively HTML-escaped** by the
  compiler (string leaves escaped; numbers/booleans original types; object
  keys untouched). Templates interpolate freely and never escape.
- `render` returns **component markup only** — no `<!DOCTYPE>`, no
  `<html>/<head>/<body>`, no `<style>` (CSS belongs in the `css` export).
- Markup must fill the canvas it is given (the compiler wraps it in a
  1920×1080, overflow-hidden element). All sizing assumes that canvas.
- `render` must never render object *keys* from props, only values —
  keys pass through escaping untouched. A component that intentionally
  renders keys must escape them itself.
- Deterministic: same props, same output. No randomness, dates, or state.

## CSS conventions

- One class namespace per component, prefixed by the component name
  (`.timeline`, `.timeline-item`, …). Definitions appear once (no duplicate
  selector blocks) and in DOM order.
- 2-space indentation, `property: value;`, spaced function args
  (`rgba(255, 255, 255, 0.04)`), spaced var fallbacks
  (`var(--deck-text, #f4f5f7)`), leading zeros (`0.02em`).
- Accent rules/dividers use `border-radius: 999px`.
- **Theme tokens** for every color and font: `--deck-bg`, `--deck-text`,
  `--deck-muted`, `--deck-accent`, `--deck-font-display`, `--deck-font-body`
  — always with the neutral fallbacks (`#101014`, `#f4f5f7`, `#9aa0aa`,
  `#6e7681`).
- Neutral translucent surfaces (`rgba(255, 255, 255, 0.03–0.08)`) are
  allowed — they are theme-agnostic by construction.
- A hardcoded color requires a comment explaining why it is intentionally
  not themed (e.g. the code editor surface, accent-contrast text pending an
  `--deck-accent-contrast` token).
- **Banned inside slides:** `backdrop-filter` (crashes mobile WebKit and
  breaks PPTX capture), external resources of any kind (fonts, images,
  scripts) — slides must stay self-contained.

## Registration

New components are registered by adding one import + one entry to
`COMPONENTS` in `deck/compile.js`, one `VALID_PROPS` fixture in the
conformance tests, and documentation in the generation prompt
(`buildDeckPrompt`) until prompt docs move alongside components.
