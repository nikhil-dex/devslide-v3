/**
 * AIRDeck Theme — "Stripe"
 * =============================================================================
 * A bright, high-contrast product-marketing design language inspired by
 * Stripe.com. Tokens only: no DOM, no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is byte-for-byte compatible with `themes/linear.js`: same
 * top-level keys, same utility names and signatures, same `--ld-*` CSS
 * variable namespace, same exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • White and #f6f9fc canvases; deep navy (#0a2540) does the work of black.
 *   • One diagonal purple → blue → cyan gradient as the signature move.
 *   • Bold, tightly tracked marketing headings over comfortable body copy.
 *   • Layered colored shadows (navy-tinted, never grey) for lift.
 *   • Motion is quick and confident — faster than a keynote, no overshoot.
 *
 * Extending
 * ---------
 *   import stripe from './themes/stripe.js';
 *   const stripeNavy = stripe.utilities.extend({ mode: 'dark' });
 *
 * @module themes/stripe
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#635bff'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(99, 91, 255, 0.5)'
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
  // Lights
  white: '#ffffff',
  frost: '#fbfdff',
  mist: '#f6f9fc',
  cloud: '#eff4f9',
  silver: '#e3e8ee',
  steel: '#c1c9d2',

  // Greys — always cool, always navy-leaning.
  grey400: '#a3acb9',
  grey500: '#8792a2',
  grey600: '#697386',
  grey700: '#425466',

  // Navy — this theme's "black".
  navy400: '#1f4e7a',
  navy500: '#153e63',
  navy600: '#0f3151',
  navy700: '#0a2540',
  navy800: '#07203a',

  // Brand indigo / purple.
  indigo300: '#a39bff',
  indigo400: '#7a73ff',
  indigo500: '#635bff',
  indigo600: '#5147e6',
  indigo700: '#4038c4',

  // Blue → cyan run used across gradients and data.
  blue400: '#3f9bff',
  blue500: '#0073e6',
  cyan400: '#00d4ff',
  cyan300: '#66e6ff',

  // Supporting hues — bright but never neon.
  green500: '#00b86b',
  amber500: '#e6a817',
  red500: '#df1b41',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.white,
  backgroundSubtle: palette.mist,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceSunken: palette.mist,
  surfaceHover: palette.cloud,
  overlay: 'rgba(10, 37, 64, 0.55)',

  // Brand
  primary: palette.indigo500,
  primaryHover: palette.indigo400,
  primaryActive: palette.indigo600,
  primarySubtle: withAlpha(palette.indigo500, 0.10),
  primaryContrast: palette.white,

  secondary: palette.mist,
  secondaryHover: palette.cloud,
  secondaryContrast: palette.navy700,

  accent: palette.cyan400,
  accentSubtle: withAlpha(palette.cyan400, 0.12),

  // Status
  success: palette.green500,
  successSubtle: withAlpha(palette.green500, 0.12),
  warning: palette.amber500,
  warningSubtle: withAlpha(palette.amber500, 0.12),
  danger: palette.red500,
  dangerSubtle: withAlpha(palette.red500, 0.10),
  info: palette.blue500,
  infoSubtle: withAlpha(palette.blue500, 0.10),

  // Text
  textPrimary: palette.navy700,
  textSecondary: palette.grey700,
  textMuted: palette.grey600,
  textDisabled: palette.grey500,
  textInverse: palette.white,
  textLink: palette.indigo500,
  textOnPrimary: palette.white,

  // Lines
  border: 'rgba(10, 37, 64, 0.09)',
  borderStrong: 'rgba(10, 37, 64, 0.16)',
  borderSubtle: 'rgba(10, 37, 64, 0.06)',
  borderFocus: withAlpha(palette.indigo500, 0.55),
  divider: 'rgba(10, 37, 64, 0.08)',

  // Data-viz series — ordered for charts and diagrams.
  chart: [
    palette.indigo500,
    palette.blue500,
    palette.cyan400,
    palette.navy700,
    palette.green500,
    palette.amber500,
  ],
};

/**
 * Dark scheme — navy sections, not black ones. Used for stat bands, developer
 * slides and product showcases that sit between light sections.
 */
const darkColors = mergeTokens(colors, {
  background: palette.navy700,
  backgroundSubtle: palette.navy800,
  surface: palette.navy600,
  surfaceElevated: palette.navy500,
  surfaceSunken: palette.navy800,
  surfaceHover: palette.navy400,
  overlay: 'rgba(7, 32, 58, 0.72)',

  primary: palette.indigo400,
  primaryHover: palette.indigo300,
  primaryActive: palette.indigo500,
  primarySubtle: withAlpha(palette.indigo400, 0.18),

  secondary: palette.navy500,
  secondaryHover: palette.navy400,
  secondaryContrast: palette.white,

  accent: palette.cyan300,
  accentSubtle: withAlpha(palette.cyan300, 0.16),

  textPrimary: palette.white,
  textSecondary: '#c7d2de',
  textMuted: palette.grey400,
  textDisabled: palette.grey500,
  textInverse: palette.navy700,
  textLink: palette.cyan300,

  border: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.20)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderFocus: withAlpha(palette.indigo300, 0.6),
  divider: 'rgba(255, 255, 255, 0.10)',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ' +
    'Ubuntu, "Noto Sans", Arial, sans-serif',
  mono:
    'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Headings are marketing-scale
 * and bold; body copy stays generous. Scale everything with
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
    fontSize: '104px',
    fontWeight: 700,
    letterSpacing: '-0.032em',
    lineHeight: 1.06,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '64px',
    fontWeight: 700,
    letterSpacing: '-0.026em',
    lineHeight: 1.12,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '34px',
    fontWeight: 600,
    letterSpacing: '-0.014em',
    lineHeight: 1.32,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '21px',
    fontWeight: 400,
    letterSpacing: '-0.002em',
    lineHeight: 1.64,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '15px',
    fontWeight: 500,
    letterSpacing: '0.006em',
    lineHeight: 1.45,
  },
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '18px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.6,
  },

  /** Section eyebrow — uppercase, set in the brand indigo. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.09em',
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
  lg: '40px',
  xl: '72px',
  '2xl': '112px',

  /** Default slide padding — marketing-page breathing room. */
  slidePadding: '112px',
  sectionGap: '80px',
  stackGap: '24px',
  inlineGap: '12px',
};

/* ============================================================================
 * 5. Radius
 * ========================================================================= */

const radius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — navy-tinted and layered. Lift, not weight.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(10, 37, 64, 0.08), 0 1px 1px rgba(10, 37, 64, 0.04)',
  md: '0 4px 10px rgba(50, 50, 93, 0.10), 0 2px 4px rgba(10, 37, 64, 0.06)',
  lg: '0 13px 27px -8px rgba(50, 50, 93, 0.16), 0 8px 16px -12px rgba(10, 37, 64, 0.12)',
  xl: '0 30px 60px -14px rgba(50, 50, 93, 0.20), 0 18px 36px -20px rgba(10, 37, 64, 0.16)',

  /** Inset top highlight — keeps bright cards from reading as flat fills. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
  focus: `0 0 0 4px ${withAlpha(palette.indigo500, 0.26)}`,
  glow: `0 0 40px ${withAlpha(palette.indigo500, 0.22)}`,
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
 * 8. Gradients — the signature diagonal run, plus quiet supporting washes.
 * ========================================================================= */

const gradients = {
  /** Signature: purple → blue → cyan on a 45° diagonal. */
  aurora:
    `linear-gradient(135deg, ${palette.indigo500} 0%, ${palette.blue500} 54%, ` +
    `${palette.cyan400} 100%)`,

  /** Soft overhead radial for hero slides on light canvases. */
  halo:
    `radial-gradient(120% 90% at 50% -18%, ${withAlpha(palette.indigo500, 0.16)} 0%, ` +
    `${withAlpha(palette.cyan400, 0.08)} 44%, rgba(255, 255, 255, 0) 72%)`,

  /** Bottom-left cyan tint — pairs with `halo` without competing. */
  ember:
    `radial-gradient(76% 66% at 6% 100%, ${withAlpha(palette.cyan400, 0.16)} 0%, ` +
    'rgba(255, 255, 255, 0) 62%)',

  /** Faint sheen for card and panel fills. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(246, 249, 252, 0.6) 100%)',

  /** Brand fill for primary buttons and badges. */
  brand: `linear-gradient(180deg, ${palette.indigo400} 0%, ${palette.indigo500} 100%)`,

  /** Gradient text — apply with background-clip: text. */
  text:
    `linear-gradient(96deg, ${palette.navy700} 0%, ${palette.indigo500} 58%, ` +
    `${palette.cyan400} 100%)`,

  /** Hairline that fades at both ends. */
  ruleFade:
    'linear-gradient(90deg, rgba(10, 37, 64, 0) 0%, rgba(10, 37, 64, 0.14) 50%, ' +
    'rgba(10, 37, 64, 0) 100%)',

  /** Bottom fade for cropped images and code blocks. */
  fadeOut: `linear-gradient(180deg, rgba(246, 249, 252, 0) 0%, ${palette.mist} 100%)`,

  /** Two-stop pairs for badges, rules, icon fills and chart accents. */
  purpleBlue: `linear-gradient(135deg, ${palette.indigo500} 0%, ${palette.blue500} 100%)`,
  blueCyan: `linear-gradient(135deg, ${palette.blue500} 0%, ${palette.cyan400} 100%)`,

  /** Deep navy wash for dark sections. */
  navy: `linear-gradient(160deg, ${palette.navy600} 0%, ${palette.navy700} 58%, ${palette.navy800} 100%)`,

  /** Skewed band — the angled section break Stripe uses between panels. */
  skewBand:
    `linear-gradient(100deg, ${palette.indigo500} 0%, ${palette.blue500} 46%, ` +
    `${palette.cyan400} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%230a2540' fill-opacity='0.10'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%230a2540' " +
  "stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — white. */
  canvas: { background: colors.background },

  /** Hero: overhead halo plus a cyan corner tint on white. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Full-bleed signature gradient — title and section-open slides. */
  aurora: { background: gradients.aurora },

  /** Technical slides — architecture, flows, data. */
  dotGrid: {
    background: `${dotGrid}, ${colors.backgroundSubtle}`,
    backgroundRepeat: 'repeat',
  },
  lineGrid: {
    background: `${lineGrid}, ${colors.backgroundSubtle}`,
    backgroundRepeat: 'repeat',
  },

  /** Panel fill for content blocks sitting on the canvas. */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.surface}`,
  },

  /** Full-bleed media scrim so text stays legible over imagery. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(10, 37, 64, 0.10) 0%, rgba(10, 37, 64, 0.78) 100%)',
  },

  /** Landing — soft gray, the default body canvas for content slides. */
  landing: { background: colors.backgroundSubtle },

  /** Gradient hero — the signature diagonal, softened at the top. */
  gradientHero: {
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 42%), ' +
      `${gradients.aurora}`,
  },

  /** Section divider — angled brand band between two content sections. */
  sectionDivider: { background: gradients.skewBand },

  /** Feature grid — dotted field on soft gray, cards sit on top. */
  featureGrid: {
    background: `${dotGrid}, ${colors.backgroundSubtle}`,
    backgroundRepeat: 'repeat',
  },

  /** Product showcase — quiet white with a single low-corner tint. */
  productShowcase: {
    background:
      `radial-gradient(70% 60% at 88% 92%, ${withAlpha(palette.indigo500, 0.10)} 0%, ` +
      `rgba(255, 255, 255, 0) 62%), ${palette.white}`,
  },

  /** Dark section — navy, never black, with a faint indigo lift. */
  darkSection: {
    background:
      `radial-gradient(90% 70% at 50% 0%, ${withAlpha(palette.indigo500, 0.20)} 0%, ` +
      `rgba(10, 37, 64, 0) 66%), ${gradients.navy}`,
  },

  /** Light section — pure white, for spec and pricing slides. */
  lightSection: { background: palette.white },
};

/* ============================================================================
 * 10. Buttons
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '17px',
  fontWeight: typography.weight.semibold,
  letterSpacing: '-0.003em',
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
    lg: { fontSize: '19px', padding: '18px 34px', borderRadius: radius.pill },
  },

  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: '1px solid transparent',
    boxShadow: shadows.sm,
    hover: { background: colors.primaryHover, boxShadow: shadows.md },
    active: { background: colors.primaryActive, boxShadow: shadows.sm },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.secondary,
      color: colors.textDisabled,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  secondary: {
    ...buttonBase,
    background: colors.surface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    hover: {
      background: colors.surface,
      border: `1px solid ${colors.borderStrong}`,
      boxShadow: shadows.md,
    },
    active: { background: colors.surfaceHover, boxShadow: 'none' },
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
    active: { background: withAlpha(palette.indigo500, 0.16) },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards
 * ========================================================================= */

const cards = {
  base: {
    background: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  elevated: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Flat card for dense feature grids — tone change only. */
  flat: {
    background: colors.surfaceSunken,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Frosted panel over gradient sections. */
  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backdropFilter: 'saturate(170%) blur(22px)',
    color: colors.textPrimary,
  },

  /** Accent card — one per slide, maximum. */
  accent: {
    background: `${gradients.halo}, ${colors.surface}`,
    border: `1px solid ${withAlpha(palette.indigo500, 0.22)}`,
    boxShadow: shadows.lg,
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
 * 12. Motion — quick, confident, no overshoot.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 70,
    fast: 140,
    normal: 220,
    slow: 360,
    slower: 520,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 0.7, 1)',
    /** Kept for API parity — energetic but non-bouncy in this theme. */
    spring: 'cubic-bezier(0.3, 0.85, 0.35, 1)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 220,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 360,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 360,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(36px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 380,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.96)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 300,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(10px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 420,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  /** Sequencing for lists, grids and bullet reveals. */
  stagger: {
    step: 60,
    initialDelay: 80,
    maxItems: 12,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fadeUp',
    duration: 360,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
  maxContentWidth: '1400px',
  columnGap: spacing.lg,
  rowGap: spacing.lg,
  grid: { columns: 12, gutter: '32px' },
};

/* ============================================================================
 * 14. Utilities — same names and signatures as themes/linear.js
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
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#635bff' }
   */
  cssVariables(mode = 'light') {
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
  id: 'stripe',
  name: 'Stripe',
  description:
    'Bright product-marketing theme: white and soft-gray canvases, deep navy ' +
    'type, purple-to-cyan diagonal gradients, layered navy shadows, quick motion.',
  ai: {
  summary:
    "A modern startup and fintech presentation theme designed for SaaS, payments, product strategy, growth, and investor presentations.",

  bestFor: [
    "Startup Pitch Decks",
    "FinTech",
    "Payment Platforms",
    "SaaS Products",
    "Investor Presentations",
    "Product Strategy",
    "Business Growth",
    "Go-To-Market Strategy",
    "Fundraising",
    "Product Roadmaps",
    "Growth Metrics",
    "Technology Companies"
  ],

  avoidFor: [
    "Academic Research",
    "Programming Tutorials",
    "Scientific Presentations",
    "Gaming",
    "Documentary Storytelling"
  ],

  keywords: [
    "startup",
    "saas",
    "fintech",
    "payments",
    "stripe",
    "business",
    "product",
    "strategy",
    "growth",
    "fundraising",
    "investor",
    "venture capital",
    "market",
    "go to market",
    "gtm",
    "pricing",
    "subscription",
    "customers",
    "scale",
    "technology",
    "platform",
    "innovation"
  ],

  style: [
    "Modern",
    "Professional",
    "Bold",
    "Startup Focused",
    "Clean",
    "Dynamic",
    "Product Driven"
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
  layout,
  motion,
  utilities,
};

export default deepFreeze(theme);
export { withAlpha, colors, typography, spacing, radius, shadows, gradients, motion };
