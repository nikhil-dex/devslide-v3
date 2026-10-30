// Proof for Phase 1 - Part 1: AIRDeck understands what a valid deck looks like.
// Pure unit tests — no server, no database, no AI.
//   npm run test:deck
import test from "node:test";
import assert from "node:assert/strict";
import { validateDeck, DECK_VERSION, MAX_SLIDES, MAX_PROP_LENGTH, MAX_PROP_DEPTH } from "../deck/schema.js";

const validDeck = () => ({
  version: DECK_VERSION,
  theme: "netflix",
  slides: [
    {
      component: "Hero",
      props: { title: "AIRDeck", subtitle: "Presentations as code" },
    },
  ],
});

// ── Valid decks ─────────────────────────────────────────────────────

test("a well-formed deck is valid with no errors", () => {
  const result = validateDeck(validDeck());
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("multiple slides and optional props are valid", () => {
  const deck = validDeck();
  deck.slides.push({ component: "Hero", props: { title: "Second" } });
  assert.equal(validateDeck(deck).valid, true);
});

// ── Top-level shape ─────────────────────────────────────────────────

test("non-object sources are rejected", () => {
  for (const bad of [null, undefined, "deck", 42, []]) {
    const result = validateDeck(bad);
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, ["Deck source must be a JSON object."]);
  }
});

test("missing version is reported", () => {
  const deck = validDeck();
  delete deck.version;
  const result = validateDeck(deck);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Missing version"));
});

test("wrong version is reported", () => {
  const deck = validDeck();
  deck.version = 2;
  const result = validateDeck(deck);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(`Unsupported version: expected ${DECK_VERSION}`));
});

test("missing or empty theme is reported", () => {
  const noTheme = validDeck();
  delete noTheme.theme;
  assert.ok(validateDeck(noTheme).errors.includes("Missing theme"));

  const emptyTheme = validDeck();
  emptyTheme.theme = "   ";
  assert.ok(validateDeck(emptyTheme).errors.includes("Theme must be a non-empty string"));
});

// ── Slides ──────────────────────────────────────────────────────────

test("slides must exist, be an array, and be non-empty", () => {
  const missing = validDeck();
  delete missing.slides;
  assert.ok(validateDeck(missing).errors.includes("Missing slides"));

  const notArray = validDeck();
  notArray.slides = {};
  assert.ok(validateDeck(notArray).errors.includes("Slides must be an array"));

  const empty = validDeck();
  empty.slides = [];
  assert.ok(validateDeck(empty).errors.includes("Slides must contain at least one slide"));
});

test("too many slides is rejected", () => {
  const deck = validDeck();
  deck.slides = Array.from({ length: MAX_SLIDES + 1 }, () => ({
    component: "Hero",
    props: { title: "x" },
  }));
  assert.ok(
    validateDeck(deck).errors.includes(`Slides must contain at most ${MAX_SLIDES} slides`)
  );
});

test("slide errors are indexed and specific", () => {
  const deck = validDeck();
  deck.slides = [
    { component: "Hero", props: { title: "fine" } },
    { props: { title: "no component" } },
    { component: "", props: {} },
    { component: "Hero" },
    "not an object",
  ];
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.includes("Slide 2: missing component"));
  assert.ok(errors.includes("Slide 3: component must be a non-empty string"));
  assert.ok(errors.includes("Slide 4: missing props"));
  assert.ok(errors.includes("Slide 5: must be an object"));
});

// Phase 3: the deck language accepts recursive JSON-safe prop values —
// string, finite number, boolean, arrays and plain objects of the same.
// (This revises the earlier v1 rule that all prop values must be strings.)
test("prop values may be any JSON-safe value, recursively", () => {
  const deck = validDeck();
  deck.slides[0].props = {
    title: "Q3 Numbers",
    count: 42,
    highlighted: true,
    values: [30, 45.5, 62],
    items: [
      { label: "Revenue", value: 12, tags: ["a", "b"] },
      { label: "Costs", value: 7 },
    ],
    meta: { nested: { deeper: "fine" } },
  };
  assert.deepEqual(validateDeck(deck), { valid: true, errors: [] });
});

test("string leaves respect the size bound at any depth", () => {
  const topLevel = validDeck();
  topLevel.slides[0].props.title = "x".repeat(MAX_PROP_LENGTH + 1);
  assert.ok(
    validateDeck(topLevel).errors.includes(
      `Slide 1: prop "title" exceeds ${MAX_PROP_LENGTH} characters`
    )
  );

  const nested = validDeck();
  nested.slides[0].props.items = [{ label: "ok" }, { label: "x".repeat(MAX_PROP_LENGTH + 1) }];
  assert.ok(
    validateDeck(nested).errors.includes(
      `Slide 1: prop "items[1].label" exceeds ${MAX_PROP_LENGTH} characters`
    )
  );
});

test("null and other non-JSON values are rejected with path-addressed errors", () => {
  const withNull = validDeck();
  withNull.slides[0].props.extra = null;
  assert.ok(
    validateDeck(withNull).errors.includes(
      'Slide 1: prop "extra" must be a string, number, boolean, array or object'
    )
  );

  const withDate = validDeck();
  withDate.slides[0].props.when = new Date(0);
  assert.ok(
    validateDeck(withDate).errors.includes(
      'Slide 1: prop "when" must be a string, number, boolean, array or object'
    )
  );

  const withFn = validDeck();
  withFn.slides[0].props.run = () => {};
  assert.ok(
    validateDeck(withFn).errors.includes(
      'Slide 1: prop "run" must be a string, number, boolean, array or object'
    )
  );

  const deepNull = validDeck();
  deepNull.slides[0].props.items = [{ label: "ok" }, { label: null }];
  assert.ok(
    validateDeck(deepNull).errors.includes(
      'Slide 1: prop "items[1].label" must be a string, number, boolean, array or object'
    )
  );
});

test("non-finite numbers are rejected", () => {
  const deck = validDeck();
  deck.slides[0].props.values = [1, Infinity];
  assert.ok(
    validateDeck(deck).errors.includes('Slide 1: prop "values[1]" must be a finite number')
  );
});

test("nesting beyond MAX_PROP_DEPTH is rejected", () => {
  let value = "leaf";
  for (let i = 0; i < MAX_PROP_DEPTH; i++) {
    value = { next: value };
  }
  const deck = validDeck();
  deck.slides[0].props.deep = value; // leaf sits at depth MAX_PROP_DEPTH + 1
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(
    errors.some((e) =>
      e.includes(`exceeds maximum nesting depth of ${MAX_PROP_DEPTH}`)
    ),
    `expected a depth error, got: ${errors.join(" | ")}`
  );
});

test("multiple problems are all reported at once", () => {
  const result = validateDeck({ theme: 7, slides: "nope" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 3); // version, theme, slides
});
