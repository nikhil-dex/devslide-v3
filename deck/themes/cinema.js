/**
 * AIRDeck Theme — "Cinema"
 * =============================================================================
 * A premium cinematic storytelling theme. Original design language inspired by
 * luxury one-sheet posters, festival programmes, IMAX title cards and the quiet
 * confidence of a well-cut trailer. Tokens only: no DOM, no components, no
 * animations. It copies no existing product's branding, layout or identity.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ. The compiler can swap Cinema for Linear
 * without a single code change.
 *
 * Design philosophy
 * -----------------
 *   • Black is the stage, not the background. Everything else is lit onto it.
 *   • One dramatic gesture per slide: a spotlight, a crimson rule, a gold word.
 *     Two gestures on one slide read as decoration, and decoration reads cheap.
 *   • Crimson is emotional emphasis. Gold is honour and hierarchy. They never
 *     appear at full strength in the same element.
 *   • Type is the set design. Huge titles, wide-tracked labels, generous
 *     leading — the deck should look composed even with the words removed.
 *   • Depth comes from large, diffused shadow and a very slight warmth in the
 *     darks. Nothing is glossy, nothing is frosted, nothing glows.
 *   • Motion is opacity-first and slow enough to feel deliberate: 180–300ms.
 *
 * Reading order for a slide built in this theme
 * ---------------------------------------------
 *   eyebrow (wide-tracked, muted)  →  display title  →  subtitle  →  story copy
 *
 * Extending
 * ---------
 *   import cinema from './themes/cinema.js';
 *   const cinemaNoir = cinema.utilities.extend({
 *     colors: { primary: '#6f7c86', textLink: '#c9d1d8' },
 *   });
 *
 * @module themes/cinema
 */

/* ============================================================================
 * 0. INTERNAL HELPERS
 *
 * Design intent
 *   Private plumbing shared by every AIRDeck theme. These are deliberately
 *   identical across themes so a theme file can be diffed against Linear and
 *   show only token changes.
 *
 * When to use
 *   `withAlpha` is re-exported through `utilities` for slide authors who need a
 *   one-off tint of a palette color. `deepFreeze` and `mergeTokens` are
 *   internal — consumers reach them through `utilities.extend`.
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 *
 * Used throughout this file to derive low-alpha tints (crimson glows, gold
 * rules, status washes) from a single source hex, so re-skinning the theme
 * means editing one palette entry rather than a dozen rgba() literals.
 *
 * @param {string} hex   e.g. '#b22222'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(178, 34, 34, 0.5)'
 */
function withAlpha(hex, alpha = 1) {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Recursively freeze an object so themes can't be mutated at runtime.
 *
 * A deck that mutates a shared theme object corrupts every later slide in the
 * same process. Freezing turns that class of bug into an immediate error.
 *
 * @param {object} obj
 * @returns {object} the same object, frozen through every nested level
 */
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const value = obj[key];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

/**
 * Shallow-merge one level deep — enough for token override maps.
 *
 * Deliberately not a deep merge: token groups are flat maps, and a deep merge
 * would silently splice partial `from`/`to` motion objects together, producing
 * animations nobody wrote.
 *
 * @param {object} base
 * @param {object} [patch]
 * @returns {object} a new object; neither argument is mutated
 */
function mergeTokens(base, patch = {}) {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = base[key];
    const mergeable =
      value && typeof value === 'object' && !Array.isArray(value) &&
      current && typeof current === 'object' && !Array.isArray(current);
    out[key] = mergeable ? { ...current, ...value } : value;
  }
  return out;
}

/* ============================================================================
 * 1. PALETTE (private primitives)
 *
 * Design intent
 *   The raw film stock. Four families only: warm darks, ivory lights, one
 *   crimson, one gold — plus a slate grey that carries anything neutral so the
 *   accents never get spent on ordinary UI.
 *
 *   The darks carry a trace of warmth (#0d0c0b rather than #0d0d0d). On a
 *   projector this reads as film black rather than screen black, and it keeps
 *   crimson and gold from looking pasted on.
 *
 * When to use
 *   Never referenced from slide code. Everything goes through the semantic
 *   `colors` map below, so the theme can be re-skinned in one place.
 *
 * Contribution
 *   A short palette is what makes the deck feel expensive: with only two
 *   accents available, every colored element has to earn its place.
 * ========================================================================= */

const palette = {
  // ---- Darks: the stage --------------------------------------------------
  /** Deepest value in the theme. Letterbox bars, full-bleed fades. */
  pitch: '#040404',
  /** Default canvas — near black with a trace of warmth. */
  black: '#080808',
  /** Warm black: title cards and the low end of vertical washes. */
  warmBlack: '#0d0c0b',
  /** Graphite: the standard card and panel fill. */
  graphite: '#111111',
  /** Raised graphite: elevated cards, panel headers. */
  graphiteAlt: '#1a1a1a',
  /** Hover and pressed states on dark surfaces. */
  graphiteRaised: '#232323',

  // ---- Lights: the projection --------------------------------------------
  /** Pure white — reserved for display titles and headline numbers. */
  white: '#ffffff',
  /** Warm ivory — light-scheme page and matte paper surfaces. */
  ivory: '#f4f1ea',
  /** Body copy on dark. */
  bone: '#eaeaea',
  /** Secondary copy, subtitles, sustained reading on dark. */
  ash: '#b5b5b5',

  // ---- Slate: everything neutral ----------------------------------------
  slate400: '#8a8a8f',
  slate500: '#6f7278',
  slate600: '#54575c',
  slate700: '#3a3c40',

  // ---- Crimson: emotional emphasis --------------------------------------
  crimson300: '#d96b6b',
  crimson400: '#c02a2a',
  /** The theme's primary accent. Deep, never bright. */
  crimson500: '#b22222',
  crimson600: '#8e1b1b',
  crimson700: '#6b1414',

  // ---- Gold: honour and hierarchy ---------------------------------------
  gold300: '#e6d08a',
  /** Muted gold — rules, laurels, award marks, links. */
  gold400: '#d4af37',
  gold500: '#c9a227',
  gold600: '#9c7c1c',

  // ---- Supporting hues: kept desaturated so they read as film grades -----
  sage500: '#6f9c74',
  clay500: '#b4453c',
  amber500: '#c99a3f',
  steel500: '#7d8fa3',
  plum500: '#8b7a92',
};

/* ============================================================================
 * 2. COLORS (semantic)
 *
 * Design intent
 *   The semantic layer every slide reads from. Surfaces step up in small,
 *   even increments (#080808 → #111111 → #1a1a1a) so a stack of panels reads
 *   as lighting rather than as boxes.
 *
 * When to use
 *   Always. Slide code should never see a palette primitive or a raw hex.
 *
 * Contribution
 *   Restricting slides to these names is what keeps a 60-slide deck coherent:
 *   there is exactly one crimson, one gold, and three levels of dark.
 * ========================================================================= */

const colors = {
  // ---- Canvas & surfaces -------------------------------------------------
  /** Default slide canvas. */
  background: palette.black,
  /** Letterbox bands, full-bleed fades, the darkest region of a wash. */
  backgroundSubtle: palette.pitch,
  /** Standard card, panel and title-card fill. */
  surface: palette.graphite,
  /** Elevated card, panel header, the top layer of a stack. */
  surfaceElevated: palette.graphiteAlt,
  /** Inset regions: code, table bodies, quoted stills. */
  surfaceSunken: palette.pitch,
  /** Hover fill on interactive surfaces. */
  surfaceHover: palette.graphiteRaised,
  /** Modal and lightbox backdrop. */
  overlay: 'rgba(4, 4, 4, 0.82)',

  // ---- Brand: crimson ----------------------------------------------------
  /** Primary accent. One crimson element per slide. */
  primary: palette.crimson500,
  primaryHover: palette.crimson400,
  primaryActive: palette.crimson600,
  /** Wash behind a pull quote or a marked chapter. */
  primarySubtle: withAlpha(palette.crimson500, 0.13),
  primaryContrast: palette.white,

  /** Neutral action surface — dark, never colored. */
  secondary: palette.graphiteAlt,
  secondaryHover: palette.graphiteRaised,
  secondaryContrast: palette.bone,

  /** Secondary accent: muted gold. Rules, laurels, credits, links. */
  accent: palette.gold400,
  accentSubtle: withAlpha(palette.gold400, 0.12),

  // ---- Status: graded, never signage -------------------------------------
  success: palette.sage500,
  successSubtle: withAlpha(palette.sage500, 0.12),
  warning: palette.amber500,
  warningSubtle: withAlpha(palette.amber500, 0.12),
  /** Distinct from `primary` so an error never reads as brand emphasis. */
  danger: palette.clay500,
  dangerSubtle: withAlpha(palette.clay500, 0.12),
  info: palette.steel500,
  infoSubtle: withAlpha(palette.steel500, 0.12),

  // ---- Text --------------------------------------------------------------
  /** Display titles and headline figures only. */
  textPrimary: palette.white,
  /** Body copy — one step down from white so titles stay dominant. */
  textSecondary: palette.bone,
  /** Subtitles, captions, credits, sustained reading. */
  textMuted: palette.ash,
  textDisabled: palette.slate500,
  textInverse: palette.black,
  /** Links carry gold, not crimson: crimson is reserved for emphasis. */
  textLink: palette.gold400,
  textOnPrimary: palette.white,

  // ---- Lines: mostly invisible, occasionally gold or crimson -------------
  border: 'rgba(234, 234, 234, 0.07)',
  borderStrong: 'rgba(234, 234, 234, 0.14)',
  borderSubtle: 'rgba(234, 234, 234, 0.04)',
  borderFocus: withAlpha(palette.gold400, 0.6),
  divider: 'rgba(234, 234, 234, 0.06)',

  /**
   * Series colors — graded like a color-timed film rather than a chart
   * library. Crimson leads, gold follows, then steel, sage, clay, plum. Any
   * two adjacent entries stay distinguishable in greyscale.
   */
  chart: [
    palette.crimson500,
    palette.gold400,
    palette.steel500,
    palette.sage500,
    palette.clay500,
    palette.plum500,
  ],
};

/**
 * Light scheme — "festival programme".
 *
 * Design intent
 *   Warm ivory paper, near-black ink, the same crimson and gold darkened until
 *   they hold on a light ground. This is the printed companion to the dark
 *   deck: handouts, one-pagers, a slide shown in a bright room.
 *
 * When to use
 *   Section handouts, appendix slides, or a whole deck flipped for a daylight
 *   venue. Not the default: this theme is written for a darkened room.
 *
 * Contribution
 *   Keeping identical token names means a slide flips schemes without any
 *   authoring change — the story reads the same on paper as on screen.
 */
const lightColors = mergeTokens(colors, {
  background: palette.ivory,
  backgroundSubtle: '#ece8df',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceSunken: '#ece8df',
  surfaceHover: '#e4dfd4',
  overlay: 'rgba(13, 12, 11, 0.55)',

  primary: palette.crimson600,
  primaryHover: palette.crimson500,
  primaryActive: palette.crimson700,
  primarySubtle: withAlpha(palette.crimson600, 0.09),
  primaryContrast: '#ffffff',

  secondary: '#ece8df',
  secondaryHover: '#e4dfd4',
  secondaryContrast: palette.warmBlack,

  accent: palette.gold600,
  accentSubtle: withAlpha(palette.gold600, 0.12),

  success: '#4d7a52',
  successSubtle: withAlpha('#4d7a52', 0.11),
  warning: '#9a7420',
  warningSubtle: withAlpha('#9a7420', 0.11),
  danger: '#93332b',
  dangerSubtle: withAlpha('#93332b', 0.10),
  info: '#526b80',
  infoSubtle: withAlpha('#526b80', 0.11),

  textPrimary: palette.warmBlack,
  textSecondary: '#2e2c2a',
  textMuted: palette.slate500,
  textDisabled: palette.slate400,
  textInverse: palette.ivory,
  textLink: palette.crimson600,
  textOnPrimary: '#ffffff',

  border: 'rgba(13, 12, 11, 0.11)',
  borderStrong: 'rgba(13, 12, 11, 0.20)',
  borderSubtle: 'rgba(13, 12, 11, 0.06)',
  borderFocus: withAlpha(palette.gold600, 0.5),
  divider: 'rgba(13, 12, 11, 0.09)',

  chart: [
    palette.crimson600,
    palette.gold600,
    '#526b80',
    '#4d7a52',
    '#93332b',
    '#6d5f74',
  ],
});

/* ============================================================================
 * 3. TYPOGRAPHY
 *
 * Design intent
 *   The type is the set design. A cinematic slide is a title card: one huge
 *   line, a quiet subtitle beneath it, and air around both. Display sizes run
 *   far past normal presentation scale on purpose — at 128px a title stops
 *   being a heading and becomes an image.
 *
 *   `eyebrow` carries very wide tracking (0.26em). That single detail does more
 *   cinematic work than any gradient in this file: wide-tracked small caps read
 *   as a festival card, a chapter marker, a credit.
 *
 * When to use
 *   display → title slide, chapter opener, closing card, one headline figure
 *   heading → section titles
 *   title   → slide titles and card headings
 *   body    → story copy and bullets
 *   caption → credits, captions, sources, footnotes
 *   code    → the rare technical slide; monospace never carries prose here
 *   eyebrow → the label above a display title
 *
 * Contribution
 *   The large jump from `display` to `heading` to `title` is what produces the
 *   "movie title → subtitle → story" reading order the theme is built around.
 *   Sizes are set for a 1920×1080 canvas; use `utilities.scaleType(factor)`
 *   for anything else.
 * ========================================================================= */

const fontStacks = {
  /**
   * System sans throughout. A cinematic feel here comes from size, tracking
   * and spacing rather than from a licensed display face — and system stacks
   * render identically on a venue laptop that has no fonts installed.
   */
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, ' +
    'Roboto, Arial, "Noto Sans", sans-serif',
  /** Code and technical readouts only — never body copy. */
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

const typography = {
  fontFamily: fontStacks,

  /**
   * Weight ladder. This theme lives in the 400–600 range: at display sizes,
   * 700 turns elegant into loud. `bold` exists for parity and for the rare
   * single word that needs to shout.
   */
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /** The title card. One line, centred or hard-left, nothing else on screen. */
  display: {
    fontFamily: fontStacks.sans,
    fontSize: '128px',
    fontWeight: 600,
    letterSpacing: '-0.022em',
    lineHeight: 1.02,
  },

  /** Section openers: Act One, The Problem, What Changed. */
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '68px',
    fontWeight: 500,
    letterSpacing: '-0.016em',
    lineHeight: 1.14,
  },

  /** Slide titles, card headings, the subtitle under a display line. */
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '32px',
    fontWeight: 500,
    letterSpacing: '-0.006em',
    lineHeight: 1.34,
  },

  /** Story copy. Generous leading — this deck is read slowly, out loud. */
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.76,
  },

  /** Credits, captions, sources, date lines. */
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '0.012em',
    lineHeight: 1.55,
  },

  /** Technical slides only. */
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.68,
  },

  /**
   * The label above a display title. Wide tracking, small size, muted or gold.
   * This is the theme's signature typographic move — use it once per slide.
   */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.26em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
};

/* ============================================================================
 * 4. SPACING — strict 8pt scale (4px half-step allowed for optical fixes)
 *
 * Design intent
 *   Oversized by the standards of every other AIRDeck theme. A 144px slide
 *   margin leaves a title floating in black, which is the entire effect this
 *   theme is chasing. Numeric steps stay on the shared 8pt grid so mixed-theme
 *   layouts don't drift.
 *
 * When to use
 *   Named aliases for authoring (`md`, `lg`, `xl`); numeric steps when the
 *   compiler needs arithmetic. `slidePadding` is the outer frame of every
 *   slide and should not be overridden per-slide — the constant margin is what
 *   makes a sequence of slides feel cut rather than assembled.
 *
 * Contribution
 *   Whitespace is the most expensive material in this theme. Nothing else
 *   communicates "premium" as immediately as refusing to fill the frame.
 * ========================================================================= */

const spacing = {
  0: '0px',
  0.5: '4px',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  8: '64px',
  10: '80px',
  12: '96px',
  16: '128px',
  20: '160px',

  // Named aliases for readability in slide specs.
  xs: '8px',
  sm: '16px',
  md: '32px',
  lg: '56px',
  xl: '88px',
  '2xl': '136px',

  /** The frame. Every slide sits inside this margin. */
  slidePadding: '144px',
  /** Between a section title and the content it introduces. */
  sectionGap: '96px',
  /** Between stacked blocks within a section. */
  stackGap: '28px',
  /** Between inline elements: an icon and its label, a rule and its caption. */
  inlineGap: '12px',
};

/* ============================================================================
 * 5. RADIUS
 *
 * Design intent
 *   Nearly square. A film title card, a matte print and a festival programme
 *   all have hard corners; rounding them is the single fastest way to make a
 *   cinematic slide look like an app screen.
 *
 * When to use
 *   md for controls, lg for cards and media frames, xl only for a full-bleed
 *   feature panel. `pill` exists for parity and for laurel-style badges.
 *
 * Contribution
 *   Squared corners plus large soft shadow is what produces the "print resting
 *   on black" impression the surfaces are built around.
 * ========================================================================= */

const radius = {
  xs: '2px',
  sm: '3px',
  md: '4px',
  lg: '6px',
  xl: '10px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. SHADOWS
 *
 * Design intent
 *   Large, soft, diffused — a print lit from above in a dark room, not a UI
 *   element on a page. Every shadow is wider and softer than its equivalent in
 *   the other AIRDeck themes, and none has a hard first stop.
 *
 * When to use
 *   sm  → media frames and small cards that shouldn't detach from the canvas
 *   md  → standard cards
 *   lg  → elevated cards, the featured panel on a slide
 *   xl  → a single hero panel or full-bleed still, once per deck if possible
 *   glow → a very soft crimson spill; reserved for one chapter card
 *
 * Contribution
 *   Because borders here are almost invisible, shadow is doing all the work of
 *   separating a surface from the stage. Softness is what keeps that separation
 *   from reading as a drop-shadowed box.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 4px 16px rgba(0, 0, 0, 0.45)',
  md: '0 12px 36px rgba(0, 0, 0, 0.50), 0 2px 8px rgba(0, 0, 0, 0.32)',
  lg: '0 28px 72px rgba(0, 0, 0, 0.55), 0 6px 18px rgba(0, 0, 0, 0.34)',
  xl: '0 48px 128px rgba(0, 0, 0, 0.62), 0 12px 32px rgba(0, 0, 0, 0.38)',

  /** Inset top highlight — the sheen along the top edge of a matte print. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  /** Focus ring in gold; crimson would read as an error state. */
  focus: `0 0 0 3px ${withAlpha(palette.gold400, 0.32)}`,
  /** A soft crimson spill, no ring. Never on a button. */
  glow: `0 0 72px ${withAlpha(palette.crimson500, 0.20)}`,
};

/* ============================================================================
 * 7. BORDERS
 *
 * Design intent
 *   Mostly invisible. The default border exists to define an edge in the dark,
 *   not to draw a box. Two exceptions earn a visible line: a thin gold rule
 *   under a chapter title, and a thin crimson rule beside a pull quote — both
 *   composed by the compiler from `colors.accent` / `colors.primary`.
 *
 * When to use
 *   `subtle` for anything inside a card, `default` for the card itself,
 *   `strong` only where a surface must separate from another surface of the
 *   same value. `divider` for table rows and credit lists.
 *
 * Contribution
 *   Restraint here is what lets shadow and spacing carry the composition.
 * ========================================================================= */

const borders = {
  width: { hairline: '1px', thick: '2px' },
  default: `1px solid ${colors.border}`,
  strong: `1px solid ${colors.borderStrong}`,
  subtle: `1px solid ${colors.borderSubtle}`,
  focus: `1px solid ${colors.borderFocus}`,
  divider: `1px solid ${colors.divider}`,
  none: 'none',
};

/* ============================================================================
 * 8. GRADIENTS
 *
 * Design intent
 *   Four moves, all slow and nearly invisible: black settling into graphite,
 *   graphite warming into warm black, a spotlight from above, and a crimson
 *   spill from a low corner. No saturated ramps, no multi-hue blends.
 *
 * When to use
 *   aurora  → chapter and section canvases
 *   halo    → the spotlight on a title slide, or behind a featured panel
 *   ember   → a single low crimson spill, opposite the halo, once per slide
 *   brand   → the primary action fill
 *   text    → a gradient title on the opening card, at most
 *   ruleFade→ the gold hairline under a chapter title
 *   fadeOut → the letterbox fade at the bottom of a cropped still
 *
 * Contribution
 *   These are lighting instruments, not decoration. Each one implies a light
 *   source, which is what makes the black feel like a room rather than a void.
 * ========================================================================= */

const gradients = {
  /** Black → graphite → warm black. The chapter canvas. */
  aurora:
    `linear-gradient(180deg, ${palette.black} 0%, ${palette.graphite} 52%, ` +
    `${palette.warmBlack} 100%)`,

  /** The overhead spotlight. Warm ivory at very low alpha, falling off fast. */
  halo:
    'radial-gradient(130% 88% at 50% -20%, rgba(244, 241, 234, 0.10) 0%, ' +
    'rgba(244, 241, 234, 0.03) 42%, rgba(8, 8, 8, 0) 74%)',

  /** A low crimson spill from the corner. The theme's only warm accent light. */
  ember:
    `radial-gradient(80% 70% at 6% 104%, ${withAlpha(palette.crimson500, 0.16)} 0%, ` +
    'rgba(8, 8, 8, 0) 62%)',

  /** Matte-paper sheen for card and panel fills. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0) 68%)',

  /** Primary action fill — crimson with a single darkening step. */
  brand: `linear-gradient(180deg, ${palette.crimson400} 0%, ${palette.crimson500} 100%)`,

  /** Gradient text — ivory into gold. Apply with background-clip: text. */
  text:
    `linear-gradient(96deg, ${palette.white} 0%, ${palette.bone} 46%, ` +
    `${palette.gold400} 100%)`,

  /** The gold hairline: fades at both ends so it reads as a rule, not a bar. */
  ruleFade:
    `linear-gradient(90deg, rgba(212, 175, 55, 0) 0%, ${withAlpha(palette.gold400, 0.55)} 50%, ` +
    'rgba(212, 175, 55, 0) 100%)',

  /** Letterbox fade for cropped stills, long credits and truncated lists. */
  fadeOut: `linear-gradient(180deg, rgba(8, 8, 8, 0) 0%, ${palette.black} 100%)`,
};

/* ============================================================================
 * 9. BACKGROUNDS — ready-to-apply slide canvases
 *
 * Design intent
 *   Seven canvases, each a different lighting setup on the same black stage.
 *   None is decorative: every one implies where the light is coming from.
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   story slides, comparisons, credits  → canvas
 *   title cards and chapter openers     → hero
 *   act breaks, closing card            → aurora
 *   data and poster-style slides        → dotGrid
 *   timelines, storyboards, sequences   → lineGrid
 *   quotes, stills, tables, code        → panel
 *   full-bleed photography              → scrim
 *
 * Contribution
 *   Because the canvases share one palette and one light logic, cutting between
 *   them across a deck feels like cutting between shots in one film.
 * ========================================================================= */

/** Film-grain dot field — ivory at very low alpha, 40px pitch. */
const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' " +
  "height='40'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23f4f1ea' fill-opacity='0.05'/%3E%3C/svg%3E\")";

/** Storyboard rule field — horizontal only, so it reads as ruled paper. */
const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' " +
  "height='80'%3E%3Cpath d='M0 79.5H80' fill='none' stroke='%23f4f1ea' " +
  "stroke-opacity='0.045' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /**
   * Default slide canvas — flat near black.
   * Use for story copy, comparisons and anything where the words are the shot.
   */
  canvas: { background: colors.background },

  /**
   * Title card: overhead spotlight plus a low crimson spill.
   * Use for the opening slide, chapter openers and the closing card.
   */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /**
   * Act break — the vertical black → graphite → warm black wash.
   * Use where the deck changes subject and needs a beat of silence.
   */
  aurora: { background: gradients.aurora },

  /**
   * Grain field. Use behind data slides and poster-style layouts, where flat
   * black would read as empty rather than composed.
   */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /**
   * Ruled field. Use for timelines, storyboards and sequence slides — the
   * horizontal rules imply a filmstrip without drawing one.
   */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /**
   * Matte panel fill. Use for pull quotes, stills, tables and code — anything
   * that should read as a print resting on the stage.
   */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.surface}`,
  },

  /**
   * Full-bleed photography scrim. Weighted to the bottom so a caption or title
   * sits in the dark while the top of the image stays open.
   */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(4, 4, 4, 0.18) 0%, rgba(4, 4, 4, 0.55) 52%, ' +
      'rgba(4, 4, 4, 0.92) 100%)',
  },
};

/* ============================================================================
 * 10. BUTTONS
 *
 * Design intent
 *   Large, quiet, dark. Presentation decks rarely have real controls, so these
 *   exist for interactive and web-hosted decks — and they must not become the
 *   brightest object on a cinematic slide. Nothing glows; the primary is a flat
 *   crimson fill with a single darkening step.
 *
 * When to use
 *   primary   → the one action on a slide (open the demo, start the film)
 *   secondary → navigation and neutral actions
 *   ghost     → tertiary actions, footer links, chapter navigation
 *
 * Contribution
 *   Generous padding and near-square corners keep buttons in the same material
 *   language as the cards: printed, matte, unhurried.
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '17px',
  fontWeight: typography.weight.medium,
  letterSpacing: '0.02em',
  lineHeight: 1,
  padding: '16px 32px',
  borderRadius: radius.md,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.inlineGap,
  whiteSpace: 'nowrap',
};

const buttons = {
  base: buttonBase,

  /** Sizes keep the same near-square radius; only padding and size change. */
  sizes: {
    sm: { fontSize: '15px', padding: '11px 22px', borderRadius: radius.sm },
    md: { fontSize: '17px', padding: '16px 32px', borderRadius: radius.md },
    lg: { fontSize: '19px', padding: '20px 44px', borderRadius: radius.md },
  },

  /** Flat crimson. No glow, no ring — the color is the emphasis. */
  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: '1px solid transparent',
    boxShadow: shadows.sm,
    hover: { background: colors.primaryHover, boxShadow: shadows.md },
    active: { background: colors.primaryActive, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.secondary,
      color: colors.textDisabled,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  /** Dark housing with an almost-invisible edge. The default control. */
  secondary: {
    ...buttonBase,
    background: colors.secondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.sm}, ${shadows.hairline}`,
    hover: {
      background: colors.surfaceHover,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderStrong}`,
    },
    active: { background: colors.surface, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surface,
      color: colors.textDisabled,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  /** Text only, set in gold. Chapter navigation and footer links. */
  ghost: {
    ...buttonBase,
    background: 'transparent',
    color: colors.textLink,
    border: '1px solid transparent',
    boxShadow: 'none',
    hover: { background: colors.accentSubtle },
    active: { background: withAlpha(palette.gold400, 0.18) },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. CARDS
 *
 * Design intent
 *   Editorial, not app-like. Each variant is a different printed object: a
 *   matte card on the stage, a lit title card, an inset strip of film, a
 *   quotation panel. Corners are near-square, fills are flat, and separation
 *   comes from shadow rather than from a drawn border.
 *
 * When to use
 *   base     → standard content card, credit block, comparison column
 *   elevated → the featured card on a slide; the one the eye lands on first
 *   flat     → code, tables, inset stills — anything set into the stage
 *   glass    → a caption panel over full-bleed photography (opaque, see below)
 *   accent   → one pull quote or chapter mark per slide, crimson-washed
 *   hover    → merge onto any variant for interactive decks
 *
 * Contribution
 *   Cards are where "premium matte paper" is actually delivered: flat fill,
 *   hairline top sheen, wide soft shadow, hard corners.
 * ========================================================================= */

const cards = {
  /** The standard print: flat graphite, barely-there edge, soft shadow. */
  base: {
    background: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** The lit title card — one per slide. Sheen on top, wide shadow beneath. */
  elevated: {
    background: `${gradients.surfaceSheen}, ${colors.surfaceElevated}`,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.xl}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Set into the stage: code, tables, inset stills. No lift at all. */
  flat: {
    background: colors.surfaceSunken,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textSecondary,
  },

  /**
   * Kept for API parity. This theme rejects glassmorphism, so the "glass"
   * variant is an opaque matte panel for captions and titles laid over
   * full-bleed photography — the same material as every other card.
   */
  glass: {
    background: palette.graphite,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /**
   * The crimson mark. A pull quote, a chapter card, the one line of the deck
   * that should stay with the audience. Uses the soft crimson spill, never a
   * ring or an outline.
   */
  accent: {
    background: colors.primarySubtle,
    border: `1px solid ${withAlpha(palette.crimson500, 0.28)}`,
    boxShadow: `${shadows.glow}, ${shadows.lg}`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — the print lifts, the edge warms. */
  hover: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
  },
};

/* ============================================================================
 * 12. MOTION — descriptors only. The compiler decides how to run them.
 *
 * Design intent
 *   Opacity first, movement second, and never more than a few pixels of it.
 *   180–300ms with a decelerating curve: long enough to feel composed, short
 *   enough that a presenter isn't waiting on the slide. Nothing overshoots —
 *   bounce is the fastest way to make a cinematic deck feel like a toy.
 *
 * When to use
 *   fade    → the default for slide content and for slide-to-slide transitions
 *   fadeUp  → a title arriving on a chapter card
 *   slide   → a comparison column entering from the side
 *   scaleIn → a still settling into frame; the push-in is deliberately tiny
 *   blurIn  → a soft focus-pull, capped low so it never reads as a blur effect
 *
 * Contribution
 *   Slow opacity transitions are what make a cut between two black slides feel
 *   like a dissolve — the single most cinematic thing motion can do here.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 80,
    fast: 140,
    normal: 220,
    slow: 300,
    slower: 420,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    /** Decelerating, no overshoot — the house curve for this theme. */
    entrance: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    exit: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
    /** Kept for API parity — mapped to the entrance curve; nothing bounces. */
    spring: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    linear: 'linear',
  },

  /** The default. A dissolve, not an animation. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 260,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  /** A 1% push-in. Any more and it reads as a zoom. */
  scaleIn: {
    from: { opacity: 0, transform: 'scale(1.01)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  /** Focus pull, capped at 4px so it never becomes a blur transition. */
  blurIn: {
    from: { opacity: 0, filter: 'blur(4px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },

  /**
   * Sequencing for credit lists, bullet reveals and timeline beats. The step is
   * long by AIRDeck standards — credits roll, they don't cascade.
   */
  stagger: {
    step: 90,
    initialDelay: 120,
    maxItems: 12,
  },

  /** Slide-to-slide transition default: a plain dissolve. */
  transition: {
    preset: 'fade',
    duration: 300,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },

  /** Honour prefers-reduced-motion: collapse everything to a short fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 140,
    stagger: { step: 0, initialDelay: 0 },
  },
};

/* ============================================================================
 * 13. LAYOUT (slide geometry)
 *
 * Design intent
 *   A 16:9 frame with a heavy margin and a content column narrower than the
 *   stage. The unused width is not waste — it is the letterbox.
 *
 * When to use
 *   The compiler reads this for canvas size and grid maths. `maxContentWidth`
 *   caps story copy so a line of body text never runs past a comfortable
 *   measure, even on a slide with no other content.
 * ========================================================================= */

const layout = {
  aspectRatio: '16 / 9',
  width: 1920,
  height: 1080,
  padding: spacing.slidePadding,
  /** Narrower than the frame on purpose — the margin is part of the design. */
  maxContentWidth: '1360px',
  columnGap: spacing.lg,
  rowGap: spacing.md,
  grid: { columns: 12, gutter: '40px' },
};

/* ============================================================================
 * 14. UTILITIES — same names and signatures as themes/linear.js
 *
 * Design intent
 *   Resolution helpers so slide code never indexes into token maps directly.
 *   Every accessor falls back to a sensible default rather than returning
 *   undefined: a mistyped token name should produce a plain slide, never a
 *   broken one mid-presentation.
 *
 * When to use
 *   Everywhere. `cssVariables` for injecting a theme into a slide root,
 *   `extend` for building a variant, the getters for one-off lookups.
 * ========================================================================= */

const scheme = { dark: colors, light: lightColors };

const utilities = {
  withAlpha,

  /**
   * Resolve a text color by role.
   * @param {'primary'|'secondary'|'muted'|'disabled'|'inverse'|'link'|'onPrimary'} [level]
   * @param {'dark'|'light'} [mode]
   * @returns {string}
   */
  getTextColor(level = 'primary', mode = 'dark') {
    const c = scheme[mode] || colors;
    const map = {
      primary: c.textPrimary,
      secondary: c.textSecondary,
      muted: c.textMuted,
      disabled: c.textDisabled,
      inverse: c.textInverse,
      link: c.textLink,
      onPrimary: c.textOnPrimary,
    };
    return map[level] || map.primary;
  },

  /**
   * Resolve a surface color by elevation.
   * @param {'base'|'elevated'|'sunken'|'hover'|'overlay'|'canvas'} [level]
   * @param {'dark'|'light'} [mode]
   * @returns {string}
   */
  getSurface(level = 'base', mode = 'dark') {
    const c = scheme[mode] || colors;
    const map = {
      base: c.surface,
      elevated: c.surfaceElevated,
      sunken: c.surfaceSunken,
      hover: c.surfaceHover,
      overlay: c.overlay,
      canvas: c.background,
    };
    return map[level] || map.base;
  },

  /**
   * Resolve a button style, optionally merged with a size and a state.
   * State sub-objects are stripped from the result, so the return value is a
   * flat style map safe to spread onto an element.
   *
   * @param {'primary'|'secondary'|'ghost'} [variant]
   * @param {{size?: 'sm'|'md'|'lg', state?: 'hover'|'active'|'focus'|'disabled'}} [options]
   * @returns {object}
   */
  getButton(variant = 'primary', options = {}) {
    const { size = 'md', state } = options;
    const token = buttons[variant] || buttons.primary;
    const { hover, active, focus, disabled, ...rest } = token;
    const stateStyles = { hover, active, focus, disabled };
    return {
      ...rest,
      ...(buttons.sizes[size] || {}),
      ...(state ? stateStyles[state] || {} : {}),
    };
  },

  /**
   * Resolve a card style, optionally merged with its hover state.
   * @param {'base'|'elevated'|'flat'|'glass'|'accent'} [variant]
   * @param {{hover?: boolean}} [options]
   * @returns {object}
   */
  getCard(variant = 'base', options = {}) {
    const token = cards[variant] || cards.base;
    return options.hover ? { ...token, ...cards.hover } : { ...token };
  },

  /**
   * Resolve a type role.
   * @param {keyof typography} [role]
   * @returns {object}
   */
  getTypography(role = 'body') {
    return { ...(typography[role] || typography.body) };
  },

  /**
   * Multiply every font size — use when rendering at a non-1080p canvas.
   * Tracking and leading are unitless or em-based, so they scale on their own.
   *
   * @param {number} [factor]
   * @returns {Record<string, object>} the seven type roles, resized
   */
  scaleType(factor = 1) {
    const roles = ['display', 'heading', 'title', 'body', 'caption', 'code', 'eyebrow'];
    const out = {};
    for (const role of roles) {
      const token = typography[role];
      const size = parseFloat(token.fontSize);
      out[role] = { ...token, fontSize: `${Math.round(size * factor)}px` };
    }
    return out;
  },

  /**
   * 8pt step → px string. `getSpace(3)` → '24px'. Accepts named keys too.
   * @param {number|string} [step]
   * @returns {string}
   */
  getSpace(step = 1) {
    if (typeof step === 'string') return spacing[step] || step;
    return spacing[step] != null ? spacing[step] : `${step * 8}px`;
  },

  getRadius(size = 'md') {
    return radius[size] || radius.md;
  },

  getShadow(size = 'md') {
    return shadows[size] || shadows.md;
  },

  getGradient(name = 'aurora') {
    return gradients[name] || gradients.aurora;
  },

  getBackground(name = 'canvas') {
    return { ...(backgrounds[name] || backgrounds.canvas) };
  },

  /**
   * Motion preset with stagger applied.
   * @param {string} [name]
   * @param {number} [index] position in a staggered group
   * @returns {object} the preset plus a computed `delay` in ms
   */
  getMotion(name = 'fadeUp', index = 0) {
    const preset = motion[name] || motion.fadeUp;
    if (!preset.from) return { ...preset };
    const capped = Math.min(index, motion.stagger.maxItems);
    return {
      ...preset,
      delay: motion.stagger.initialDelay + capped * motion.stagger.step,
    };
  },

  /** Nth series color, wrapping around the set. */
  getChartColor(index = 0) {
    return colors.chart[index % colors.chart.length];
  },

  /** Full semantic color map for a scheme. */
  getScheme(mode = 'dark') {
    return { ...(scheme[mode] || colors) };
  },

  /**
   * Flatten tokens into CSS custom properties for injection into a slide root.
   * Namespace matches themes/linear.js so compiled CSS is theme-agnostic.
   *
   * @param {'dark'|'light'} [mode]
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#b22222' }
   */
  cssVariables(mode = 'dark') {
    const vars = {};
    const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

    for (const [key, value] of Object.entries(scheme[mode] || colors)) {
      if (typeof value === 'string') vars[`--ld-color-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(spacing)) {
      vars[`--ld-space-${kebab(String(key))}`] = value;
    }
    for (const [key, value] of Object.entries(radius)) {
      vars[`--ld-radius-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(shadows)) {
      vars[`--ld-shadow-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(gradients)) {
      vars[`--ld-gradient-${kebab(key)}`] = value;
    }
    vars['--ld-font-sans'] = fontStacks.sans;
    vars['--ld-font-mono'] = fontStacks.mono;
    return vars;
  },

  /**
   * Create a derived theme without mutating this one.
   *
   * Merges one level deep, so `{ colors: { primary: 'x' } }` replaces a single
   * color and leaves the rest of the group intact. The result is frozen.
   *
   * @param {object} [overrides] partial theme
   * @returns {object} a new frozen theme
   */
  extend(overrides = {}) {
    // eslint-disable-next-line no-use-before-define
    return deepFreeze(mergeTokens(theme, overrides));
  },
};

/* ============================================================================
 * 15. THEME EXPORT
 *
 * Design intent
 *   The assembled object, frozen. Key order matches themes/linear.js so the two
 *   files diff cleanly and the compiler can treat them as interchangeable.
 * ========================================================================= */

const cinema = {
  id: 'cinema',
  name: 'Cinema',
  description: 'Premium cinematic storytelling presentation theme',
  ai: {
  summary:
    "A premium cinematic storytelling theme designed for marketing, product launches, documentaries, and inspirational presentations.",

  bestFor: [
    "Storytelling",
    "Product Launches",
    "Marketing Campaigns",
    "Brand Presentations",
    "Vision Presentations",
    "Company Introductions",
    "Inspirational Talks",
    "Documentaries",
    "Case Studies",
    "Customer Stories",
    "Product Reveals",
    "Mission & Vision"
  ],

  avoidFor: [
    "Programming Tutorials",
    "Financial Dashboards",
    "Scientific Research",
    "Technical Documentation",
    "Academic Lectures"
  ],

  keywords: [
    "story",
    "storytelling",
    "marketing",
    "brand",
    "vision",
    "mission",
    "cinematic",
    "documentary",
    "film",
    "movie",
    "launch",
    "product",
    "campaign",
    "creative",
    "inspiration",
    "presentation",
    "customer",
    "showcase",
    "advertising",
    "promotion",
    "journey",
    "experience"
  ],

  style: [
    "Cinematic",
    "Elegant",
    "Premium",
    "Story Driven",
    "Emotional",
    "Luxury",
    "Minimal"
  ]
},
  version: '1.0.0',
  mode: 'dark',
  supportedModes: ['dark', 'light'],

  colors,
  schemes: scheme,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
  backgrounds,
  borders,
  buttons,
  cards,
  layout,
  motion,
  utilities,
};

/** Internal alias used by `utilities.extend`, which runs before this binding. */
const theme = cinema;

export default deepFreeze(cinema);
export { withAlpha, colors, typography, spacing, radius, shadows, gradients, motion };
