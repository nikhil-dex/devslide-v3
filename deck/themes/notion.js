/**
 * AIRDeck Theme — "Notion"
 * =============================================================================
 * A calm, editorial, documentation-first design language. Tokens only: no DOM,
 * no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Warm white page, warm gray panels, charcoal text — nothing is neutral-cool.
 *   • Borders do the separating; shadows are nearly absent.
 *   • Body copy is the hero: 1.75 line-height and a narrow measure.
 *   • Beige is the only decorative color; blue is reserved for links.
 *   • Motion is slow and plain so reading is never interrupted.
 *
 * Extending
 * ---------
 *   import notion from './themes/notion.js';
 *   const notionDark = notion.utilities.extend({ mode: 'dark' });
 *
 * @module themes/notion
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#37352f'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(55, 53, 47, 0.5)'
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
  // Page whites — all warm.
  white: '#ffffff',
  paper: '#fdfdfc',
  parchment: '#faf9f7',
  sand: '#f7f6f3',
  linen: '#f1f1ef',
  clay: '#ebeae7',

  // Beige accent family — the only decorative color in the theme.
  beige200: '#f3eee2',
  beige300: '#e6dfcc',
  beige400: '#d3c7ac',
  beige500: '#b09b78',

  // Warm greys — text and quiet UI.
  grey400: '#b4b3af',
  grey500: '#9b9a97',
  grey600: '#787774',
  grey700: '#5f5e5b',

  // Charcoal through soft black.
  charcoal: '#37352f',
  ink: '#2b2a26',
  softBlack: '#191919',
  black: '#111110',

  // Dark-mode surfaces.
  dark800: '#202020',
  dark700: '#252525',
  dark600: '#2f2f2f',
  darkText: '#e9e9e7',
  darkTextSoft: '#cfcecb',

  // Muted status hues — documentation palette, never saturated.
  blue600: '#337ea9',
  blue500: '#4a92ba',
  green600: '#448361',
  amber600: '#cb912f',
  red600: '#d44c47',
  purple600: '#9065b0',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.white,
  backgroundSubtle: palette.sand,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceSunken: palette.linen,
  surfaceHover: palette.clay,
  overlay: 'rgba(55, 53, 47, 0.45)',

  // Brand — quiet by design. The "primary" action is charcoal, not a hue.
  primary: palette.charcoal,
  primaryHover: palette.ink,
  primaryActive: palette.black,
  primarySubtle: withAlpha(palette.charcoal, 0.06),
  primaryContrast: palette.white,

  secondary: palette.sand,
  secondaryHover: palette.linen,
  secondaryContrast: palette.charcoal,

  accent: palette.beige400,
  accentSubtle: withAlpha(palette.beige400, 0.22),

  // Status — muted documentation colors.
  success: palette.green600,
  successSubtle: withAlpha(palette.green600, 0.10),
  warning: palette.amber600,
  warningSubtle: withAlpha(palette.amber600, 0.10),
  danger: palette.red600,
  dangerSubtle: withAlpha(palette.red600, 0.09),
  info: palette.blue600,
  infoSubtle: withAlpha(palette.blue600, 0.09),

  // Text
  textPrimary: palette.charcoal,
  textSecondary: palette.grey700,
  textMuted: palette.grey600,
  textDisabled: palette.grey500,
  textInverse: palette.white,
  textLink: palette.blue600,
  textOnPrimary: palette.white,

  // Lines — the primary separation device in this theme.
  border: 'rgba(55, 53, 47, 0.09)',
  borderStrong: 'rgba(55, 53, 47, 0.16)',
  borderSubtle: 'rgba(55, 53, 47, 0.06)',
  borderFocus: withAlpha(palette.blue600, 0.45),
  divider: 'rgba(55, 53, 47, 0.12)',

  // Data-viz series — ordered for charts and diagrams.
  chart: [
    palette.charcoal,
    palette.blue600,
    palette.green600,
    palette.amber600,
    palette.purple600,
    palette.grey500,
  ],
};

/**
 * Dark scheme — a dimmed reading surface, not a stage. Used for dark sections,
 * code-heavy slides and late-night reading exports.
 */
const darkColors = mergeTokens(colors, {
  background: palette.softBlack,
  backgroundSubtle: palette.dark800,
  surface: palette.dark800,
  surfaceElevated: palette.dark700,
  surfaceSunken: palette.black,
  surfaceHover: palette.dark600,
  overlay: 'rgba(17, 17, 16, 0.66)',

  primary: palette.darkText,
  primaryHover: palette.white,
  primaryActive: palette.darkTextSoft,
  primarySubtle: 'rgba(255, 255, 255, 0.07)',
  primaryContrast: palette.softBlack,

  secondary: palette.dark700,
  secondaryHover: palette.dark600,
  secondaryContrast: palette.darkText,

  accent: palette.beige300,
  accentSubtle: withAlpha(palette.beige300, 0.14),

  textPrimary: palette.darkText,
  textSecondary: palette.darkTextSoft,
  textMuted: palette.grey500,
  textDisabled: palette.grey600,
  textInverse: palette.charcoal,
  textLink: palette.blue500,
  textOnPrimary: palette.softBlack,

  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderFocus: withAlpha(palette.blue500, 0.5),
  divider: 'rgba(255, 255, 255, 0.11)',
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", ' +
    'Arial, sans-serif',
  mono:
    'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Headings are restrained so the
 * body sets the pace — this theme is read, not watched. Scale everything with
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
    fontSize: '80px',
    fontWeight: 700,
    letterSpacing: '-0.021em',
    lineHeight: 1.14,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '50px',
    fontWeight: 600,
    letterSpacing: '-0.014em',
    lineHeight: 1.24,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '30px',
    fontWeight: 600,
    letterSpacing: '-0.006em',
    lineHeight: 1.36,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '21px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.76,
  },
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '15px',
    fontWeight: 400,
    letterSpacing: '0.004em',
    lineHeight: 1.5,
  },
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '-0.002em',
    lineHeight: 1.66,
  },

  /** Section label above a heading — small, spaced, muted. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.08em',
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

  /** Default slide padding — margins of a well-set page. */
  slidePadding: '112px',
  sectionGap: '64px',
  stackGap: '24px',
  inlineGap: '10px',
};

/* ============================================================================
 * 5. Radius — small and unobtrusive; blocks, not pills.
 * ========================================================================= */

const radius = {
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — barely there. Depth is a last resort in this theme.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 15, 15, 0.05)',
  md: '0 1px 2px rgba(15, 15, 15, 0.05), 0 2px 6px rgba(15, 15, 15, 0.05)',
  lg: '0 3px 6px rgba(15, 15, 15, 0.06), 0 9px 24px rgba(15, 15, 15, 0.06)',
  xl: '0 6px 12px rgba(15, 15, 15, 0.07), 0 18px 40px rgba(15, 15, 15, 0.07)',

  /** Inset top highlight — used only on floating menus and popovers. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
  focus: `0 0 0 3px ${withAlpha(palette.blue600, 0.22)}`,
  glow: `0 0 24px ${withAlpha(palette.beige400, 0.28)}`,
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
 * 8. Gradients — near-flat. Present only to soften edges and page breaks.
 * ========================================================================= */

const gradients = {
  /** Page wash — white settling into warm sand. */
  aurora: `linear-gradient(180deg, ${palette.white} 0%, ${palette.parchment} 68%, ${palette.sand} 100%)`,

  /** Faint warmth at the top of a cover page. */
  halo:
    `radial-gradient(120% 70% at 50% -12%, ${withAlpha(palette.beige300, 0.34)} 0%, ` +
    'rgba(255, 255, 255, 0) 66%)',

  /** Bottom-left beige tint — pairs with `halo` without competing. */
  ember:
    `radial-gradient(70% 60% at 8% 100%, ${withAlpha(palette.beige400, 0.20)} 0%, ` +
    'rgba(255, 255, 255, 0) 60%)',

  /** Faint sheen for panels and callout blocks. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(247, 246, 243, 0.75) 100%)',

  /** Fill for the primary action — flat charcoal with a hair of depth. */
  brand: `linear-gradient(180deg, ${palette.charcoal} 0%, ${palette.ink} 100%)`,

  /** Gradient text — apply with background-clip: text. Kept nearly tonal. */
  text: `linear-gradient(96deg, ${palette.charcoal} 0%, ${palette.grey700} 78%, ${palette.beige500} 100%)`,

  /** Hairline that fades at both ends — the section rule. */
  ruleFade:
    'linear-gradient(90deg, rgba(55, 53, 47, 0) 0%, rgba(55, 53, 47, 0.16) 50%, ' +
    'rgba(55, 53, 47, 0) 100%)',

  /** Bottom fade for cropped figures, long tables and code blocks. */
  fadeOut: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${palette.white} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (no new keys; the Linear set covers the brief):
 *   documentation / notes / light section → canvas
 *   reports / covers                      → hero
 *   research, academic openers            → aurora
 *   knowledge base, wikis                 → dotGrid
 *   tutorials, worked examples            → lineGrid
 *   callouts, information panels          → panel
 *   dark section, full-bleed figures      → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%2337352f' fill-opacity='0.10'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M0 63.5H64' fill='none' stroke='%2337352f' " +
  "stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — warm white. Documentation, notes, light sections. */
  canvas: { background: colors.background },

  /** Cover and report opener: a warm top wash over the page. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Research and academic openers — vertical page wash. */
  aurora: { background: gradients.aurora },

  /** Knowledge-base and wiki slides — faint dotted field on sand. */
  dotGrid: {
    background: `${dotGrid}, ${colors.backgroundSubtle}`,
    backgroundRepeat: 'repeat',
  },

  /** Tutorials and worked examples — ruled-paper baseline. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Callouts and information panels sitting on the canvas. */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.backgroundSubtle}`,
  },

  /**
   * Dark section. Doubles as the legibility scrim for full-bleed figures —
   * a flat charcoal field that darkens toward the caption edge.
   */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(25, 25, 25, 0.92) 0%, rgba(17, 17, 16, 0.97) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons — quiet, neutral, small-radius
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '16px',
  fontWeight: typography.weight.medium,
  letterSpacing: '0em',
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
    lg: { fontSize: '18px', padding: '15px 26px', borderRadius: radius.lg },
  },

  primary: {
    ...buttonBase,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: '1px solid transparent',
    boxShadow: shadows.sm,
    hover: { background: colors.primaryHover },
    active: { background: colors.primaryActive, boxShadow: 'none' },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surfaceSunken,
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
    hover: { background: colors.backgroundSubtle },
    active: { background: colors.surfaceSunken, boxShadow: 'none' },
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
    hover: { background: colors.surfaceSunken, color: colors.textPrimary },
    active: { background: colors.surfaceHover },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — documentation blocks, callouts, information panels
 * ========================================================================= */

const cards = {
  /** Documentation block — border only, no lift. */
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Reserved for floating elements — popovers, footnote cards. */
  elevated: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Callout — tinted block, left rule, no border box. */
  flat: {
    background: colors.backgroundSubtle,
    border: '1px solid transparent',
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Frosted panel — only for content over a figure or the dark section. */
  glass: {
    background: 'rgba(255, 255, 255, 0.82)',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backdropFilter: 'saturate(130%) blur(14px)',
    color: colors.textPrimary,
  },

  /** Beige callout — one per slide, for the single idea that matters. */
  accent: {
    background: withAlpha(palette.beige200, 0.85),
    border: `1px solid ${withAlpha(palette.beige400, 0.5)}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards. Merge onto any variant above. */
  hover: {
    background: colors.backgroundSubtle,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.sm,
  },
};

/* ============================================================================
 * 12. Motion — slow, plain, reading-friendly. Fade and slide only.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 300,
    slow: 480,
    slower: 700,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    exit: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
    /** Kept for API parity — deliberately non-bouncy in this theme. */
    spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 480,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 480,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 480,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.99)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 420,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(5px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 520,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  /** Sequencing for lists, grids and bullet reveals — paced for reading. */
  stagger: {
    step: 90,
    initialDelay: 120,
    maxItems: 14,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fade',
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
  /** Narrow measure — roughly 70 characters at the body size. */
  maxContentWidth: '1120px',
  columnGap: spacing.lg,
  rowGap: spacing.md,
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
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#37352f' }
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
  id: 'notion',
  name: 'Notion',
  description:
    'Editorial documentation theme: warm white page, charcoal type, hairline ' +
    'borders, beige callouts, almost no shadow, slow reading-paced motion.',
  ai: {
  summary:
    "A clean documentation-first theme designed for tutorials, guides, documentation, onboarding, and knowledge sharing.",

  bestFor: [
    "Documentation",
    "User Guides",
    "Tutorials",
    "Knowledge Base",
    "Technical Documentation",
    "Internal Wikis",
    "Product Documentation",
    "Onboarding",
    "Training Materials",
    "Educational Guides",
    "Standard Operating Procedures",
    "Best Practices"
  ],

  avoidFor: [
    "Product Launches",
    "Marketing Campaigns",
    "Gaming Presentations",
    "Financial Dashboards",
    "Cinematic Storytelling"
  ],

  keywords: [
    "documentation",
    "docs",
    "guide",
    "tutorial",
    "manual",
    "wiki",
    "knowledge",
    "learning",
    "onboarding",
    "training",
    "how to",
    "reference",
    "documentation",
    "standard operating procedure",
    "sop",
    "best practices",
    "workflow",
    "instructions",
    "technical writing",
    "education",
    "notes",
    "knowledge base"
  ],

  style: [
    "Minimal",
    "Documentation First",
    "Readable",
    "Organized",
    "Structured",
    "Content Focused",
    "Clean"
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
