/**
 * AIRDeck Theme — "Linear"
 * =============================================================================
 * A dark-first, premium-SaaS design language inspired by Linear.app.
 * This module ships *tokens only*: no DOM, no components, no animations.
 * The AIRDeck compiler consumes these tokens and renders slides from them.
 *
 * Design intent
 * -------------
 *   • Near-black canvas with a faint blue cast (never pure #000).
 *   • Indigo brand accent used sparingly — one accent per slide, at most.
 *   • Hairline borders instead of heavy shadows for separation.
 *   • Tight negative tracking on large type, neutral tracking on body.
 *   • Generous whitespace; the 8pt scale is the only rhythm allowed.
 *
 * Conventions
 * -----------
 *   • Every value is a plain string/number — serializable to JSON and to CSS.
 *   • Raw palette steps live in `palette` (private). Never reference them from
 *     slide code; always go through the semantic `colors` map so the theme can
 *     be re-skinned without touching consumers.
 *   • Sizes are px numbers where math is useful, px strings where they are
 *     pasted straight into CSS.
 *
 * Extending
 * ---------
 *   import linear from './themes/linear.js';
 *   const linearMuted = linear.utilities.extend({
 *     id: 'linear-muted',
 *     colors: { accent: '#8a8f98' },
 *   });
 *
 * @module themes/linear
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#5e6ad2'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(94, 106, 210, 0.5)'
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
  // Neutrals — cool, very slightly blue. Step 000 is the slide canvas.
  neutral000: '#08090a',
  neutral050: '#0d0e10',
  neutral100: '#111214',
  neutral150: '#16181b',
  neutral200: '#1c1e22',
  neutral300: '#26282d',
  neutral400: '#3a3d44',
  neutral500: '#62666d',
  neutral600: '#8a8f98',
  neutral700: '#b4b8c0',
  neutral800: '#d0d6e0',
  neutral900: '#f7f8f8',
  white: '#ffffff',

  // Brand indigo.
  indigo300: '#a3aaf5',
  indigo400: '#828fff',
  indigo500: '#5e6ad2',
  indigo600: '#4c56b8',
  indigo700: '#3a4295',

  // Supporting hues — desaturated so they never read as neon.
  violet400: '#b59aff',
  teal400: '#4cb3a4',
  green400: '#68cc95',
  amber400: '#f2c55c',
  red400: '#eb5757',
  blue400: '#5aa9e6',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.neutral000,
  backgroundSubtle: palette.neutral050,
  surface: palette.neutral100,
  surfaceElevated: palette.neutral150,
  surfaceSunken: palette.neutral050,
  surfaceHover: palette.neutral200,
  overlay: 'rgba(8, 9, 10, 0.72)',

  // Brand
  primary: palette.indigo500,
  primaryHover: palette.indigo400,
  primaryActive: palette.indigo600,
  primarySubtle: withAlpha(palette.indigo500, 0.14),
  primaryContrast: palette.white,

  secondary: palette.neutral300,
  secondaryHover: palette.neutral400,
  secondaryContrast: palette.neutral900,

  accent: palette.violet400,
  accentSubtle: withAlpha(palette.violet400, 0.12),

  // Status
  success: palette.green400,
  successSubtle: withAlpha(palette.green400, 0.12),
  warning: palette.amber400,
  warningSubtle: withAlpha(palette.amber400, 0.12),
  danger: palette.red400,
  dangerSubtle: withAlpha(palette.red400, 0.12),
  info: palette.blue400,
  infoSubtle: withAlpha(palette.blue400, 0.12),

  // Text
  textPrimary: palette.neutral900,
  textSecondary: palette.neutral800,
  textMuted: palette.neutral600,
  textDisabled: palette.neutral500,
  textInverse: palette.neutral000,
  textLink: palette.indigo400,
  textOnPrimary: palette.white,

  // Lines
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  borderFocus: withAlpha(palette.indigo400, 0.6),
  divider: 'rgba(255, 255, 255, 0.06)',

  // Data-viz series — ordered for charts and diagrams.
  chart: [
    palette.indigo400,
    palette.teal400,
    palette.violet400,
    palette.amber400,
    palette.blue400,
    palette.red400,
  ],
};

/**
 * Light scheme. Same token names, inverted values — provided so decks can
 * flip a single slide to light without leaving the design language.
 */
const lightColors = mergeTokens(colors, {
  background: '#fbfbfb',
  backgroundSubtle: '#f4f5f8',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceSunken: '#f4f5f8',
  surfaceHover: '#f0f1f4',
  overlay: 'rgba(255, 255, 255, 0.76)',

  secondary: '#eceef2',
  secondaryHover: '#e2e5ea',
  secondaryContrast: '#16181b',

  textPrimary: '#16181b',
  textSecondary: '#3a3d44',
  textMuted: '#62666d',
  textDisabled: '#9ba0a8',
  textInverse: '#ffffff',
  textLink: palette.indigo600,

  border: 'rgba(9, 10, 12, 0.10)',
  borderStrong: 'rgba(9, 10, 12, 0.16)',
  borderSubtle: 'rgba(9, 10, 12, 0.06)',
  divider: 'rgba(9, 10, 12, 0.08)',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", ' +
    'Roboto, Arial, "Noto Sans", sans-serif',
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Scale the whole set with
 * `utilities.scaleType(factor)` if the compiler renders at another size.
 */
const typography = {
  fontFamily: fontStacks,

  weight: {
    regular: 400,
    medium: 510,
    semibold: 590,
    bold: 680,
  },

  display: {
    fontFamily: fontStacks.sans,
    fontSize: '88px',
    fontWeight: 590,
    letterSpacing: '-0.032em',
    lineHeight: 1.04,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '56px',
    fontWeight: 590,
    letterSpacing: '-0.024em',
    lineHeight: 1.12,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '32px',
    fontWeight: 510,
    letterSpacing: '-0.014em',
    lineHeight: 1.28,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '20px',
    fontWeight: 400,
    letterSpacing: '-0.005em',
    lineHeight: 1.6,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 510,
    letterSpacing: '0.02em',
    lineHeight: 1.4,
  },
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.55,
  },

  /** Small-caps eyebrow used above headings. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '13px',
    fontWeight: 590,
    letterSpacing: '0.1em',
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
  xl: '64px',
  '2xl': '96px',

  /** Default slide padding — deliberately large; whitespace is the theme. */
  slidePadding: '96px',
  sectionGap: '64px',
  stackGap: '24px',
  inlineGap: '12px',
};

/* ============================================================================
 * 5. Radius
 * ========================================================================= */

const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — soft, low-spread, always paired with a hairline border
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.24)',
  md: '0 2px 4px rgba(0, 0, 0, 0.20), 0 6px 16px rgba(0, 0, 0, 0.24)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.20), 0 16px 40px rgba(0, 0, 0, 0.28)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.22), 0 32px 72px rgba(0, 0, 0, 0.34)',

  /** Inset top highlight — the trick that makes dark cards feel lit. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  focus: `0 0 0 3px ${withAlpha(palette.indigo400, 0.32)}`,
  glow: `0 0 32px ${withAlpha(palette.indigo500, 0.28)}`,
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
 * 8. Gradients
 * ========================================================================= */

const gradients = {
  /** Signature background wash — indigo bleeding into the canvas. */
  aurora:
    `linear-gradient(160deg, ${withAlpha(palette.indigo500, 0.22)} 0%, ` +
    `${withAlpha(palette.violet400, 0.10)} 38%, ${palette.neutral000} 78%)`,

  /** Off-center spotlight for hero slides. */
  halo:
    `radial-gradient(120% 90% at 50% -20%, ${withAlpha(palette.indigo400, 0.24)} 0%, ` +
    `${withAlpha(palette.indigo500, 0.06)} 42%, rgba(8, 9, 10, 0) 70%)`,

  /** Bottom-left ambient tint — pairs with `halo` without competing. */
  ember:
    `radial-gradient(80% 70% at 8% 100%, ${withAlpha(palette.violet400, 0.14)} 0%, ` +
    'rgba(8, 9, 10, 0) 62%)',

  /** Faint sheen for card and panel fills. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',

  /** Solid-feeling brand fill for primary buttons and badges. */
  brand: `linear-gradient(180deg, ${palette.indigo400} 0%, ${palette.indigo500} 100%)`,

  /** Gradient text — apply with background-clip: text. */
  text:
    `linear-gradient(92deg, ${palette.neutral900} 0%, ${palette.neutral800} 40%, ` +
    `${palette.indigo300} 100%)`,

  /** Hairline that fades at both ends — Linear's signature divider. */
  ruleFade:
    'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.14) 50%, ' +
    'rgba(255, 255, 255, 0) 100%)',

  /** Bottom fade for cropped images and code blocks. */
  fadeOut: `linear-gradient(180deg, rgba(8, 9, 10, 0) 0%, ${palette.neutral000} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%23ffffff' " +
  "stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas. */
  canvas: { background: colors.background },

  /** Hero: halo + ember over the canvas. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Diagonal brand wash for section dividers. */
  aurora: { background: `${gradients.aurora}, ${colors.background}` },

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

  /** Full-bleed media scrim so text stays legible over images. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(8, 9, 10, 0.15) 0%, rgba(8, 9, 10, 0.85) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '16px',
  fontWeight: typography.weight.medium,
  letterSpacing: '-0.006em',
  lineHeight: 1,
  padding: '12px 20px',
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
    sm: { fontSize: '14px', padding: '8px 14px', borderRadius: radius.sm },
    md: { fontSize: '16px', padding: '12px 20px', borderRadius: radius.md },
    lg: { fontSize: '18px', padding: '16px 28px', borderRadius: radius.lg },
  },

  primary: {
    ...buttonBase,
    background: gradients.brand,
    color: colors.textOnPrimary,
    border: `1px solid ${withAlpha(palette.indigo400, 0.5)}`,
    boxShadow: `${shadows.sm}, ${shadows.hairline}`,
    hover: { background: palette.indigo400, boxShadow: shadows.md },
    active: { background: palette.indigo600, boxShadow: shadows.none },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.secondary,
      color: colors.textDisabled,
      border: borders.subtle,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },

  secondary: {
    ...buttonBase,
    background: colors.surfaceElevated,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.hairline,
    hover: { background: colors.surfaceHover, border: `1px solid ${colors.borderStrong}` },
    active: { background: colors.surface },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surface,
      color: colors.textDisabled,
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
 * 11. Cards
 * ========================================================================= */

const cards = {
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.sm}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  elevated: {
    background: `${gradients.surfaceSheen}, ${colors.surfaceElevated}`,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Flat card for dense grids — separation comes from the border only. */
  flat: {
    background: colors.backgroundSubtle,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Frosted panel over imagery or gradients. */
  glass: {
    background: 'rgba(22, 24, 27, 0.62)',
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backdropFilter: 'blur(20px) saturate(140%)',
    color: colors.textSecondary,
  },

  /** Accent card — one per slide, maximum. */
  accent: {
    background: `${gradients.halo}, ${colors.surface}`,
    border: `1px solid ${withAlpha(palette.indigo500, 0.35)}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards. Merge onto any variant above. */
  hover: {
    background: colors.surfaceHover,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
  },
};

/* ============================================================================
 * 12. Motion — descriptors only. The compiler decides how to run them.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 80,
    fast: 160,
    normal: 260,
    slow: 420,
    slower: 640,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
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
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 420,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 420,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(32px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 420,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.97)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 320,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(8px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 480,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  /** Sequencing for lists, grids and bullet reveals. */
  stagger: {
    step: 70,
    initialDelay: 90,
    maxItems: 12,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fadeUp',
    duration: 420,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  /** Honour prefers-reduced-motion: collapse everything to a plain fade. */
  reducedMotion: {
    preset: 'fade',
    duration: 120,
    stagger: { step: 0, initialDelay: 0 },
  },
};

/* ============================================================================
 * 13. Layout (slide geometry — not required by the spec, but the compiler
 *      needs somewhere consistent to read it from)
 * ========================================================================= */

const layout = {
  aspectRatio: '16 / 9',
  width: 1920,
  height: 1080,
  padding: spacing.slidePadding,
  maxContentWidth: '1440px',
  columnGap: spacing.lg,
  rowGap: spacing.lg,
  grid: { columns: 12, gutter: '32px' },
};

/* ============================================================================
 * 14. Utilities
 * ========================================================================= */

const scheme = { dark: colors, light: lightColors };

const utilities = {
  withAlpha,

  /**
   * @param {'primary'|'secondary'|'muted'|'disabled'|'inverse'|'link'} [level]
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
   * @param {'base'|'elevated'|'sunken'|'hover'|'overlay'} [level]
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
   * @param {'dark'|'light'} [mode]
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#5e6ad2' }
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
  id: 'linear',
  name: 'Linear',
  description:
    'Dark-first premium SaaS theme: near-black canvas, indigo accent, ' +
    'hairline borders, tight display tracking, generous whitespace.',
    ai: {
 
    summary:
      "Professional business presentations with a modern SaaS aesthetic.",

    bestFor: [
      "Business Presentations",
      "Startup Pitch Decks",
      "SaaS Products",
      "Company Overviews",
      "Strategy Presentations",
      "Sales Decks",
      "General Purpose Presentations",
      "Investor presentations",
      "Executive presentations",
      "SaaS products",
      "Company strategy",
      "Business planning",
      "Product roadmaps"
    ],

    avoidFor: [
      "Research Papers",
      "Academic Lectures",
      "Programming Tutorials",
      "Gaming Presentations",
      "Sci-Fi Concepts"
    ],

    keywords: [
      "business",
      "startup",
      "corporate",
      "professional",
      "saas",
      "clean",
      "modern",
      "executive",
      "strategy",
      "company",
      "consulting",
      "finance",
      "marketing",
      "product",
      "enterprise",
      "investor",
      "pitch",
      "roadmap",
      "growth",
      "startup",
      "board meeting",
      "quarterly"
    ],

    style: [
      "Clean",
      "Professional",
      "Minimal",
      "Balanced",
      "Modern",
      "Corporate",
      "Versatile"
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
