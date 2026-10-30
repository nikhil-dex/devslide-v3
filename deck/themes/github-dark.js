/**
 * AIRDeck Theme — "GitHub Dark"
 * =============================================================================
 * A developer-first dark interface language: deep charcoal canvas, visible
 * borders, near-flat surfaces, one blue accent. Tokens only: no DOM, no
 * components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Charcoal (#0d1117), never black. Surfaces step up, they don't glow.
 *   • Borders carry the structure — every panel, table and timeline is ruled.
 *   • Shadows appear only on things that genuinely float (menus, popovers).
 *   • Radius stays 6–10px; nothing reads as a pill or a rounded marketing card.
 *   • Motion is 150–220ms and opacity-led. No springs, no scale drama.
 *
 * Extending
 * ---------
 *   import githubDark from './themes/github-dark.js';
 *   const dimmed = githubDark.utilities.extend({
 *     colors: { background: '#22272e', surface: '#2d333b' },
 *   });
 *
 * @module themes/github-dark
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#2f81f7'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(47, 129, 247, 0.5)'
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
  // Canvas ladder — inset, canvas, surface, surface alt, raised.
  black: '#010409',
  canvas: '#0d1117',
  surface: '#161b22',
  surfaceAlt: '#21262d',
  raised: '#282e36',

  // Rules and dividers.
  border: '#30363d',
  borderMuted: '#21262d',
  borderStrong: '#3d444d',

  // Text ladder.
  text: '#e6edf3',
  textSoft: '#c9d1d9',
  muted: '#8b949e',
  subtle: '#6e7681',
  faint: '#484f58',

  // Blue accent.
  blue300: '#79c0ff',
  blue400: '#58a6ff',
  blue500: '#2f81f7',
  blue600: '#1f6feb',
  blue700: '#1158c7',

  // Status.
  green400: '#56d364',
  green500: '#3fb950',
  green600: '#238636',
  green700: '#1a7f37',
  yellow500: '#d29922',
  red400: '#ff7b72',
  red500: '#f85149',
  purple500: '#a371f7',

  // Light-scheme primitives (used only by the light counterpart).
  lightCanvas: '#ffffff',
  lightSubtle: '#f6f8fa',
  lightSurfaceAlt: '#eaeef2',
  lightBorder: '#d1d9e0',
  lightText: '#1f2328',
  lightMuted: '#59636e',
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
  overlay: 'rgba(1, 4, 9, 0.8)',

  // Brand
  primary: palette.blue500,
  primaryHover: palette.blue400,
  primaryActive: palette.blue700,
  primarySubtle: withAlpha(palette.blue500, 0.15),
  primaryContrast: '#ffffff',

  secondary: palette.surfaceAlt,
  secondaryHover: palette.raised,
  secondaryContrast: palette.text,

  accent: palette.blue400,
  accentSubtle: withAlpha(palette.blue400, 0.12),

  // Status — the review palette: merged, open, changes requested.
  success: palette.green500,
  successSubtle: withAlpha(palette.green500, 0.15),
  warning: palette.yellow500,
  warningSubtle: withAlpha(palette.yellow500, 0.15),
  danger: palette.red500,
  dangerSubtle: withAlpha(palette.red500, 0.15),
  info: palette.blue500,
  infoSubtle: withAlpha(palette.blue500, 0.15),

  // Text
  textPrimary: palette.text,
  textSecondary: palette.textSoft,
  textMuted: palette.muted,
  textDisabled: palette.faint,
  textInverse: palette.canvas,
  textLink: palette.blue400,
  textOnPrimary: '#ffffff',

  // Lines — load-bearing in this theme.
  border: palette.border,
  borderStrong: palette.borderStrong,
  borderSubtle: palette.borderMuted,
  borderFocus: palette.blue500,
  divider: palette.borderMuted,

  // Data-viz series — insights graphs and contribution charts.
  chart: [
    palette.blue500,
    palette.green500,
    palette.purple500,
    palette.yellow500,
    palette.red500,
    palette.muted,
  ],
};

/**
 * Light scheme — the same interface under day settings. Same token names,
 * inverted values, so a deck can flip without leaving the design language.
 */
const lightColors = mergeTokens(colors, {
  background: palette.lightCanvas,
  backgroundSubtle: palette.lightSubtle,
  surface: palette.lightCanvas,
  surfaceElevated: palette.lightSubtle,
  surfaceSunken: palette.lightSubtle,
  surfaceHover: palette.lightSurfaceAlt,
  overlay: 'rgba(31, 35, 40, 0.55)',

  primary: '#0969da',
  primaryHover: '#0a6fd8',
  primaryActive: '#0550ae',
  primarySubtle: withAlpha('#0969da', 0.10),

  secondary: palette.lightSubtle,
  secondaryHover: palette.lightSurfaceAlt,
  secondaryContrast: palette.lightText,

  accent: '#0969da',
  accentSubtle: withAlpha('#0969da', 0.10),

  success: palette.green700,
  successSubtle: withAlpha(palette.green700, 0.10),
  warning: '#9a6700',
  warningSubtle: withAlpha('#9a6700', 0.10),
  danger: '#cf222e',
  dangerSubtle: withAlpha('#cf222e', 0.10),
  info: '#0969da',
  infoSubtle: withAlpha('#0969da', 0.10),

  textPrimary: palette.lightText,
  textSecondary: '#3d444d',
  textMuted: palette.lightMuted,
  textDisabled: '#818b98',
  textInverse: palette.lightCanvas,
  textLink: '#0969da',

  border: palette.lightBorder,
  borderStrong: '#b7bfc7',
  borderSubtle: '#e5e9ee',
  borderFocus: '#0969da',
  divider: '#e5e9ee',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, ' +
    'Arial, sans-serif',
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Weight 600 tops out the scale —
 * hierarchy comes from size and rules, not from heavy type. Scale everything
 * with `utilities.scaleType(factor)` for other canvas sizes.
 */
const typography = {
  fontFamily: fontStacks,

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  display: {
    fontFamily: fontStacks.sans,
    fontSize: '76px',
    fontWeight: 600,
    letterSpacing: '-0.022em',
    lineHeight: 1.14,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '48px',
    fontWeight: 600,
    letterSpacing: '-0.016em',
    lineHeight: 1.22,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.008em',
    lineHeight: 1.34,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '20px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.62,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 400,
    letterSpacing: '0.004em',
    lineHeight: 1.45,
  },
  /** Code blocks, diffs, terminal output, inline literals. */
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.55,
  },

  /** Section label — file-path and breadcrumb scale. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.06em',
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
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '56px',
  '2xl': '88px',

  /** Default slide padding — container margins, not marketing whitespace. */
  slidePadding: '88px',
  sectionGap: '56px',
  stackGap: '20px',
  inlineGap: '8px',
};

/* ============================================================================
 * 5. Radius — 6–10px. Nothing rounder except true pills (labels, avatars).
 * ========================================================================= */

const radius = {
  xs: '3px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — reserved for things that actually float.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 0 rgba(1, 4, 9, 0.5)',
  md: '0 3px 6px rgba(1, 4, 9, 0.45)',
  lg: '0 8px 24px rgba(1, 4, 9, 0.45)',
  xl: '0 12px 40px rgba(1, 4, 9, 0.5)',

  /** Inset top highlight — used on raised buttons only, and barely. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  focus: `0 0 0 3px ${withAlpha(palette.blue500, 0.4)}`,
  glow: `0 0 0 1px ${withAlpha(palette.blue500, 0.5)}`,
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
 * 8. Gradients — minimal by mandate. Most are a single quiet step.
 * ========================================================================= */

const gradients = {
  /** Canvas wash — inset black lifting to canvas. Barely perceptible. */
  aurora: `linear-gradient(180deg, ${palette.black} 0%, ${palette.canvas} 46%, ${palette.canvas} 100%)`,

  /** Faint blue pool behind a title. Low alpha on purpose. */
  halo:
    `radial-gradient(110% 70% at 50% -12%, ${withAlpha(palette.blue500, 0.10)} 0%, ` +
    'rgba(13, 17, 23, 0) 62%)',

  /** Bottom-left tint — pairs with `halo` without competing. */
  ember:
    `radial-gradient(60% 50% at 4% 100%, ${withAlpha(palette.purple500, 0.07)} 0%, ` +
    'rgba(13, 17, 23, 0) 58%)',

  /** One-step lift for panel headers (the file-header bar in a repo view). */
  surfaceSheen: `linear-gradient(180deg, ${palette.surfaceAlt} 0%, ${palette.surface} 100%)`,

  /** Fill for the primary action — flat blue with a single darkening step. */
  brand: `linear-gradient(180deg, ${palette.blue500} 0%, ${palette.blue600} 100%)`,

  /** Gradient text — apply with background-clip: text. Kept nearly tonal. */
  text: `linear-gradient(96deg, ${palette.text} 0%, ${palette.textSoft} 62%, ${palette.blue400} 100%)`,

  /** Hairline that fades at both ends — the section rule. */
  ruleFade:
    'linear-gradient(90deg, rgba(48, 54, 61, 0) 0%, rgba(48, 54, 61, 1) 50%, ' +
    'rgba(48, 54, 61, 0) 100%)',

  /** Bottom fade for truncated diffs, long logs and overflowing tables. */
  fadeOut: `linear-gradient(180deg, rgba(13, 17, 23, 0) 0%, ${palette.canvas} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   default slides, issues, docs        → canvas
 *   title and section openers           → hero
 *   chapter breaks                      → aurora
 *   dashboards, insights widgets        → dotGrid
 *   architecture and PR timelines       → lineGrid
 *   code blocks, tables, quote blocks   → panel
 *   full-bleed screenshots and figures  → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23e6edf3' fill-opacity='0.06'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%23e6edf3' " +
  "stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — deep charcoal. */
  canvas: { background: colors.background },

  /** Title and section openers: faint blue pool, faint corner tint. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Chapter break — vertical canvas wash. */
  aurora: { background: gradients.aurora },

  /** Dashboards and insights widgets — dotted field for chart backdrops. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Architecture diagrams and pull-request timelines. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Code blocks, markdown tables and blockquotes — one step above canvas. */
  panel: { background: colors.surface },

  /** Full-bleed figure scrim so captions stay legible over screenshots. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(1, 4, 9, 0.25) 0%, rgba(1, 4, 9, 0.88) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons — GitHub button anatomy: 1px border, small radius, tiny lift.
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '16px',
  fontWeight: typography.weight.semibold,
  letterSpacing: '0em',
  lineHeight: 1,
  padding: '11px 18px',
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
    sm: { fontSize: '14px', padding: '7px 13px', borderRadius: radius.md },
    md: { fontSize: '16px', padding: '11px 18px', borderRadius: radius.md },
    lg: { fontSize: '18px', padding: '14px 24px', borderRadius: radius.lg },
  },

  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: `1px solid ${withAlpha('#ffffff', 0.1)}`,
    boxShadow: shadows.hairline,
    hover: { background: colors.primaryHover },
    active: { background: colors.primaryActive, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: withAlpha(palette.blue600, 0.55),
      color: 'rgba(255, 255, 255, 0.6)',
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  /** The default GitHub button — the one on every repo page. */
  secondary: {
    ...buttonBase,
    background: colors.secondary,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.hairline,
    hover: { background: colors.surfaceHover, border: `1px solid ${colors.borderStrong}` },
    active: { background: colors.surface, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surface,
      color: colors.textDisabled,
      border: `1px solid ${colors.borderSubtle}`,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  /** Invisible until touched — toolbar and overflow actions. */
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
 * 11. Cards — bordered boxes. Issue cards, file headers, insight widgets.
 * ========================================================================= */

const cards = {
  /** Standard bordered box — issues, PR bodies, docs sections. */
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Reserved for things that float — menus, popovers, hovercards. */
  elevated: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Code block / table body — inset, ruled, no lift. */
  flat: {
    background: colors.surfaceSunken,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textSecondary,
  },

  /**
   * Kept for API parity. This theme rejects blur, so the "glass" variant is an
   * opaque overlay panel for content sitting on a screenshot or scrim.
   */
  glass: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /** Blockquote / callout — accent rule on the leading edge. */
  accent: {
    background: colors.primarySubtle,
    border: `1px solid ${withAlpha(palette.blue500, 0.35)}`,
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — a border change and a 1px lift. */
  hover: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.sm,
  },
};

/* ============================================================================
 * 12. Motion — 150–220ms, ease, opacity-led. No springs, no overshoot.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 60,
    fast: 120,
    normal: 180,
    slow: 220,
    slower: 300,
  },

  easing: {
    standard: 'ease',
    entrance: 'ease-out',
    exit: 'ease-in',
    /** Kept for API parity — mapped to plain ease; this theme has no springs. */
    spring: 'ease',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 160,
    easing: 'ease',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 200,
    easing: 'ease-out',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 200,
    easing: 'ease-out',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(10px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 200,
    easing: 'ease-out',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.995)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 180,
    easing: 'ease-out',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(2px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 220,
    easing: 'ease-out',
  },

  /** Sequencing for lists, diff hunks and timeline events. */
  stagger: {
    step: 40,
    initialDelay: 60,
    maxItems: 16,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fade',
    duration: 180,
    easing: 'ease',
  },

  /** Honour prefers-reduced-motion: collapse everything to a plain fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 100,
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
  /** Matches the width of a wide repo container. */
  maxContentWidth: '1280px',
  columnGap: spacing.md,
  rowGap: spacing.md,
  grid: { columns: 12, gutter: '24px' },
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
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#2f81f7' }
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
  id: 'github-dark',
  name: 'GitHub Dark',
  description:
    'Developer-first dark theme: charcoal canvas, load-bearing borders, ' +
    'blue accent, mono code surfaces, 6–10px radii, 150–220ms motion.',
  ai: {
  summary:
    "Developer-first presentations for programming, software engineering, APIs, system architecture, and technical documentation.",

  bestFor: [
    "Programming Tutorials",
    "Software Engineering",
    "System Architecture",
    "APIs",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "DevOps",
    "Cloud Computing",
    "Database Design",
    "Open Source Projects",
    "Technical Documentation"
  ],

  avoidFor: [
    "Marketing Presentations",
    "Product Launches",
    "Business Reports",
    "Financial Dashboards",
    "Storytelling Presentations"
  ],

  keywords: [
    "programming",
    "coding",
    "software",
    "developer",
    "engineering",
    "api",
    "backend",
    "frontend",
    "full stack",
    "database",
    "sql",
    "javascript",
    "python",
    "java",
    "c++",
    "react",
    "nextjs",
    "node",
    "docker",
    "kubernetes",
    "devops",
    "github",
    "git",
    "architecture",
    "system design",
    "microservices"
  ],

  style: [
    "Developer",
    "Technical",
    "Modern",
    "Professional",
    "Dark",
    "Code Focused",
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

export default deepFreeze(theme);
export { withAlpha, colors, typography, spacing, radius, shadows, gradients, motion };
