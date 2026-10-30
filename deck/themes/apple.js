/**
 * AIRDeck Theme — "Apple"
 * =============================================================================
 * A light-first, keynote-grade design language inspired by Apple's product
 * pages and stage presentations. Tokens only: no DOM, no components, no
 * animations. The AIRDeck compiler renders slides from these values.
 *
 * API CONTRACT
 * ------------
 * This module exposes exactly the same public shape as `themes/linear.js`:
 * identical top-level keys, identical utility function names and signatures,
 * identical CSS variable namespace. Only the token *values* differ, plus one
 * additive `decorations` group (and its `getDecoration` helper) — nothing was
 * renamed or removed, so the compiler can swap themes without branching.
 *
 * Design intent
 * -------------
 *   • Off-white canvas (#f5f5f7) as the default; pure white for product slides.
 *   • Dark graphite / space black for hero and cinematic moments.
 *   • One soft blue accent, used for a single action per slide.
 *   • Very large, tightly tracked headings; body type stays comfortable.
 *   • Depth comes from soft, wide, low-opacity shadows — never from lines.
 *   • Glass surfaces are for floating panels over photography only.
 *
 * Extending
 * ---------
 *   import apple from './themes/apple.js';
 *   const appleDark = apple.utilities.extend({ mode: 'dark' });
 *
 * @module themes/apple
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Shared AIRDeck custom-property namespace. Intentionally identical across all
 * themes so compiled slide CSS stays theme-agnostic — do not rename per theme.
 */
const VAR_PREFIX = '--ld';

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#0071e3'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(0, 113, 227, 0.5)'
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
  // Lights — the keynote canvas range.
  white: '#ffffff',
  offWhite: '#fbfbfd',
  mist: '#f5f5f7',
  fog: '#eeeef0',
  silver: '#e8e8ed',
  cloud: '#d2d2d7',

  // Greys — text and quiet UI.
  grey400: '#a1a1a6',
  grey500: '#86868b',
  grey600: '#6e6e73',
  grey700: '#424245',

  // Darks — graphite through space black.
  charcoal: '#333336',
  graphite: '#2c2c2e',
  slate: '#1d1d1f',
  ink: '#161617',
  spaceBlack: '#000000',

  // Soft blue accent family.
  blue300: '#7ab6f5',
  blue400: '#2997ff',
  blue500: '#0071e3',
  blue600: '#0062c4',
  blue700: '#004f9e',

  // Supporting hues — muted, never saturated.
  teal400: '#5ac8b8',
  green400: '#34a853',
  amber400: '#d99a2b',
  red400: '#d0453b',
  indigo400: '#8e8ed6',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.mist,
  backgroundSubtle: palette.offWhite,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceSunken: palette.fog,
  surfaceHover: palette.silver,
  overlay: 'rgba(245, 245, 247, 0.72)',

  // Brand
  primary: palette.blue500,
  primaryHover: '#0077ed',
  primaryActive: palette.blue600,
  primarySubtle: withAlpha(palette.blue500, 0.08),
  primaryContrast: palette.white,

  secondary: palette.silver,
  secondaryHover: palette.cloud,
  secondaryContrast: palette.slate,

  accent: palette.blue400,
  accentSubtle: withAlpha(palette.blue400, 0.10),

  // Status
  success: palette.green400,
  successSubtle: withAlpha(palette.green400, 0.10),
  warning: palette.amber400,
  warningSubtle: withAlpha(palette.amber400, 0.10),
  danger: palette.red400,
  dangerSubtle: withAlpha(palette.red400, 0.10),
  info: palette.blue500,
  infoSubtle: withAlpha(palette.blue500, 0.08),

  // Text
  textPrimary: palette.slate,
  textSecondary: palette.grey700,
  textMuted: palette.grey600,
  textDisabled: palette.grey500,
  textInverse: palette.white,
  textLink: palette.blue500,
  textOnPrimary: palette.white,

  // Lines — hairline and almost invisible; depth comes from shadow instead.
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.14)',
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
  borderFocus: withAlpha(palette.blue500, 0.5),
  divider: 'rgba(0, 0, 0, 0.07)',

  // Data-viz series — ordered for charts and diagrams.
  chart: [
    palette.blue500,
    palette.slate,
    palette.teal400,
    palette.grey500,
    palette.indigo400,
    palette.amber400,
  ],
};

/**
 * Dark scheme — the keynote stage. Same token names, inverted values, used for
 * hero slides, product reveals and full-bleed photography.
 */
const darkColors = mergeTokens(colors, {
  background: palette.spaceBlack,
  backgroundSubtle: palette.ink,
  surface: palette.slate,
  surfaceElevated: palette.graphite,
  surfaceSunken: palette.ink,
  surfaceHover: palette.charcoal,
  overlay: 'rgba(0, 0, 0, 0.72)',

  primary: palette.blue400,
  primaryHover: palette.blue300,
  primaryActive: palette.blue500,
  primarySubtle: withAlpha(palette.blue400, 0.14),

  secondary: palette.graphite,
  secondaryHover: palette.charcoal,
  secondaryContrast: palette.mist,

  textPrimary: palette.mist,
  textSecondary: palette.cloud,
  textMuted: palette.grey500,
  textDisabled: palette.grey600,
  textInverse: palette.slate,
  textLink: palette.blue400,

  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderFocus: withAlpha(palette.blue400, 0.6),
  divider: 'rgba(255, 255, 255, 0.08)',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", ' +
    '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono:
    'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Headings run deliberately
 * large — a keynote slide carries one idea. Scale the whole set with
 * `utilities.scaleType(factor)` if the compiler renders at another size.
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
    fontSize: '120px',
    fontWeight: 600,
    letterSpacing: '-0.028em',
    lineHeight: 1.05,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '72px',
    fontWeight: 600,
    letterSpacing: '-0.022em',
    lineHeight: 1.08,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '38px',
    fontWeight: 500,
    letterSpacing: '-0.012em',
    lineHeight: 1.26,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '-0.002em',
    lineHeight: 1.62,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '15px',
    fontWeight: 400,
    letterSpacing: '0.004em',
    lineHeight: 1.45,
  },
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '18px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.6,
  },

  /** Accent line above a heading — Apple sets these in the brand blue. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '21px',
    fontWeight: 600,
    letterSpacing: '-0.004em',
    lineHeight: 1.24,
    textTransform: 'none',
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

  /** Default slide padding — whitespace is the loudest element in this theme. */
  slidePadding: '128px',
  sectionGap: '96px',
  stackGap: '32px',
  inlineGap: '16px',
};

/* ============================================================================
 * 5. Radius
 * ========================================================================= */

const radius = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — wide, soft, low-opacity. Diffuse light, never a hard edge.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
  xl: '0 28px 72px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.05)',

  /** Inset top highlight — keeps glass panels from reading as flat fills. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  focus: `0 0 0 4px ${withAlpha(palette.blue500, 0.28)}`,
  glow: `0 0 48px ${withAlpha(palette.blue400, 0.18)}`,
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
 * 8. Gradients — near-invisible. If you can name the colors, it's too strong.
 * ========================================================================= */

const gradients = {
  /** Signature light wash — white settling into mist. */
  aurora:
    `linear-gradient(180deg, ${palette.white} 0%, ${palette.offWhite} 45%, ` +
    `${palette.mist} 100%)`,

  /** Overhead studio light for hero slides. */
  halo:
    'radial-gradient(120% 80% at 50% -10%, rgba(255, 255, 255, 0.95) 0%, ' +
    `${withAlpha(palette.blue400, 0.07)} 46%, rgba(245, 245, 247, 0) 74%)`,

  /** Bottom-corner ambient tint — pairs with `halo` without competing. */
  ember:
    `radial-gradient(70% 60% at 12% 100%, ${withAlpha(palette.blue300, 0.10)} 0%, ` +
    'rgba(245, 245, 247, 0) 64%)',

  /** Faint sheen for card and panel fills. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 100%)',

  /** Brand fill for primary buttons and badges — flat enough to read as solid. */
  brand: `linear-gradient(180deg, #0077ed 0%, ${palette.blue500} 100%)`,

  /** Gradient text — apply with background-clip: text. */
  text:
    `linear-gradient(96deg, ${palette.slate} 0%, ${palette.grey700} 52%, ` +
    `${palette.blue500} 100%)`,

  /** Hairline that fades at both ends. */
  ruleFade:
    'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.12) 50%, ' +
    'rgba(0, 0, 0, 0) 100%)',

  /** Bottom fade for cropped images and code blocks. */
  fadeOut: `linear-gradient(180deg, rgba(245, 245, 247, 0) 0%, ${palette.mist} 100%)`,

  /** Dark counterpart — graphite lifting off space black. */
  auroraDark:
    `linear-gradient(180deg, ${palette.slate} 0%, ${palette.ink} 55%, ` +
    `${palette.spaceBlack} 100%)`,

  /** Stage light for dark hero slides. */
  haloDark:
    `radial-gradient(110% 80% at 50% -8%, ${withAlpha(palette.blue400, 0.16)} 0%, ` +
    `${withAlpha(palette.blue500, 0.05)} 44%, rgba(0, 0, 0, 0) 72%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23000000' fill-opacity='0.05'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%23000000' " +
  "stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — soft gray. */
  canvas: { background: colors.background },

  /** Light hero: overhead halo plus a corner tint. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Vertical wash for section dividers. */
  aurora: { background: gradients.aurora },

  /** Technical slides — architecture, flows, data. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Panel fill for content blocks sitting on the canvas. */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.surface}`,
  },

  /** Full-bleed media scrim so text stays legible over photography. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.72) 100%)',
  },

  // --- Named canvases requested for this theme -----------------------------

  /** Pure white — product shots and spec slides. */
  pureWhite: { background: palette.white },

  /** Soft gray — the default body canvas. */
  softGray: { background: palette.mist },

  /** Dark graphite — quiet dark slides that still read as a document. */
  darkGraphite: { background: palette.slate },

  /** Dark hero — space black with a stage light overhead. */
  darkHero: {
    background: `${gradients.haloDark}, ${palette.spaceBlack}`,
  },

  /** Glass — frosted panel over photography or a gradient. */
  glass: {
    background: 'rgba(255, 255, 255, 0.62)',
    backdropFilter: 'saturate(180%) blur(28px)',
    border: `1px solid ${colors.borderSubtle}`,
  },

  /** Gradient hero — the widest, softest wash in the theme. */
  gradientHero: {
    background:
      `radial-gradient(90% 70% at 78% 8%, ${withAlpha(palette.blue300, 0.16)} 0%, ` +
      'rgba(255, 255, 255, 0) 58%), ' +
      `radial-gradient(80% 70% at 12% 92%, ${withAlpha(palette.indigo400, 0.12)} 0%, ` +
      'rgba(255, 255, 255, 0) 60%), ' +
      `linear-gradient(180deg, ${palette.white} 0%, ${palette.mist} 100%)`,
  },
};

/* ============================================================================
 * 10. Buttons — pill-shaped, minimal, one accent action per slide
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '17px',
  fontWeight: typography.weight.regular,
  letterSpacing: '-0.002em',
  lineHeight: 1,
  padding: '14px 26px',
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
    sm: { fontSize: '15px', padding: '10px 18px', borderRadius: radius.pill },
    md: { fontSize: '17px', padding: '14px 26px', borderRadius: radius.pill },
    lg: { fontSize: '19px', padding: '18px 36px', borderRadius: radius.pill },
  },

  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: '1px solid transparent',
    boxShadow: 'none',
    hover: { background: colors.primaryHover },
    active: { background: colors.primaryActive },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.secondary,
      color: colors.textDisabled,
      cursor: 'not-allowed',
    },
  },

  secondary: {
    ...buttonBase,
    background: colors.surface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    hover: { background: colors.surfaceHover, boxShadow: shadows.md },
    active: { background: colors.surfaceSunken, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surfaceSunken,
      color: colors.textDisabled,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  ghost: {
    ...buttonBase,
    background: 'transparent',
    color: colors.textLink,
    border: '1px solid transparent',
    boxShadow: 'none',
    hover: { background: colors.primarySubtle },
    active: { background: withAlpha(palette.blue500, 0.14) },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — soft edges, minimal depth, glass where photography sits behind
 * ========================================================================= */

const cards = {
  base: {
    background: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  elevated: {
    background: colors.surfaceElevated,
    border: '1px solid transparent',
    boxShadow: shadows.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Flat card for dense grids — tone change only, no shadow. */
  flat: {
    background: colors.surfaceSunken,
    border: '1px solid transparent',
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Frosted panel over imagery or gradients. */
  glass: {
    background: 'rgba(255, 255, 255, 0.62)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backdropFilter: 'saturate(180%) blur(28px)',
    color: colors.textPrimary,
  },

  /** Accent card — one per slide, maximum. */
  accent: {
    background: `${gradients.halo}, ${colors.surface}`,
    border: `1px solid ${withAlpha(palette.blue500, 0.18)}`,
    boxShadow: shadows.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards. Merge onto any variant above. */
  hover: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.xl,
  },
};

/* ============================================================================
 * 12. Motion — descriptors only. Slow, smooth, opacity- and blur-led.
 *      No overshoot anywhere in this theme.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 120,
    fast: 260,
    normal: 460,
    slow: 720,
    slower: 1000,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.32, 0.72, 0, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    /** Kept for API parity — deliberately non-bouncy in this theme. */
    spring: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 620,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(24px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 820,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-24px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 820,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(40px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 820,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(1.03)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 900,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(14px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 1000,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },

  /** Sequencing for lists, grids and bullet reveals. */
  stagger: {
    step: 120,
    initialDelay: 160,
    maxItems: 10,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fade',
    duration: 720,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },

  /** Honour prefers-reduced-motion: collapse everything to a plain fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 160,
    stagger: { step: 0, initialDelay: 0 },
  },
};

/* ============================================================================
 * 13. Decorations — atmosphere tokens. Values only; the compiler places them.
 * ========================================================================= */

const decorations = {
  /** Soft bloom behind a product image or a headline. */
  softGlow: {
    background:
      `radial-gradient(circle at 50% 50%, ${withAlpha(palette.blue400, 0.18)} 0%, ` +
      'rgba(255, 255, 255, 0) 68%)',
    filter: 'blur(48px)',
    opacity: 0.9,
  },

  /** Frosted sheet for floating panels over photography. */
  glassOverlay: {
    background: 'rgba(255, 255, 255, 0.58)',
    backdropFilter: 'saturate(180%) blur(28px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: shadows.hairline,
  },

  /** Multi-point wash for full-bleed hero canvases. */
  meshGradient: {
    background:
      `radial-gradient(46% 42% at 18% 22%, ${withAlpha(palette.blue300, 0.20)} 0%, ` +
      'rgba(255, 255, 255, 0) 62%), ' +
      `radial-gradient(42% 46% at 82% 18%, ${withAlpha(palette.indigo400, 0.16)} 0%, ` +
      'rgba(255, 255, 255, 0) 60%), ' +
      `radial-gradient(52% 48% at 68% 88%, ${withAlpha(palette.teal400, 0.12)} 0%, ` +
      'rgba(255, 255, 255, 0) 64%), ' +
      `linear-gradient(180deg, ${palette.white} 0%, ${palette.mist} 100%)`,
    filter: 'blur(0px)',
  },

  /** Small drifting highlight — one per slide, off to a corner. */
  floatingLight: {
    width: '420px',
    height: '420px',
    borderRadius: radius.circle,
    background:
      `radial-gradient(circle, ${withAlpha(palette.white, 0.9)} 0%, ` +
      'rgba(255, 255, 255, 0) 70%)',
    filter: 'blur(60px)',
    opacity: 0.7,
  },

  /** Wide low-contrast pool of light behind content blocks. */
  ambientRadial: {
    background:
      'radial-gradient(60% 50% at 50% 40%, rgba(255, 255, 255, 0.85) 0%, ' +
      'rgba(245, 245, 247, 0) 72%)',
    opacity: 0.85,
  },

  /** Dark-stage counterparts. */
  softGlowDark: {
    background:
      `radial-gradient(circle at 50% 50%, ${withAlpha(palette.blue400, 0.26)} 0%, ` +
      'rgba(0, 0, 0, 0) 68%)',
    filter: 'blur(56px)',
    opacity: 0.85,
  },
  glassOverlayDark: {
    background: 'rgba(29, 29, 31, 0.58)',
    backdropFilter: 'saturate(180%) blur(28px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.10)',
  },

  /** Hairline rule that fades at both ends. */
  fadedRule: {
    height: '1px',
    background: gradients.ruleFade,
    border: 'none',
  },
};

/* ============================================================================
 * 14. Layout (slide geometry)
 * ========================================================================= */

const layout = {
  aspectRatio: '16 / 9',
  width: 1920,
  height: 1080,
  padding: spacing.slidePadding,
  maxContentWidth: '1320px',
  columnGap: spacing.xl,
  rowGap: spacing.lg,
  grid: { columns: 12, gutter: '40px' },
};

/* ============================================================================
 * 15. Utilities — same names and signatures as themes/linear.js
 * ========================================================================= */

const scheme = { light: colors, dark: darkColors };

const utilities = {
  withAlpha,

  /**
   * @param {'primary'|'secondary'|'muted'|'disabled'|'inverse'|'link'|'onPrimary'} [level]
   * @param {'light'|'dark'} [mode]
   */
  getTextColor(level = 'primary', mode = 'light') {
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
   * @param {'light'|'dark'} [mode]
   */
  getSurface(level = 'base', mode = 'light') {
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
   * Decoration token by name. Additive to the Linear API.
   * @param {'softGlow'|'glassOverlay'|'meshGradient'|'floatingLight'|'ambientRadial'|'fadedRule'} [name]
   * @param {'light'|'dark'} [mode] falls back to the light token when no dark variant exists
   */
  getDecoration(name = 'softGlow', mode = 'light') {
    if (mode === 'dark') {
      const darkKey = `${name}Dark`;
      if (decorations[darkKey]) return { ...decorations[darkKey] };
    }
    return { ...(decorations[name] || decorations.softGlow) };
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
  getScheme(mode = 'light') {
    return { ...(scheme[mode] || colors) };
  },

  /**
   * Flatten tokens into CSS custom properties for injection into a slide root.
   * Namespace matches themes/linear.js so compiled CSS is theme-agnostic.
   * @param {'light'|'dark'} [mode]
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#0071e3' }
   */
  cssVariables(mode = 'light') {
    const vars = {};
    const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

    for (const [key, value] of Object.entries(scheme[mode] || colors)) {
      if (typeof value === 'string') vars[`${VAR_PREFIX}-color-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(spacing)) {
      vars[`${VAR_PREFIX}-space-${kebab(String(key))}`] = value;
    }
    for (const [key, value] of Object.entries(radius)) {
      vars[`${VAR_PREFIX}-radius-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(shadows)) {
      vars[`${VAR_PREFIX}-shadow-${kebab(key)}`] = value;
    }
    for (const [key, value] of Object.entries(gradients)) {
      vars[`${VAR_PREFIX}-gradient-${kebab(key)}`] = value;
    }
    vars[`${VAR_PREFIX}-font-sans`] = fontStacks.sans;
    vars[`${VAR_PREFIX}-font-mono`] = fontStacks.mono;
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
 * 16. Theme export
 * ========================================================================= */

const theme = {
  id: 'apple',
  name: 'Apple',
  description:
    'Light-first keynote theme: off-white canvas, oversized headings, soft ' +
    'wide shadows, glass panels, near-invisible gradients, slow elegant motion.',
  ai: {
  summary:
    "Premium minimalist keynote presentations inspired by world-class product launches.",

  bestFor: [
    "Product Launches",
    "Keynote Presentations",
    "Product Showcases",
    "Design Presentations",
    "Innovation Talks",
    "Vision Decks",
    "Startup Launches",
    "Brand Storytelling"
  ],

  avoidFor: [
    "Financial Reports",
    "Analytics Dashboards",
    "Programming Tutorials",
    "Research Papers",
    "Dense Technical Documentation",
    "Investor decks",
    "Business plans",
    "Corporate strategy",
    "SaaS presentations"
  ],

  keywords: [
    "apple",
    "keynote",
    "premium",
    "minimal",
    "design",
    "product",
    "launch",
    "innovation",
    "vision",
    "branding",
    "elegant",
    "clean",
    "modern",
    "luxury",
    "presentation"
  ],

  style: [
    "Minimal",
    "Elegant",
    "Premium",
    "Clean",
    "Sophisticated",
    "High Contrast",
    "Product Focused"
  ]
},
  version: '1.0.0',
  mode: 'light',
  supportedModes: ['light', 'dark'],

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
  decorations,
  layout,
  motion,
  utilities,
};

export default deepFreeze(theme);
export {
  withAlpha,
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
  decorations,
  motion,
};
