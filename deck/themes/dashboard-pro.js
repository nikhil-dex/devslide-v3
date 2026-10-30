/**
 * AIRDeck Theme — "Dashboard Pro"
 * =============================================================================
 * An enterprise analytics theme: deep graphite canvas, ruled data surfaces,
 * one electric-blue accent and a saturated status set built so charts read
 * from the back of the room. Tokens only: no DOM, no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Neutral graphite, no color cast — every hue on screen belongs to data.
 *   • Borders define every card, row and axis; shadows barely register.
 *   • KPI figures are the largest type in the theme; headings sit below them.
 *   • Radius stays 3–14px. Nothing reads as a consumer app card.
 *   • Motion is 180–250ms with a 1px hover lift. Nothing moves dramatically.
 *
 * Compiler note
 * -------------
 * KPI figures and table columns should be rendered with
 * `font-variant-numeric: tabular-nums`. The type roles below carry no key for
 * it (API parity with Linear), so the compiler applies it to numeric cells.
 *
 * Extending
 * ---------
 *   import dashboardPro from './themes/dashboard-pro.js';
 *   const teal = dashboardPro.utilities.extend({
 *     colors: { primary: '#0f9b8e', accent: '#12b3a3' },
 *   });
 *
 * @module themes/dashboard-pro
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#3b82f6'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(59, 130, 246, 0.5)'
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

/** Recursively freeze an object so themes can't be mutated at runtime. */
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const value = obj[key];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

/** Shallow-merge one level deep — enough for token override maps. */
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
 * 1. Palette (private primitives)
 * ========================================================================= */

const palette = {
  // Graphite ladder — neutral, no blue cast. Data supplies the color.
  black: '#0a0b0d',
  canvas: '#0f1113',
  surface: '#16191d',
  surfaceAlt: '#1c2026',
  raised: '#242931',

  // Rules.
  border: '#2a3038',
  borderStrong: '#3a424d',
  borderMuted: '#1f242a',

  // Text ladder.
  white: '#ffffff',
  text: '#f0f2f5',
  textSoft: '#c7cdd6',
  muted: '#8b93a1',
  subtle: '#6b7280',
  faint: '#525a66',

  // Electric blue accent.
  blue300: '#8ab6ff',
  blue400: '#5c9bff',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',

  // Status / series hues — saturated enough to hold at chart scale.
  green500: '#31c46b',
  green600: '#22a55a',
  amber500: '#e6a532',
  amber600: '#c8871f',
  red500: '#e5484d',
  red600: '#c93b40',
  cyan500: '#25b7cf',
  violet500: '#8a7ff0',

  // Light-scheme primitives (used only by the light counterpart).
  lightCanvas: '#f4f6f8',
  lightSurface: '#ffffff',
  lightSunken: '#eaedf1',
  lightBorder: '#d8dde4',
  lightText: '#14181d',
  lightMuted: '#5b6472',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.canvas,
  backgroundSubtle: palette.black,
  surface: palette.surface,
  surfaceElevated: palette.surfaceAlt,
  surfaceSunken: palette.black,
  surfaceHover: palette.raised,
  overlay: 'rgba(10, 11, 13, 0.78)',

  // Brand
  primary: palette.blue500,
  primaryHover: palette.blue400,
  primaryActive: palette.blue700,
  primarySubtle: withAlpha(palette.blue500, 0.14),
  primaryContrast: palette.white,

  secondary: palette.surfaceAlt,
  secondaryHover: palette.raised,
  secondaryContrast: palette.text,

  accent: palette.cyan500,
  accentSubtle: withAlpha(palette.cyan500, 0.13),

  // Status — the KPI delta palette: up, watch, down, informational.
  success: palette.green500,
  successSubtle: withAlpha(palette.green500, 0.14),
  warning: palette.amber500,
  warningSubtle: withAlpha(palette.amber500, 0.14),
  danger: palette.red500,
  dangerSubtle: withAlpha(palette.red500, 0.14),
  info: palette.cyan500,
  infoSubtle: withAlpha(palette.cyan500, 0.13),

  // Text
  textPrimary: palette.text,
  textSecondary: palette.textSoft,
  textMuted: palette.muted,
  textDisabled: palette.faint,
  textInverse: palette.canvas,
  textLink: palette.blue400,
  textOnPrimary: palette.white,

  // Lines — every card, row and axis is ruled.
  border: palette.border,
  borderStrong: palette.borderStrong,
  borderSubtle: palette.borderMuted,
  borderFocus: palette.blue500,
  divider: palette.borderMuted,

  /**
   * Chart series — ordered for legibility when stacked or adjacent.
   * Blue leads (primary metric), cyan and green follow (secondary and target),
   * amber and red carry thresholds, violet is the spare comparison series.
   */
  chart: [
    palette.blue500,
    palette.cyan500,
    palette.green500,
    palette.amber500,
    palette.violet500,
    palette.red500,
  ],
};

/**
 * Light scheme — the same dashboard printed for a board deck. Same token
 * names, inverted values, status hues darkened for contrast on white.
 */
const lightColors = mergeTokens(colors, {
  background: palette.lightCanvas,
  backgroundSubtle: palette.lightSunken,
  surface: palette.lightSurface,
  surfaceElevated: palette.lightSurface,
  surfaceSunken: palette.lightSunken,
  surfaceHover: '#e2e6ec',
  overlay: 'rgba(20, 24, 29, 0.55)',

  primary: palette.blue600,
  primaryHover: palette.blue500,
  primaryActive: palette.blue700,
  primarySubtle: withAlpha(palette.blue600, 0.10),

  secondary: palette.lightSunken,
  secondaryHover: '#e2e6ec',
  secondaryContrast: palette.lightText,

  accent: '#0e8fa8',
  accentSubtle: withAlpha('#0e8fa8', 0.11),

  success: palette.green600,
  successSubtle: withAlpha(palette.green600, 0.12),
  warning: palette.amber600,
  warningSubtle: withAlpha(palette.amber600, 0.12),
  danger: palette.red600,
  dangerSubtle: withAlpha(palette.red600, 0.12),
  info: '#0e8fa8',
  infoSubtle: withAlpha('#0e8fa8', 0.11),

  textPrimary: palette.lightText,
  textSecondary: '#39424f',
  textMuted: palette.lightMuted,
  textDisabled: '#8a93a1',
  textInverse: palette.white,
  textLink: palette.blue600,

  border: palette.lightBorder,
  borderStrong: '#bcc4cf',
  borderSubtle: '#e6eaef',
  borderFocus: palette.blue600,
  divider: '#e6eaef',

  chart: [
    palette.blue600,
    '#0e8fa8',
    palette.green600,
    palette.amber600,
    '#6d5fd8',
    palette.red600,
  ],
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ' +
    'Arial, "Noto Sans", sans-serif',
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas.
 *
 * `display` is the KPI figure — the single largest, heaviest element on a
 * dashboard slide. Slide titles use `heading` so the number always wins.
 * Scale everything with `utilities.scaleType(factor)` for other canvases.
 */
const typography = {
  fontFamily: fontStacks,

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /** KPI figures: "$4.82M", "99.98%", "1,204". */
  display: {
    fontFamily: fontStacks.sans,
    fontSize: '92px',
    fontWeight: 700,
    letterSpacing: '-0.032em',
    lineHeight: 1.0,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '44px',
    fontWeight: 600,
    letterSpacing: '-0.018em',
    lineHeight: 1.18,
  },
  /** Card titles and panel headers. */
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '26px',
    fontWeight: 600,
    letterSpacing: '-0.008em',
    lineHeight: 1.34,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '19px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.56,
  },
  /** Axis ticks, table headers, KPI labels, footnotes. */
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.01em',
    lineHeight: 1.4,
  },
  /** Query snippets, logs, API payloads. */
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.6,
  },

  /** Section and metric-group label above a heading. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.11em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
};

/* ============================================================================
 * 4. Spacing — strict 8pt scale (4px half-step allowed for optical fixes)
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
  sm: '12px',
  md: '20px',
  lg: '32px',
  xl: '48px',
  '2xl': '72px',

  /** Default slide padding — dense by design; the grid needs the room. */
  slidePadding: '72px',
  sectionGap: '48px',
  stackGap: '20px',
  inlineGap: '8px',
};

/* ============================================================================
 * 5. Radius — medium and consistent. Cards are panels, not pills.
 * ========================================================================= */

const radius = {
  xs: '3px',
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — near-invisible. Elevation is signalled by border and tone.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.36)',
  md: '0 2px 6px rgba(0, 0, 0, 0.34), 0 1px 2px rgba(0, 0, 0, 0.24)',
  lg: '0 6px 16px rgba(0, 0, 0, 0.38), 0 2px 6px rgba(0, 0, 0, 0.26)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.44), 0 4px 10px rgba(0, 0, 0, 0.28)',

  /** Inset top highlight — used on raised controls only. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
  focus: `0 0 0 3px ${withAlpha(palette.blue500, 0.38)}`,
  /** Active/selected KPI card — a ring, not a bloom. */
  glow: `0 0 0 1px ${withAlpha(palette.blue500, 0.55)}`,
};

/* ============================================================================
 * 7. Borders
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
 * 8. Gradients — functional only: sparkline fills, header steps, fades.
 * ========================================================================= */

const gradients = {
  /** Canvas step — inset black lifting to graphite. Almost imperceptible. */
  aurora: `linear-gradient(180deg, ${palette.black} 0%, ${palette.canvas} 40%, ${palette.canvas} 100%)`,

  /** Faint blue pool behind a title or a featured metric. */
  halo:
    `radial-gradient(110% 70% at 50% -14%, ${withAlpha(palette.blue500, 0.12)} 0%, ` +
    'rgba(15, 17, 19, 0) 62%)',

  /** Area-chart fill: accent fading to nothing over the plot. */
  ember:
    `linear-gradient(180deg, ${withAlpha(palette.blue500, 0.28)} 0%, ` +
    'rgba(15, 17, 19, 0) 92%)',

  /** Panel header bar — one tonal step above the card body. */
  surfaceSheen: `linear-gradient(180deg, ${palette.surfaceAlt} 0%, ${palette.surface} 100%)`,

  /** Primary action fill — flat blue with a single darkening step. */
  brand: `linear-gradient(180deg, ${palette.blue500} 0%, ${palette.blue600} 100%)`,

  /** Gradient text — reserved for a single headline figure. */
  text: `linear-gradient(96deg, ${palette.text} 0%, ${palette.blue300} 100%)`,

  /** Hairline that fades at both ends — table and section rules. */
  ruleFade:
    'linear-gradient(90deg, rgba(42, 48, 56, 0) 0%, rgba(42, 48, 56, 1) 50%, ' +
    'rgba(42, 48, 56, 0) 100%)',

  /** Bottom fade for truncated tables, logs and long series. */
  fadeOut: `linear-gradient(180deg, rgba(15, 17, 19, 0) 0%, ${palette.canvas} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   metric slides, comparison blocks    → canvas
 *   title and section openers           → hero
 *   chapter breaks                      → aurora
 *   dashboard grids, KPI walls          → dotGrid
 *   charts, roadmaps, timelines         → lineGrid
 *   data cards, tables, code, quotes    → panel
 *   full-bleed screenshots              → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23f0f2f5' fill-opacity='0.05'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%23f0f2f5' " +
  "stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — deep graphite. */
  canvas: { background: colors.background },

  /** Title and section openers: a single faint blue pool, nothing else. */
  hero: {
    background: `${gradients.halo}, ${colors.background}`,
  },

  /** Chapter break — vertical canvas step. */
  aurora: { background: gradients.aurora },

  /** Dashboard grids and KPI walls — dotted field behind the cards. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Charts, roadmaps and timelines — ruled field that reads as plot grid. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Data cards, tables, code and quote blocks. */
  panel: { background: colors.surface },

  /** Full-bleed screenshot scrim so captions stay legible. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(10, 11, 13, 0.25) 0%, rgba(10, 11, 13, 0.88) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons — compact admin controls: thin border, small radius, 1px lift.
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '16px',
  fontWeight: typography.weight.semibold,
  letterSpacing: '-0.002em',
  lineHeight: 1,
  padding: '11px 20px',
  borderRadius: radius.md,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.xs,
  whiteSpace: 'nowrap',
};

const buttons = {
  base: buttonBase,

  sizes: {
    sm: { fontSize: '14px', padding: '7px 14px', borderRadius: radius.sm },
    md: { fontSize: '16px', padding: '11px 20px', borderRadius: radius.md },
    lg: { fontSize: '18px', padding: '14px 28px', borderRadius: radius.md },
  },

  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: `1px solid ${withAlpha(palette.blue400, 0.45)}`,
    boxShadow: shadows.sm,
    hover: { background: colors.primaryHover, boxShadow: shadows.md },
    active: { background: colors.primaryActive, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.secondary,
      color: colors.textDisabled,
      border: `1px solid ${colors.borderSubtle}`,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  secondary: {
    ...buttonBase,
    background: colors.secondary,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    hover: { background: colors.surfaceHover, border: `1px solid ${colors.borderStrong}` },
    active: { background: colors.surface, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surface,
      color: colors.textDisabled,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  ghost: {
    ...buttonBase,
    background: 'transparent',
    color: colors.textMuted,
    border: '1px solid transparent',
    boxShadow: 'none',
    hover: { background: colors.secondary, color: colors.textPrimary },
    active: { background: colors.surfaceHover },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — the load-bearing component. KPI tiles, chart panels, tables.
 * ========================================================================= */

const cards = {
  /** Standard data card — chart panels, table containers, comparison blocks. */
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** KPI tile — one step brighter, so the number reads first. */
  elevated: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textPrimary,
  },

  /** Table body, log output, inset plot area — no lift at all. */
  flat: {
    background: colors.surfaceSunken,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textSecondary,
  },

  /**
   * Kept for API parity. This theme rejects frosted glass, so the "glass"
   * variant is an opaque overlay panel for callouts over a screenshot.
   */
  glass: {
    background: palette.surfaceAlt,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /** Featured metric — the one number the executive summary is about. */
  accent: {
    background: colors.primarySubtle,
    border: `1px solid ${withAlpha(palette.blue500, 0.42)}`,
    boxShadow: shadows.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — a border change and a 1px lift. */
  hover: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.md,
  },
};

/* ============================================================================
 * 12. Motion — 180–250ms. Fast, flat, professional. No overshoot.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 60,
    fast: 120,
    normal: 180,
    slow: 250,
    slower: 320,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 0.7, 1)',
    /** Kept for API parity — mapped to the entrance curve; no springs here. */
    spring: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 180,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 220,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 220,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(14px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 220,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.99)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 200,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(3px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 250,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },

  /** Sequencing for KPI rows, table rows and legend items. */
  stagger: {
    step: 45,
    initialDelay: 60,
    maxItems: 16,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fade',
    duration: 200,
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
  },

  /** Honour prefers-reduced-motion: collapse everything to a plain fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 120,
    stagger: { step: 0, initialDelay: 0 },
  },
};

/* ============================================================================
 * 13. Layout (slide geometry)
 * ========================================================================= */

const layout = {
  aspectRatio: '16 / 9',
  width: 1920,
  height: 1080,
  padding: spacing.slidePadding,
  /** Wide — dashboard grids use the full stage, not a reading column. */
  maxContentWidth: '1620px',
  columnGap: spacing.md,
  rowGap: spacing.md,
  grid: { columns: 12, gutter: '20px' },
};

/* ============================================================================
 * 14. Utilities — same names and signatures as themes/linear.js
 * ========================================================================= */

const scheme = { dark: colors, light: lightColors };

const utilities = {
  withAlpha,

  /**
   * @param {'primary'|'secondary'|'muted'|'disabled'|'inverse'|'link'|'onPrimary'} [level]
   * @param {'dark'|'light'} [mode]
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
   * @param {'base'|'elevated'|'sunken'|'hover'|'overlay'|'canvas'} [level]
   * @param {'dark'|'light'} [mode]
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
   * @param {'primary'|'secondary'|'ghost'} [variant]
   * @param {{size?: 'sm'|'md'|'lg', state?: 'hover'|'active'|'focus'|'disabled'}} [options]
   * @returns {object} flat style map (state sub-objects removed)
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
   * @param {'base'|'elevated'|'flat'|'glass'|'accent'} [variant]
   * @param {{hover?: boolean}} [options]
   */
  getCard(variant = 'base', options = {}) {
    const token = cards[variant] || cards.base;
    return options.hover ? { ...token, ...cards.hover } : { ...token };
  },

  /** @param {keyof typography} role */
  getTypography(role = 'body') {
    return { ...(typography[role] || typography.body) };
  },

  /** Multiply every font size — use when rendering at non-1080p canvases. */
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

  /** 8pt step → px string. `getSpace(3)` → '24px'. Accepts named keys too. */
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
   * @param {string} name
   * @param {number} [index] position in a staggered group
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

  /** Nth chart color, wrapping around the series. */
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
   * @param {'dark'|'light'} [mode]
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#3b82f6' }
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
   * @param {object} overrides partial theme (one level of deep merge)
   * @returns {object} new frozen theme
   */
  extend(overrides = {}) {
    // eslint-disable-next-line no-use-before-define
    return deepFreeze(mergeTokens(theme, overrides));
  },
};

/* ============================================================================
 * 15. Theme export
 * ========================================================================= */

const theme = {
  id: 'dashboard-pro',
  name: 'Dashboard Pro',
  description:
    'Enterprise analytics theme: graphite canvas, electric-blue accent, ruled ' +
    'data cards, oversized KPI figures, chart-first color, 180–250ms motion.',
  ai: {
  summary:
    "Professional analytics and executive dashboard presentations focused on KPIs, metrics, business intelligence, and financial reporting.",

  bestFor: [
    "Executive Reports",
    "Business Intelligence",
    "Analytics Dashboards",
    "Financial Reports",
    "Sales Reports",
    "Marketing Analytics",
    "Company Performance",
    "KPIs",
    "Investor Updates",
    "Revenue Analysis",
    "Operational Metrics",
    "Data Visualization"
  ],

  avoidFor: [
    "Product Launches",
    "Programming Tutorials",
    "Research Papers",
    "Gaming Presentations",
    "Storytelling Presentations"
  ],

  keywords: [
    "dashboard",
    "analytics",
    "kpi",
    "metrics",
    "business",
    "finance",
    "financial",
    "revenue",
    "profit",
    "growth",
    "sales",
    "marketing",
    "performance",
    "executive",
    "report",
    "data",
    "charts",
    "graphs",
    "statistics",
    "roi",
    "customers",
    "conversion",
    "retention",
    "forecast"
  ],

  style: [
    "Professional",
    "Analytical",
    "Executive",
    "Data Driven",
    "Structured",
    "Modern",
    "Business Focused"
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

export default deepFreeze(theme);
export { withAlpha, colors, typography, spacing, radius, shadows, gradients, motion };
