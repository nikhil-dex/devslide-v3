/**
 * AIRDeck Theme — "Academic"
 * =============================================================================
 * A research-presentation theme for conference talks, lectures and defenses:
 * warm white page, pure white figure panels, one deep academic blue, slate
 * secondaries. Tokens only: no DOM, no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Warm white canvas, pure white surfaces — figures sit brighter than the
 *     page, so charts and images take visual priority over everything else.
 *   • Readability first: 22px body, 1.72 leading, generous paragraph spacing.
 *   • Rules over fills. Tables, timelines and comparisons are ruled, not boxed.
 *   • Small radii, near-zero shadow, no saturated color — the deck prints and
 *     projects identically, including under a washed-out lecture projector.
 *   • Motion is 150–200ms and opacity-led; nothing competes with the speaker.
 *
 * Compiler note
 * -------------
 * Numeric result tables should render with `font-variant-numeric: tabular-nums`.
 * The type roles carry no key for it (API parity with Linear), so the compiler
 * applies it to numeric cells.
 *
 * Extending
 * ---------
 *   import academic from './themes/academic.js';
 *   const academicCrimson = academic.utilities.extend({
 *     colors: { primary: '#7b1e2b', textLink: '#7b1e2b' },
 *   });
 *
 * @module themes/academic
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#1a3d6d'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(26, 61, 109, 0.5)'
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
  // Page whites — warm, so white figure panels read as brighter.
  white: '#ffffff',
  page: '#fbfaf7',
  pageSoft: '#f7f5f1',
  sunken: '#f2f0eb',
  rule: '#e6e3dd',

  // Slate greys — secondary structure and labels.
  slate200: '#eceef1',
  slate300: '#dfe2e7',
  slate400: '#9aa1ac',
  slate500: '#6b7280',
  slate600: '#4d5560',
  slate700: '#3a414b',

  // Ink.
  ink: '#1a1c1f',
  inkSoft: '#33383f',

  // Deep academic blue — one hue, used sparingly.
  blue400: '#4a7bb5',
  blue500: '#2b5a94',
  blue600: '#1a3d6d',
  blue700: '#132c50',

  // Muted status hues — legible in print and under a projector.
  green600: '#2f7d52',
  amber600: '#a97a1f',
  red600: '#a8443c',
  plum600: '#6b4c8a',
  teal600: '#2e7d84',

  // Dark-scheme primitives (used only by the dark counterpart).
  darkCanvas: '#16181c',
  darkSurface: '#1d2025',
  darkSurfaceAlt: '#252931',
  darkText: '#eceef1',
  darkMuted: '#98a0ac',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.page,
  backgroundSubtle: palette.pageSoft,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceSunken: palette.sunken,
  surfaceHover: palette.pageSoft,
  overlay: 'rgba(26, 28, 31, 0.45)',

  // Brand
  primary: palette.blue600,
  primaryHover: palette.blue500,
  primaryActive: palette.blue700,
  primarySubtle: withAlpha(palette.blue600, 0.07),
  primaryContrast: palette.white,

  secondary: palette.slate200,
  secondaryHover: palette.slate300,
  secondaryContrast: palette.slate700,

  accent: palette.slate600,
  accentSubtle: withAlpha(palette.slate600, 0.08),

  // Status — desaturated; distinguishable in greyscale print.
  success: palette.green600,
  successSubtle: withAlpha(palette.green600, 0.09),
  warning: palette.amber600,
  warningSubtle: withAlpha(palette.amber600, 0.09),
  danger: palette.red600,
  dangerSubtle: withAlpha(palette.red600, 0.08),
  info: palette.blue500,
  infoSubtle: withAlpha(palette.blue500, 0.08),

  // Text
  textPrimary: palette.ink,
  textSecondary: palette.inkSoft,
  textMuted: palette.slate500,
  textDisabled: palette.slate400,
  textInverse: palette.white,
  textLink: palette.blue500,
  textOnPrimary: palette.white,

  // Lines — table rules, figure frames, axis lines.
  border: 'rgba(26, 28, 31, 0.14)',
  borderStrong: 'rgba(26, 28, 31, 0.26)',
  borderSubtle: 'rgba(26, 28, 31, 0.08)',
  borderFocus: withAlpha(palette.blue600, 0.55),
  divider: 'rgba(26, 28, 31, 0.12)',

  /**
   * Figure series — ordered so adjacent pairs stay distinguishable in
   * greyscale and for the common forms of color-vision deficiency.
   */
  chart: [
    palette.blue600,
    palette.red600,
    palette.green600,
    palette.amber600,
    palette.plum600,
    palette.teal600,
  ],
};

/**
 * Dark scheme — for auditoriums where the projector washes out white slides.
 * Same token names, inverted values, status hues lifted for contrast.
 */
const darkColors = mergeTokens(colors, {
  background: palette.darkCanvas,
  backgroundSubtle: '#101216',
  surface: palette.darkSurface,
  surfaceElevated: palette.darkSurfaceAlt,
  surfaceSunken: '#101216',
  surfaceHover: '#2c313a',
  overlay: 'rgba(10, 11, 14, 0.72)',

  primary: '#6f9dd4',
  primaryHover: '#8ab2e0',
  primaryActive: '#5a89c0',
  primarySubtle: withAlpha('#6f9dd4', 0.16),
  primaryContrast: palette.darkCanvas,

  secondary: palette.darkSurfaceAlt,
  secondaryHover: '#2c313a',
  secondaryContrast: palette.darkText,

  accent: '#9aa6b6',
  accentSubtle: withAlpha('#9aa6b6', 0.14),

  success: '#5fb185',
  successSubtle: withAlpha('#5fb185', 0.14),
  warning: '#d3a24d',
  warningSubtle: withAlpha('#d3a24d', 0.14),
  danger: '#d4736b',
  dangerSubtle: withAlpha('#d4736b', 0.14),
  info: '#6f9dd4',
  infoSubtle: withAlpha('#6f9dd4', 0.14),

  textPrimary: palette.darkText,
  textSecondary: '#c3c9d2',
  textMuted: palette.darkMuted,
  textDisabled: '#6d7480',
  textInverse: palette.ink,
  textLink: '#8ab2e0',

  border: 'rgba(255, 255, 255, 0.13)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderFocus: withAlpha('#6f9dd4', 0.6),
  divider: 'rgba(255, 255, 255, 0.11)',

  chart: ['#6f9dd4', '#d4736b', '#5fb185', '#d3a24d', '#a98cc6', '#57a8ae'],
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ' +
    'Helvetica, Arial, "Noto Sans", sans-serif',
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas and tuned for the back row of a
 * lecture hall: nothing below 16px, generous leading on body and captions.
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

  /** Talk title and closing slide. */
  display: {
    fontFamily: fontStacks.sans,
    fontSize: '82px',
    fontWeight: 600,
    letterSpacing: '-0.022em',
    lineHeight: 1.14,
  },
  /** Section headings: Method, Experiments, Results, Related Work. */
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '46px',
    fontWeight: 600,
    letterSpacing: '-0.016em',
    lineHeight: 1.22,
  },
  /** Slide titles, figure titles, table titles. */
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.008em',
    lineHeight: 1.36,
  },
  /** Body copy and bullet lists — the readability anchor of the theme. */
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.72,
  },
  /** Figure captions, axis labels, footnotes, citations. */
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '0.006em',
    lineHeight: 1.52,
  },
  /** Algorithms, equations set as listings, snippets. */
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '-0.002em',
    lineHeight: 1.64,
  },

  /** Section number or venue label above a heading. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 600,
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
  xl: '64px',
  '2xl': '96px',

  /** Default slide padding — journal-page margins. */
  slidePadding: '120px',
  sectionGap: '64px',
  stackGap: '24px',
  inlineGap: '10px',
};

/* ============================================================================
 * 5. Radius — small. Figures and tables are documents, not app surfaces.
 * ========================================================================= */

const radius = {
  xs: '2px',
  sm: '3px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — minimal, and absent from anything that will be printed.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(26, 28, 31, 0.06)',
  md: '0 1px 3px rgba(26, 28, 31, 0.07), 0 2px 6px rgba(26, 28, 31, 0.05)',
  lg: '0 2px 6px rgba(26, 28, 31, 0.07), 0 8px 20px rgba(26, 28, 31, 0.06)',
  xl: '0 4px 10px rgba(26, 28, 31, 0.08), 0 16px 36px rgba(26, 28, 31, 0.06)',

  /** Inset top highlight — used only on raised controls. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  focus: `0 0 0 3px ${withAlpha(palette.blue600, 0.22)}`,
  /** Selected figure or highlighted result — a ring, not a bloom. */
  glow: `0 0 0 1px ${withAlpha(palette.blue600, 0.42)}`,
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
 * 8. Gradients — functional only. Nothing decorative reaches a figure.
 * ========================================================================= */

const gradients = {
  /** Page wash — warm white settling a shade. Barely perceptible. */
  aurora: `linear-gradient(180deg, ${palette.white} 0%, ${palette.page} 58%, ${palette.pageSoft} 100%)`,

  /** Faint blue tint at the top of a title slide. */
  halo:
    `radial-gradient(120% 74% at 50% -14%, ${withAlpha(palette.blue600, 0.07)} 0%, ` +
    'rgba(251, 250, 247, 0) 66%)',

  /** Corner tint for the title slide only. */
  ember:
    `radial-gradient(64% 56% at 6% 100%, ${withAlpha(palette.slate600, 0.06)} 0%, ` +
    'rgba(251, 250, 247, 0) 60%)',

  /** Panel header bar — one tonal step above the panel body. */
  surfaceSheen: `linear-gradient(180deg, ${palette.pageSoft} 0%, ${palette.white} 100%)`,

  /** Primary action fill — flat blue with a single darkening step. */
  brand: `linear-gradient(180deg, ${palette.blue500} 0%, ${palette.blue600} 100%)`,

  /** Gradient text — reserved for a title slide, if used at all. */
  text: `linear-gradient(96deg, ${palette.ink} 0%, ${palette.blue600} 100%)`,

  /** Hairline that fades at both ends — section and table rules. */
  ruleFade:
    'linear-gradient(90deg, rgba(26, 28, 31, 0) 0%, rgba(26, 28, 31, 0.18) 50%, ' +
    'rgba(26, 28, 31, 0) 100%)',

  /** Bottom fade for long tables, listings and truncated result sets. */
  fadeOut: `linear-gradient(180deg, rgba(251, 250, 247, 0) 0%, ${palette.page} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   content, bullets, comparison slides → canvas
 *   title slide, closing slide          → hero
 *   section dividers                    → aurora
 *   poster-style and metric slides      → dotGrid
 *   plots, research and experiment timelines → lineGrid
 *   figures, tables, listings, citations → panel
 *   full-bleed figures and photographs  → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' " +
  "height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%231a1c1f' fill-opacity='0.09'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' " +
  "height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%231a1c1f' " +
  "stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — warm white. */
  canvas: { background: colors.background },

  /** Title and closing slides: one faint blue tint and a corner shade. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Section dividers — vertical page wash. */
  aurora: { background: gradients.aurora },

  /** Poster-style and metric slides — dotted field behind figures. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Plots, milestone timelines and experiment schedules. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Figures, tables, listings and citation blocks — brighter than the page. */
  panel: { background: colors.surface },

  /**
   * Full-bleed figure scrim. Light, not dark: captions stay in ink so the
   * slide keeps its printed appearance.
   */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(251, 250, 247, 0.10) 0%, rgba(251, 250, 247, 0.94) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons — restrained controls for interactive or web-hosted decks.
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '17px',
  fontWeight: typography.weight.medium,
  letterSpacing: '0em',
  lineHeight: 1,
  padding: '12px 22px',
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
    sm: { fontSize: '15px', padding: '8px 16px', borderRadius: radius.sm },
    md: { fontSize: '17px', padding: '12px 22px', borderRadius: radius.md },
    lg: { fontSize: '19px', padding: '15px 30px', borderRadius: radius.lg },
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
    hover: { background: colors.backgroundSubtle, border: `1px solid ${colors.borderStrong}` },
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
    active: { background: withAlpha(palette.blue600, 0.12) },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — figure frames, result tables, method blocks, citations.
 * ========================================================================= */

const cards = {
  /** Figure or table frame — thin rule, white fill, no lift. */
  base: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: 'none',
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** Highlighted figure or headline result — the only card that lifts. */
  elevated: {
    background: colors.surfaceElevated,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Listings, equations and table bodies — inset, ruled, print-safe. */
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
   * variant is an opaque white panel for captions over a full-bleed figure.
   */
  glass: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /** Journal-style quote or key finding — tinted, with a leading rule. */
  accent: {
    background: colors.primarySubtle,
    border: `1px solid ${withAlpha(palette.blue600, 0.22)}`,
    boxShadow: 'none',
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — a rule change, nothing more. */
  hover: {
    background: colors.surface,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: shadows.sm,
  },
};

/* ============================================================================
 * 12. Motion — 150–200ms, opacity-led, close to invisible.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 60,
    fast: 110,
    normal: 160,
    slow: 200,
    slower: 260,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    entrance: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    exit: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
    /** Kept for API parity — mapped to the entrance curve; no springs here. */
    spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    linear: 'linear',
  },

  /** Named presets: from/to property maps plus timing. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 160,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 190,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 190,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(10px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 190,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.995)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 170,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(2px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 200,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  /** Sequencing for bullet reveals, table rows and timeline milestones. */
  stagger: {
    step: 50,
    initialDelay: 60,
    maxItems: 14,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fade',
    duration: 180,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
  /** Wide enough for two-column method/result comparisons. */
  maxContentWidth: '1400px',
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

  /** Nth figure-series color, wrapping around the set. */
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
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#1a3d6d' }
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
  id: 'academic',
  name: 'Academic',
  description:
    'Research presentation theme: warm white page, white figure panels, deep ' +
    'academic blue, slate secondaries, ruled tables, print-safe series colors.',
  ai: {
  summary:
    "Formal academic presentations for education, research, science, engineering, and university lectures.",

  bestFor: [
    "Research Papers",
    "University Lectures",
    "Academic Conferences",
    "Scientific Presentations",
    "Engineering Topics",
    "Medical Research",
    "Thesis Defense",
    "Case Studies",
    "Technical Research",
    "Educational Content",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science Education"
  ],

  avoidFor: [
    "Startup Pitches",
    "Marketing Campaigns",
    "Product Launches",
    "Gaming",
    "Cinematic Storytelling"
  ],

  keywords: [
    "research",
    "paper",
    "journal",
    "academic",
    "education",
    "university",
    "college",
    "lecture",
    "thesis",
    "conference",
    "study",
    "analysis",
    "experiment",
    "science",
    "engineering",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "computer science",
    "statistics",
    "methodology",
    "results",
    "discussion",
    "conclusion"
  ],

  style: [
    "Academic",
    "Formal",
    "Structured",
    "Professional",
    "Readable",
    "Research Focused",
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
