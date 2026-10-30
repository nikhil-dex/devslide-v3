/**
 * AIRDeck Theme — "Aurora"
 * =============================================================================
 * AIRDeck's flagship premium theme: a deep navy stage lit from above by a
 * violet–blue–cyan aurora, with large, softly floating surfaces. Tokens only:
 * no DOM, no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Deep navy-charcoal canvas (#0a0c16) — depth, not darkness.
 *   • One continuous violet → indigo → cyan ramp. Three hues, never more.
 *   • Cards float: large radius, wide soft shadow, a hairline border only.
 *   • Depth comes from shadow and tone, never from blur — no frosted glass.
 *   • Type is large and airy; padding is deliberately oversized.
 *   • Motion is 220–350ms, ease-out, opacity-led, with a 1-2px lift at most.
 *
 * Extending
 * ---------
 *   import aurora from './themes/aurora.js';
 *   const auroraTeal = aurora.utilities.extend({
 *     colors: { primary: '#3fb8c9', accent: '#7ee7d8' },
 *   });
 *
 * @module themes/aurora
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#7b6cf6'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(123, 108, 246, 0.5)'
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
  // Canvas ladder — navy-charcoal, warm enough to avoid looking printed.
  abyss: '#06070f',
  canvas: '#0a0c16',
  surface: '#121523',
  surfaceAlt: '#1a1f33',
  raised: '#222842',

  // Text ladder.
  white: '#ffffff',
  text: '#f2f4fb',
  textSoft: '#c8cee1',
  muted: '#9299b0',
  subtle: '#6d7488',
  faint: '#4d5468',

  // The aurora ramp: violet → indigo → cyan. Nothing outside these three.
  violet300: '#c3b6ff',
  violet400: '#a493fb',
  violet500: '#8b7cf8',
  violet600: '#7b6cf6',
  violet700: '#6354dd',
  indigo500: '#5b8def',
  indigo600: '#4a72d8',
  cyan300: '#8ff0f6',
  cyan400: '#67e0ec',
  cyan500: '#4fd0e2',

  // Supporting hues — kept in the same family so nothing reads as rainbow.
  mint400: '#6fdcb8',
  amber400: '#e8bd76',
  rose400: '#f08fa6',

  // Light-scheme primitives (used only by the light counterpart).
  lightCanvas: '#f6f7fc',
  lightSurface: '#ffffff',
  lightSunken: '#eceef7',
  lightText: '#121527',
  lightMuted: '#5d6379',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.canvas,
  backgroundSubtle: palette.abyss,
  surface: palette.surface,
  surfaceElevated: palette.surfaceAlt,
  surfaceSunken: palette.abyss,
  surfaceHover: palette.raised,
  overlay: 'rgba(6, 7, 15, 0.72)',

  // Brand
  primary: palette.violet600,
  primaryHover: palette.violet500,
  primaryActive: palette.violet700,
  primarySubtle: withAlpha(palette.violet500, 0.14),
  primaryContrast: palette.white,

  secondary: palette.surfaceAlt,
  secondaryHover: palette.raised,
  secondaryContrast: palette.text,

  accent: palette.cyan400,
  accentSubtle: withAlpha(palette.cyan400, 0.12),

  // Status — desaturated to sit inside the aurora palette.
  success: palette.mint400,
  successSubtle: withAlpha(palette.mint400, 0.13),
  warning: palette.amber400,
  warningSubtle: withAlpha(palette.amber400, 0.13),
  danger: palette.rose400,
  dangerSubtle: withAlpha(palette.rose400, 0.13),
  info: palette.indigo500,
  infoSubtle: withAlpha(palette.indigo500, 0.13),

  // Text
  textPrimary: palette.text,
  textSecondary: palette.textSoft,
  textMuted: palette.muted,
  textDisabled: palette.faint,
  textInverse: palette.canvas,
  textLink: palette.violet400,
  textOnPrimary: palette.white,

  // Lines — hairlines only; shadow does the separating.
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.13)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  borderFocus: withAlpha(palette.violet400, 0.65),
  divider: 'rgba(255, 255, 255, 0.06)',

  // Data-viz series — analytics panels, ordered along the aurora ramp.
  chart: [
    palette.violet500,
    palette.indigo500,
    palette.cyan400,
    palette.violet300,
    palette.mint400,
    palette.amber400,
  ],
};

/**
 * Light scheme — the same identity at daylight. Same token names, inverted
 * values, so a deck can flip a slide without leaving the design language.
 */
const lightColors = mergeTokens(colors, {
  background: palette.lightCanvas,
  backgroundSubtle: palette.lightSunken,
  surface: palette.lightSurface,
  surfaceElevated: palette.lightSurface,
  surfaceSunken: palette.lightSunken,
  surfaceHover: '#e4e7f3',
  overlay: 'rgba(18, 21, 39, 0.5)',

  primary: palette.violet700,
  primaryHover: palette.violet600,
  primaryActive: '#54479f',
  primarySubtle: withAlpha(palette.violet600, 0.10),

  secondary: palette.lightSunken,
  secondaryHover: '#e4e7f3',
  secondaryContrast: palette.lightText,

  accent: '#2fa9bd',
  accentSubtle: withAlpha('#2fa9bd', 0.12),

  success: '#2f9e78',
  successSubtle: withAlpha('#2f9e78', 0.12),
  warning: '#b5822c',
  warningSubtle: withAlpha('#b5822c', 0.12),
  danger: '#cf5570',
  dangerSubtle: withAlpha('#cf5570', 0.12),
  info: palette.indigo600,
  infoSubtle: withAlpha(palette.indigo600, 0.12),

  textPrimary: palette.lightText,
  textSecondary: '#3b4157',
  textMuted: palette.lightMuted,
  textDisabled: '#8b91a5',
  textInverse: palette.white,
  textLink: palette.violet700,

  border: 'rgba(18, 21, 39, 0.09)',
  borderStrong: 'rgba(18, 21, 39, 0.15)',
  borderSubtle: 'rgba(18, 21, 39, 0.06)',
  borderFocus: withAlpha(palette.violet600, 0.5),
  divider: 'rgba(18, 21, 39, 0.08)',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, ' +
    '"Helvetica Neue", Arial, "Noto Sans", sans-serif',
  mono:
    'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Display type is stage-scale:
 * one idea per slide, set large and tracked tight. Scale everything with
 * `utilities.scaleType(factor)` for other canvas sizes.
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
    fontSize: '116px',
    fontWeight: 600,
    letterSpacing: '-0.034em',
    lineHeight: 1.04,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '68px',
    fontWeight: 600,
    letterSpacing: '-0.026em',
    lineHeight: 1.1,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '34px',
    fontWeight: 500,
    letterSpacing: '-0.012em',
    lineHeight: 1.3,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '-0.003em',
    lineHeight: 1.7,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '15px',
    fontWeight: 400,
    letterSpacing: '0.008em',
    lineHeight: 1.5,
  },
  /** Premium editor feel — generous leading inside dark code surfaces. */
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '18px',
    fontWeight: 400,
    letterSpacing: '-0.002em',
    lineHeight: 1.7,
  },

  /** Section label above a display heading — wide tracking, set in accent. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.14em',
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
  md: '32px',
  lg: '48px',
  xl: '80px',
  '2xl': '128px',

  /** Default slide padding — the whitespace is the premium signal. */
  slidePadding: '128px',
  sectionGap: '88px',
  stackGap: '28px',
  inlineGap: '12px',
};

/* ============================================================================
 * 5. Radius — large and confident; cards read as floating objects.
 * ========================================================================= */

const radius = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '22px',
  xl: '32px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — wide, soft, navy-tinted. Elevation, never weight.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 2px 8px rgba(4, 6, 16, 0.34)',
  md: '0 8px 24px rgba(4, 6, 16, 0.40), 0 2px 6px rgba(4, 6, 16, 0.28)',
  lg: '0 20px 56px rgba(4, 6, 16, 0.48), 0 6px 16px rgba(4, 6, 16, 0.32)',
  xl: '0 40px 96px rgba(4, 6, 16, 0.56), 0 12px 32px rgba(4, 6, 16, 0.36)',

  /** Inset top highlight — the edge light that sells a floating surface. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.07)',
  focus: `0 0 0 4px ${withAlpha(palette.violet500, 0.34)}`,
  /** Timeline indicators and active states. */
  glow: `0 0 28px ${withAlpha(palette.violet500, 0.42)}, 0 0 8px ${withAlpha(palette.cyan400, 0.26)}`,
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
 * 8. Gradients — one ramp, three hues, low alpha.
 * ========================================================================= */

const gradients = {
  /** Signature aurora: violet → indigo → cyan, laid diagonally over navy. */
  aurora:
    `linear-gradient(148deg, ${withAlpha(palette.violet600, 0.34)} 0%, ` +
    `${withAlpha(palette.indigo500, 0.20)} 38%, ${withAlpha(palette.cyan400, 0.14)} 62%, ` +
    `${palette.canvas} 92%)`,

  /** Overhead light for title slides — the curtain above the stage. */
  halo:
    `radial-gradient(130% 90% at 50% -22%, ${withAlpha(palette.violet500, 0.30)} 0%, ` +
    `${withAlpha(palette.indigo500, 0.12)} 40%, rgba(10, 12, 22, 0) 72%)`,

  /** Low cyan bloom from the corner — pairs with `halo`, never competes. */
  ember:
    `radial-gradient(84% 72% at 6% 104%, ${withAlpha(palette.cyan500, 0.20)} 0%, ` +
    'rgba(10, 12, 22, 0) 64%)',

  /** Top-light sheen for floating panels and dashboard widgets. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 72%)',

  /** Premium button fill — violet into indigo, never into cyan. */
  brand: `linear-gradient(135deg, ${palette.violet500} 0%, ${palette.indigo600} 100%)`,

  /** Gradient text — apply with background-clip: text. */
  text:
    `linear-gradient(94deg, ${palette.white} 0%, ${palette.violet300} 52%, ` +
    `${palette.cyan300} 100%)`,

  /** Hairline that fades at both ends — table and section rules. */
  ruleFade:
    'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.14) 50%, ' +
    'rgba(255, 255, 255, 0) 100%)',

  /** Bottom fade for cropped media, long code blocks and overflowing tables. */
  fadeOut: `linear-gradient(180deg, rgba(10, 12, 22, 0) 0%, ${palette.canvas} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   content slides, comparison splits   → canvas
 *   title and section openers           → hero
 *   chapter breaks, closing slide       → aurora
 *   dashboards and analytics panels     → dotGrid
 *   vertical timelines, architecture    → lineGrid
 *   code blocks, tables, quote blocks   → panel
 *   full-bleed imagery and product shots → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' " +
  "height='40'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' " +
  "height='80'%3E%3Cpath d='M80 0H0V80' fill='none' stroke='%23ffffff' " +
  "stroke-opacity='0.035' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — deep navy. */
  canvas: { background: colors.background },

  /** Title and section openers: overhead halo plus a low cyan bloom. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Chapter breaks and the closing slide — the full aurora wash. */
  aurora: { background: `${gradients.aurora}, ${colors.background}` },

  /** Dashboards and analytics panels — dotted field behind widgets. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Timelines, architecture and comparison layouts. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Floating panel fill — code blocks, tables, callouts. */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.surface}`,
  },

  /** Full-bleed media scrim so text stays legible over product shots. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(6, 7, 15, 0.20) 0%, rgba(6, 7, 15, 0.86) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '17px',
  fontWeight: typography.weight.medium,
  letterSpacing: '-0.004em',
  lineHeight: 1,
  padding: '15px 30px',
  borderRadius: radius.pill,
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
    sm: { fontSize: '15px', padding: '11px 20px', borderRadius: radius.pill },
    md: { fontSize: '17px', padding: '15px 30px', borderRadius: radius.pill },
    lg: { fontSize: '19px', padding: '19px 40px', borderRadius: radius.pill },
  },

  primary: {
    ...buttonBase,
    background: gradients.brand,
    color: colors.textOnPrimary,
    border: `1px solid ${withAlpha(palette.violet400, 0.42)}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    hover: { background: `linear-gradient(135deg, ${palette.violet400} 0%, ${palette.indigo500} 100%)`, boxShadow: shadows.lg },
    active: { background: palette.violet700, boxShadow: shadows.sm },
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
    background: colors.surfaceElevated,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.sm}, ${shadows.hairline}`,
    hover: {
      background: colors.surfaceHover,
      border: `1px solid ${colors.borderStrong}`,
      boxShadow: shadows.md,
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

  ghost: {
    ...buttonBase,
    background: 'transparent',
    color: colors.textSecondary,
    border: '1px solid transparent',
    boxShadow: 'none',
    hover: { background: 'rgba(255, 255, 255, 0.05)', color: colors.textPrimary },
    active: { background: 'rgba(255, 255, 255, 0.08)' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — floating objects: large radius, wide shadow, hairline edge.
 * ========================================================================= */

const cards = {
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Dashboard widgets and hero cards — the highest float in the theme. */
  elevated: {
    background: `${gradients.surfaceSheen}, ${colors.surfaceElevated}`,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.xl}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Code blocks and table bodies — inset, quiet, no lift. */
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
   * variant is a solid, deeply tinted overlay panel for content over imagery.
   */
  glass: {
    background: 'rgba(18, 21, 35, 0.94)',
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /** Accent card — one per slide, maximum. Lit from the top-left. */
  accent: {
    background: `${gradients.halo}, ${colors.surfaceElevated}`,
    border: `1px solid ${withAlpha(palette.violet500, 0.34)}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — the tiny float. */
  hover: {
    background: colors.surfaceHover,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.xl}, ${shadows.hairline}`,
  },
};

/* ============================================================================
 * 12. Motion — 220–350ms, ease-out, opacity-led. No springs, no overshoot.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 260,
    slow: 340,
    slower: 480,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
    /** Kept for API parity — smooth ease-out; this theme has no overshoot. */
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 260,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(18px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 340,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-18px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 340,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(28px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 340,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.985)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 300,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(6px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 350,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  /** Sequencing for lists, widget grids and timeline events. */
  stagger: {
    step: 80,
    initialDelay: 100,
    maxItems: 12,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fadeUp',
    duration: 340,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  /** Honour prefers-reduced-motion: collapse everything to a plain fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 140,
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
  maxContentWidth: '1440px',
  columnGap: spacing.lg,
  rowGap: spacing.lg,
  grid: { columns: 12, gutter: '40px' },
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
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#7b6cf6' }
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
  id: 'aurora',
  name: 'Aurora',
  description:
    'Flagship keynote theme: deep navy canvas, violet-indigo-cyan aurora ' +
    'lighting, floating large-radius cards, oversized whitespace, 220–350ms motion.',
  ai: {
  summary:
    "Premium futuristic presentations for Artificial Intelligence, innovation, and emerging technologies.",

  bestFor: [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "Robotics",
    "Computer Vision",
    "Future Technology",
    "Innovation",
    "Emerging Technologies",
    "Digital Transformation",
    "AI Startups",
    "Research Showcases"
  ],

  avoidFor: [
    "Financial Reports",
    "Legal Documentation",
    "Traditional Business Reports",
    "Academic Thesis Defense",
    "Programming Tutorials",
    "Startup pitches",
    "Investor presentations",
    "Business strategy",
    "Corporate reports"
  ],

  keywords: [
    "ai",
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "llm",
    "gpt",
    "generative ai",
    "robotics",
    "automation",
    "innovation",
    "future",
    "technology",
    "computer vision",
    "neural network",
    "data science",
    "intelligent systems"
  ],

  style: [
    "Futuristic",
    "Premium",
    "Elegant",
    "Modern",
    "Innovative",
    "Visionary",
    "Technology Focused"
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
