// Proof for Phase 1 - Part 2: Deck JSON → Compiler → Standalone HTML.
// Pure unit tests — no server, no database, no AI.
//   npm run test:deck
import test from "node:test";
import assert from "node:assert/strict";
import { compileDeck, escapeDeep } from "../deck/compile.js";
import hero from "../deck/components/hero.js";
import comparison from "../deck/components/comparison.js";
import timeline from "../deck/components/timeline.js";
import dashboard from "../deck/components/dashboard.js";
import quote from "../deck/components/quote.js";
import codeComponent from "../deck/components/code.js";
import steps from "../deck/components/steps.js";
import table from "../deck/components/table.js";
import callout from "../deck/components/callout.js";
import image from "../deck/components/image.js";
import { getTheme } from "../deck/themes/index.js";

const theme = getTheme("linear");

const ALL_COMPONENTS = [
  hero, comparison, timeline, dashboard, quote,
  codeComponent, steps, table, callout, image,
];

// Minimal valid props for each component — used by conformance tests.
const VALID_PROPS = {
  hero: { title: "T" },
  comparison: {
    title: "T", leftTitle: "L", rightTitle: "R",
    leftPoints: ["a"], rightPoints: ["b"],
  },
  timeline: { title: "T", items: [{ year: "2020", title: "t", description: "d" }] },
  dashboard: { title: "T", cards: [{ label: "l", value: "v" }] },
  quote: { quote: "Q" },
  code: { title: "T", language: "js", code: "1;" },
  steps: { title: "T", steps: ["one"] },
  table: { title: "T", headers: ["h"], rows: [["c"]] },
  callout: { title: "T", body: "B" },
  image: { image: "https://example.com/x.png" },
};

const validDeck = () => ({
  version: 1,
  theme: "linear",
  slides: [
    {
      component: "Hero",
      props: { title: "Future of AI", subtitle: "The next generation" },
    },
  ],
});

// ── The pipeline works ──────────────────────────────────────────────

test("a valid deck compiles to one standalone HTML document", () => {
  const result = compileDeck(validDeck());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.slides.length, 1);

  const html = result.slides[0];
  assert.ok(html.startsWith("<!DOCTYPE html>"), "must start with doctype");
  assert.match(html, /<\/html>\s*$/, "must be a complete document");
  assert.ok(html.includes("<h1>Future of AI</h1>"), "title rendered");
  assert.ok(html.includes("<p>The next generation</p>"), "subtitle rendered");
});

test("the 1920x1080 slide contract is honored", () => {
  const html = compileDeck(validDeck()).slides[0];
  assert.ok(html.includes("width: 1920px"));
  assert.ok(html.includes("height: 1080px"));
  assert.ok(html.includes("overflow: hidden"));
});

test("every slide compiles independently", () => {
  const deck = validDeck();
  deck.slides.push({ component: "hero", props: { title: "Second slide" } });
  const result = compileDeck(deck);
  assert.equal(result.slides.length, 2);
  assert.ok(result.slides[0].includes("Future of AI"));
  assert.ok(!result.slides[0].includes("Second slide"));
  assert.ok(result.slides[1].includes("Second slide"));
  assert.ok(!result.slides[1].includes("Future of AI"));
});

test("subtitle is optional", () => {
  const deck = validDeck();
  deck.slides[0].props = { title: "Alone" };
  const html = compileDeck(deck).slides[0];
  assert.ok(html.includes("<h1>Alone</h1>"));
  assert.ok(!html.includes("<p>"), "no subtitle paragraph when absent");
});

test("unknown props are ignored for now", () => {
  const deck = validDeck();
  deck.slides[0].props.footnote = "should not appear";
  const html = compileDeck(deck).slides[0];
  assert.ok(!html.includes("should not appear"));
});

test("component name matching is case-insensitive", () => {
  for (const name of ["hero", "Hero", "HERO"]) {
    const deck = validDeck();
    deck.slides[0].component = name;
    assert.equal(compileDeck(deck).valid, true, `component "${name}" should compile`);
  }
});

// ── Safety ──────────────────────────────────────────────────────────

test("prop values are HTML-escaped", () => {
  const deck = validDeck();
  deck.slides[0].props.title = '<script>alert("x")</script>';
  const html = compileDeck(deck).slides[0];
  assert.ok(html.includes("&lt;script&gt;"), "markup must be escaped");
  assert.ok(!html.includes('<script>alert'), "raw markup must never pass through");
});

// ── Structured errors ───────────────────────────────────────────────

test("an invalid deck returns the schema's structured errors", () => {
  const result = compileDeck({ theme: "linear", slides: [] });
  assert.equal(result.valid, false);
  assert.deepEqual(result.slides, []);
  assert.ok(result.errors.includes("Missing version"));
  assert.ok(result.errors.includes("Slides must contain at least one slide"));
});

test("unknown components return structured compiler errors", () => {
  const deck = validDeck();
  deck.slides.push({ component: "Supernova", props: { title: "x" } });
  const result = compileDeck(deck);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['Slide 2: unknown component "Supernova"']);
  assert.deepEqual(result.slides, [], "no partial output on error");
});

// ── Determinism ─────────────────────────────────────────────────────

test("identical input produces byte-identical output", () => {
  const a = compileDeck(validDeck());
  const b = compileDeck(validDeck());
  assert.deepEqual(a, b);
  assert.equal(a.slides[0], b.slides[0]);
});

// ── Part 3: the real Hero component ─────────────────────────────────

test("hero renders its structure and CSS into the document", () => {
  const html = compileDeck(validDeck()).slides[0];
  assert.ok(html.includes('<section class="hero">'), "hero markup present");
  assert.ok(html.includes('data-component="hero"'), "canvas annotated");
  assert.ok(html.includes(".hero h1"), "hero CSS present in head");
  assert.ok(html.includes('<div class="hero-rule">'), "accent rule present");
});

test("hero is theme-ready: colors reference --deck-* tokens with fallbacks", () => {
  const html = compileDeck(validDeck()).slides[0];
  assert.ok(html.includes("var(--deck-bg"));
  assert.ok(html.includes("var(--deck-text"));
  assert.ok(html.includes("var(--deck-accent"));
});

test("missing title fails validation with a structured error", () => {
  const deck = validDeck();
  deck.slides[0].props = { subtitle: "orphaned" };
  const result = compileDeck(deck);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['Slide 1: hero: missing required prop "title"']);
  assert.deepEqual(result.slides, []);
});

test("blank title is treated as missing", () => {
  const deck = validDeck();
  deck.slides[0].props.title = "   ";
  const result = compileDeck(deck);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('Slide 1: hero: missing required prop "title"'));
});

test("no character limits: long titles compile and render", () => {
  const deck = validDeck();
  deck.slides[0].props.title = "Long ".repeat(240).trim(); // 1199 chars
  const result = compileDeck(deck);
  assert.equal(result.valid, true);
  assert.ok(result.slides[0].includes("Long Long"));
});

test("hero output escapes quotes and ampersands through the real render path", () => {
  const deck = validDeck();
  deck.slides[0].props.title = 'Tom & "Jerry"';
  const html = compileDeck(deck).slides[0];
  assert.ok(html.includes("Tom &amp; &quot;Jerry&quot;"));
  assert.ok(!html.includes('Tom & "Jerry"'));
});

test("prop errors and unknown-component errors aggregate across slides", () => {
  const deck = validDeck();
  deck.slides = [
    { component: "hero", props: {} },
    { component: "Supernova", props: { title: "x" } },
  ];
  const result = compileDeck(deck);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    'Slide 1: hero: missing required prop "title"',
    'Slide 2: unknown component "Supernova"',
  ]);
});

// ── Part 4: theme token integration ─────────────────────────────────

test("theme tokens are injected as a :root block before component CSS", () => {
  const html = compileDeck(validDeck()).slides[0];
  assert.ok(html.includes(":root {"), ":root block present");
  assert.ok(html.includes(`--deck-bg: ${theme.colors.background};`));
  assert.ok(html.includes(`--deck-text: ${theme.colors.textPrimary};`));
  assert.ok(html.includes(`--deck-muted: ${theme.colors.textMuted};`));
  assert.ok(html.includes(`--deck-accent: ${theme.colors.primary};`));
  assert.ok(html.includes(`--deck-font-display: ${theme.typography.display.fontFamily};`));
  assert.ok(html.includes(`--deck-font-body: ${theme.typography.body.fontFamily};`));
  assert.ok(
    html.indexOf(":root {") < html.indexOf(".hero {"),
    "tokens must be defined before component CSS consumes them"
  );
});

test("hero renders differently under the theme: tokens defined AND consumed", () => {
  const html = compileDeck(validDeck()).slides[0];
  // definition (theme) and consumption (component) meet in one document
  assert.ok(html.includes(`--deck-bg: ${theme.colors.background}`), "theme defines the token");
  assert.ok(html.includes("var(--deck-bg"), "hero consumes the token");
  assert.ok(html.includes("var(--deck-accent"), "hero consumes the accent");
});

test("hero source contains no theme literals — themes reach it only via variables", () => {
  for (const value of [theme.colors.background, theme.colors.textPrimary, theme.colors.textMuted, theme.colors.primary]) {
    assert.ok(
      !hero.css.includes(value),
      `hero.css must not hardcode theme value "${value}"`
    );
  }
  assert.ok(hero.css.includes("var(--deck-bg,"), "hero keeps its neutral fallbacks");
});

test("unknown theme is an immediate deck-level failure, not aggregated", () => {
  const deck = validDeck();
  deck.theme = "not-a-real-theme";
  // also break a slide — its error must NOT appear alongside the theme error
  deck.slides[0].props = {};
  const result = compileDeck(deck);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['Unknown theme "not-a-real-theme"']);
  assert.deepEqual(result.slides, []);
});

test("theme lookup is case-insensitive", () => {
  const deck = validDeck();
  deck.theme = "LINEAR";
  assert.equal(compileDeck(deck).valid, true);
});

test("themed output still satisfies the standalone HTML contract", () => {
  const html = compileDeck(validDeck()).slides[0];
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.match(html, /<\/html>\s*$/);
  assert.ok(html.includes("width: 1920px"));
  assert.ok(html.includes("height: 1080px"));
  assert.ok(html.includes("overflow: hidden"));
});

// ── Phase 3: recursive escaping for JSON-safe props ─────────────────

test("escapeDeep escapes string leaves inside arrays", () => {
  assert.deepEqual(
    escapeDeep(["<b>bold</b>", "safe"]),
    ["&lt;b&gt;bold&lt;/b&gt;", "safe"]
  );
});

test("escapeDeep escapes string leaves in nested objects at any depth", () => {
  assert.deepEqual(
    escapeDeep({ items: [{ label: '<img src=x onerror="1">', value: 3 }] }),
    { items: [{ label: "&lt;img src=x onerror=&quot;1&quot;&gt;", value: 3 }] }
  );
});

test("escapeDeep preserves numbers and booleans with their original types", () => {
  const out = escapeDeep({ count: 42, ratio: 0.5, on: true, off: false });
  assert.equal(out.count, 42);
  assert.equal(typeof out.count, "number");
  assert.equal(out.ratio, 0.5);
  assert.equal(out.on, true);
  assert.equal(typeof out.off, "boolean");
});

test("escapeDeep preserves structure exactly and never mutates its input", () => {
  const input = {
    title: "a & b",
    values: [1, 2, ["<x>"]],
    meta: { keys: { stay: "put" } },
  };
  const snapshot = JSON.parse(JSON.stringify(input));
  const out = escapeDeep(input);

  assert.deepEqual(input, snapshot, "input must not be mutated");
  assert.deepEqual(Object.keys(out), Object.keys(input), "top-level keys preserved");
  assert.deepEqual(out.values[1], 2);
  assert.deepEqual(out.values[2], ["&lt;x&gt;"]);
  assert.equal(out.meta.keys.stay, "put");
});

test("escapeDeep leaves object keys untouched — keys are structure, not content", () => {
  const out = escapeDeep({ '<weird key="x">': "value & value" });
  assert.deepEqual(Object.keys(out), ['<weird key="x">']);
  assert.equal(out['<weird key="x">'], "value &amp; value");
});

test("rich props flow through the full compile pipeline", () => {
  const deck = validDeck();
  deck.slides[0].props = {
    title: "Still a hero",
    items: [{ label: "<script>", value: 1 }],
    flags: [true, false],
  };
  const result = compileDeck(deck);
  assert.equal(result.valid, true, `expected valid, got: ${result.errors.join(" | ")}`);
  assert.ok(result.slides[0].includes("<h1>Still a hero</h1>"));
  assert.ok(!result.slides[0].includes("<script>"), "unknown rich props stay unrendered");
});

// ── Component API v1 conformance ────────────────────────────────────
// Every component — current and future — must satisfy exactly this
// contract. See deck/COMPONENT_API.md.

test("every component exposes the exact Component API v1 surface", () => {
  for (const component of ALL_COMPONENTS) {
    const label = component?.name || "unnamed";
    assert.equal(typeof component.name, "string", `${label}: name must be a string`);
    assert.equal(component.name, component.name.toLowerCase(), `${label}: name must be lowercase`);
    assert.ok(component.props && typeof component.props === "object", `${label}: props spec must be an object`);
    assert.equal(typeof component.validateProps, "function", `${label}: validateProps must be a function`);
    assert.equal(typeof component.css, "string", `${label}: css must be a static string`);
    assert.equal(typeof component.render, "function", `${label}: render must be a function`);
  }
});

test("every component validates its minimal valid props clean and renders markup", () => {
  for (const component of ALL_COMPONENTS) {
    const props = VALID_PROPS[component.name];
    assert.ok(props, `missing VALID_PROPS fixture for "${component.name}"`);
    assert.deepEqual(component.validateProps(props), [], `${component.name}: valid props must produce no errors`);
    const markup = component.render(props);
    assert.equal(typeof markup, "string", `${component.name}: render must return a string`);
    assert.ok(markup.trim().startsWith("<"), `${component.name}: render must return markup only`);
    assert.ok(!markup.includes("<!DOCTYPE"), `${component.name}: render must not build the document shell`);
  }
});

test("every component compiles a full deck end to end", () => {
  for (const component of ALL_COMPONENTS) {
    const deck = {
      version: 1,
      theme: "linear",
      slides: [{ component: component.name, props: VALID_PROPS[component.name] }],
    };
    const result = compileDeck(deck);
    assert.equal(result.valid, true, `${component.name}: ${result.errors.join(" | ")}`);
    const html = result.slides[0];
    assert.ok(html.startsWith("<!DOCTYPE html>"), `${component.name}: doctype`);
    assert.ok(html.includes("width: 1920px"), `${component.name}: canvas contract`);
    assert.ok(html.includes(`--deck-bg: ${theme.colors.background}`), `${component.name}: theme tokens injected`);
    assert.ok(html.includes(`data-component="${component.name}"`), `${component.name}: canvas annotation`);
  }
});

test("missing required props produce structured errors for every component", () => {
  for (const component of ALL_COMPONENTS) {
    const errors = component.validateProps({});
    assert.ok(errors.length > 0, `${component.name}: empty props must fail validation`);
    for (const message of errors) {
      assert.equal(typeof message, "string", `${component.name}: errors must be strings`);
    }
  }
});

test("no component CSS contains backdrop-filter (mobile/PPTX export hazard)", () => {
  for (const component of ALL_COMPONENTS) {
    assert.ok(
      !component.css.includes("backdrop-filter"),
      `${component.name}: backdrop-filter is banned inside slides`
    );
  }
});

test("no component defines its root class twice (duplicate CSS regression pin)", () => {
  for (const component of ALL_COMPONENTS) {
    const rootClass = component.render(VALID_PROPS[component.name]).match(/class="([^" ]+)/)?.[1];
    assert.ok(rootClass, `${component.name}: root class detectable`);
    const occurrences = component.css.split(`.${rootClass} {`).length - 1;
    assert.ok(occurrences <= 1, `${component.name}: ".${rootClass}" defined ${occurrences} times`);
  }
});

// ── Validation bug-fix pins (steps/table crashed on malformed arrays) ──

test("steps rejects a non-array steps prop instead of crashing", () => {
  assert.deepEqual(steps.validateProps({ title: "T", steps: 42 }), [
    'prop "steps" must be an array',
  ]);
  assert.deepEqual(steps.validateProps({ title: "T", steps: [] }), [
    'missing required prop "steps"',
  ]);
  assert.deepEqual(steps.validateProps({ title: "T", steps: ["ok", 7] }), [
    'prop "steps[1]" must be a string',
  ]);
});

test("table rejects malformed headers and rows instead of crashing", () => {
  assert.deepEqual(table.validateProps({ title: "T", headers: "nope", rows: [["a"]] }), [
    'prop "headers" must be an array',
  ]);
  assert.deepEqual(table.validateProps({ title: "T", headers: ["h"], rows: ["not-a-row"] }), [
    'prop "rows[0]" must be an array',
  ]);
  assert.deepEqual(table.validateProps({ title: "T", headers: ["h"], rows: [["a", 5]] }), [
    'prop "rows[0][1]" must be a string',
  ]);
});
