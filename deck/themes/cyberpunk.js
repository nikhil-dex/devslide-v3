/**
 * AIRDeck Theme — "Cyberpunk"
 * =============================================================================
 * AIRDeck's most dramatic theme, built to stay readable: near-black canvas,
 * layered graphite panels, thin luminous edges and one electric cyan lead with
 * purple and magenta support. Tokens only: no DOM, no components, no animations.
 *
 * API CONTRACT
 * ------------
 * Public shape is identical to `themes/linear.js`: same top-level keys, same
 * utility names and signatures, same `--ld-*` CSS variable namespace, same
 * exports. Only token values differ.
 *
 * Design intent
 * -------------
 *   • Glow lives on the EDGE of a panel, never behind the text. Body copy sits
 *     on flat fills at high contrast — the drama is structural, not textual.
 *   • Accent hues are pulled a step off full saturation so a projector doesn't
 *     bloom them, and so cyan-on-dark stays legible at small sizes.
 *   • One accent per slide: cyan leads, purple supports, magenta marks a single
 *     highlight, lime is the spare series. Never all four at once.
 *   • Shadows are soft and wide, not heavy; depth comes from layered surfaces.
 *   • Motion is 220–320ms, ease-out, with a 2px lift at most.
 *
 * Extending
 * ---------
 *   import cyberpunk from './themes/cyberpunk.js';
 *   const amberHud = cyberpunk.utilities.extend({
 *     colors: { primary: '#f2b544', accent: '#ff8a3d' },
 *   });
 *
 * @module themes/cyberpunk
 */

/* ============================================================================
 * 0. Internal helpers
 * ========================================================================= */

/**
 * Convert a #rgb / #rrggbb hex string to an rgba() string.
 * @param {string} hex   e.g. '#35d6f0'
 * @param {number} alpha 0–1
 * @returns {string} 'rgba(53, 214, 240, 0.5)'
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
  // Canvas ladder — near-black to graphite. Cool, but never blue-washed.
  void: '#04060a',
  canvas: '#070a10',
  surface: '#0e131b',
  surfaceAlt: '#151c26',
  raised: '#1e2632',

  // Text ladder — off-white down to cool gray.
  white: '#ffffff',
  text: '#e8eef5',
  textSoft: '#c2cdda',
  muted: '#8494a6',
  subtle: '#66768a',
  faint: '#4a5768',

  // Electric cyan — the lead accent.
  cyan300: '#8af0ff',
  cyan400: '#5ce4f7',
  cyan500: '#35d6f0',
  cyan600: '#1fb0cd',
  cyan700: '#17869d',

  // Purple — secondary accent.
  purple300: '#c4a6ff',
  purple400: '#b18cff',
  purple500: '#9a6bf5',
  purple600: '#7d4fd6',

  // Magenta — single highlight per slide.
  magenta400: '#f47fd0',
  magenta500: '#ea5cbe',
  magenta600: '#c8409e',

  // Lime — spare series and positive deltas.
  lime400: '#b6ea72',
  lime500: '#9fe356',

  // Remaining status hues.
  amber500: '#f2b544',
  red500: '#f4556a',
  blue500: '#6f8cf5',

  // Light-scheme primitives (used only by the light counterpart).
  lightCanvas: '#eef1f6',
  lightSurface: '#ffffff',
  lightSunken: '#e2e7ef',
  lightText: '#0b1119',
  lightMuted: '#5a6779',
};

/* ============================================================================
 * 2. Colors (semantic)
 * ========================================================================= */

const colors = {
  // Canvas & surfaces
  background: palette.canvas,
  backgroundSubtle: palette.void,
  surface: palette.surface,
  surfaceElevated: palette.surfaceAlt,
  surfaceSunken: palette.void,
  surfaceHover: palette.raised,
  overlay: 'rgba(4, 6, 10, 0.78)',

  // Brand
  primary: palette.cyan500,
  primaryHover: palette.cyan400,
  primaryActive: palette.cyan600,
  primarySubtle: withAlpha(palette.cyan500, 0.12),
  /** Dark ink on a cyan fill — the highest-contrast pairing in the theme. */
  primaryContrast: palette.void,

  secondary: palette.surfaceAlt,
  secondaryHover: palette.raised,
  secondaryContrast: palette.text,

  accent: palette.purple500,
  accentSubtle: withAlpha(palette.purple500, 0.14),

  // Status
  success: palette.lime500,
  successSubtle: withAlpha(palette.lime500, 0.13),
  warning: palette.amber500,
  warningSubtle: withAlpha(palette.amber500, 0.13),
  danger: palette.red500,
  dangerSubtle: withAlpha(palette.red500, 0.13),
  info: palette.cyan500,
  infoSubtle: withAlpha(palette.cyan500, 0.12),

  // Text
  textPrimary: palette.text,
  textSecondary: palette.textSoft,
  textMuted: palette.muted,
  textDisabled: palette.faint,
  textInverse: palette.void,
  textLink: palette.cyan400,
  textOnPrimary: palette.void,

  // Lines — thin and faintly lit; this is where the glow lives.
  border: withAlpha(palette.cyan500, 0.16),
  borderStrong: withAlpha(palette.cyan500, 0.32),
  borderSubtle: 'rgba(160, 190, 215, 0.08)',
  borderFocus: withAlpha(palette.cyan400, 0.7),
  divider: 'rgba(160, 190, 215, 0.10)',

  /** Series colors — cyan leads, then purple, magenta, lime, amber, blue. */
  chart: [
    palette.cyan500,
    palette.purple500,
    palette.magenta500,
    palette.lime500,
    palette.amber500,
    palette.blue500,
  ],
};

/**
 * Light scheme — the same HUD under daylight. Same token names, inverted
 * values, accents darkened so they survive on white.
 */
const lightColors = mergeTokens(colors, {
  background: palette.lightCanvas,
  backgroundSubtle: palette.lightSunken,
  surface: palette.lightSurface,
  surfaceElevated: palette.lightSurface,
  surfaceSunken: palette.lightSunken,
  surfaceHover: '#d9e0ea',
  overlay: 'rgba(11, 17, 25, 0.55)',

  primary: '#0e8fa8',
  primaryHover: '#12a3bf',
  primaryActive: palette.cyan700,
  primarySubtle: withAlpha('#0e8fa8', 0.12),
  primaryContrast: palette.white,

  secondary: palette.lightSunken,
  secondaryHover: '#d9e0ea',
  secondaryContrast: palette.lightText,

  accent: palette.purple600,
  accentSubtle: withAlpha(palette.purple600, 0.12),

  success: '#5da12a',
  successSubtle: withAlpha('#5da12a', 0.12),
  warning: '#b8801a',
  warningSubtle: withAlpha('#b8801a', 0.12),
  danger: '#cf3b52',
  dangerSubtle: withAlpha('#cf3b52', 0.12),
  info: '#0e8fa8',
  infoSubtle: withAlpha('#0e8fa8', 0.12),

  textPrimary: palette.lightText,
  textSecondary: '#2c3745',
  textMuted: palette.lightMuted,
  textDisabled: '#8b96a5',
  textInverse: palette.white,
  textLink: '#0e8fa8',
  textOnPrimary: palette.white,

  border: 'rgba(11, 17, 25, 0.13)',
  borderStrong: 'rgba(11, 17, 25, 0.22)',
  borderSubtle: 'rgba(11, 17, 25, 0.07)',
  borderFocus: withAlpha('#0e8fa8', 0.6),
  divider: 'rgba(11, 17, 25, 0.10)',

  chart: ['#0e8fa8', palette.purple600, palette.magenta600, '#5da12a', '#b8801a', '#4a68d4'],
});

/* ============================================================================
 * 3. Typography
 * ========================================================================= */

const fontStacks = {
  sans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ' +
    'Arial, "Noto Sans", sans-serif',
  /** Code, terminal output and HUD readouts only — never body copy. */
  mono:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ' +
    '"Liberation Mono", "Courier New", monospace',
};

/**
 * Roles are sized for a 1920×1080 slide canvas. Headings run large and heavy;
 * body stays at a plain weight and comfortable leading so the drama never
 * costs legibility. Scale with `utilities.scaleType(factor)`.
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
    fontSize: '108px',
    fontWeight: 700,
    letterSpacing: '-0.030em',
    lineHeight: 1.04,
  },
  heading: {
    fontFamily: fontStacks.sans,
    fontSize: '62px',
    fontWeight: 700,
    letterSpacing: '-0.022em',
    lineHeight: 1.12,
  },
  title: {
    fontFamily: fontStacks.sans,
    fontSize: '32px',
    fontWeight: 600,
    letterSpacing: '-0.010em',
    lineHeight: 1.3,
  },
  body: {
    fontFamily: fontStacks.sans,
    fontSize: '21px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.64,
  },
  /** Panel labels, axis ticks, node captions, system readouts. */
  caption: {
    fontFamily: fontStacks.sans,
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1.42,
  },
  code: {
    fontFamily: fontStacks.mono,
    fontSize: '17px',
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.66,
  },

  /** HUD label above a heading — wide tracking, set in the accent. */
  eyebrow: {
    fontFamily: fontStacks.sans,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.16em',
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

  /** Default slide padding — panels need room to read as floating. */
  slidePadding: '104px',
  sectionGap: '72px',
  stackGap: '24px',
  inlineGap: '10px',
};

/* ============================================================================
 * 5. Radius — medium. Chamfered-panel feel, not consumer-app roundness.
 * ========================================================================= */

const radius = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  pill: '999px',
  circle: '50%',
};

/* ============================================================================
 * 6. Shadows — soft and wide. `glow` is the only luminous token; use it once.
 * ========================================================================= */

const shadows = {
  none: 'none',
  sm: '0 2px 6px rgba(0, 0, 0, 0.5)',
  md: '0 6px 18px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4)',
  lg: '0 16px 40px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.42)',
  xl: '0 28px 72px rgba(0, 0, 0, 0.66), 0 8px 20px rgba(0, 0, 0, 0.48)',

  /** Inset top highlight — the edge light on a layered panel. */
  hairline: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  focus: `0 0 0 3px ${withAlpha(palette.cyan500, 0.38)}`,
  /** Neon edge: a tight ring plus a low outer bloom. Restrained on purpose. */
  glow: `inset 0 0 0 1px ${withAlpha(palette.cyan500, 0.42)}, 0 0 22px ${withAlpha(palette.cyan500, 0.22)}`,
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
 * 8. Gradients — cyan → purple → magenta, always at low alpha.
 * ========================================================================= */

const gradients = {
  /** Signature diagonal wash for section and title canvases. */
  aurora:
    `linear-gradient(146deg, ${withAlpha(palette.cyan500, 0.20)} 0%, ` +
    `${withAlpha(palette.purple500, 0.16)} 42%, ${withAlpha(palette.magenta500, 0.10)} 66%, ` +
    `${palette.canvas} 92%)`,

  /** Overhead cyan pool — the light rig above the stage. */
  halo:
    `radial-gradient(125% 85% at 50% -18%, ${withAlpha(palette.cyan500, 0.22)} 0%, ` +
    `${withAlpha(palette.purple500, 0.10)} 40%, rgba(7, 10, 16, 0) 72%)`,

  /** Low magenta bloom from the corner — one per slide, opposite the halo. */
  ember:
    `radial-gradient(78% 68% at 4% 104%, ${withAlpha(palette.magenta500, 0.16)} 0%, ` +
    'rgba(7, 10, 16, 0) 62%)',

  /** Top-light sheen for layered panels and KPI displays. */
  surfaceSheen:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',

  /** Primary action fill — cyan into deep teal. Never into magenta. */
  brand: `linear-gradient(135deg, ${palette.cyan400} 0%, ${palette.cyan600} 100%)`,

  /** Gradient text — apply with background-clip: text. */
  text:
    `linear-gradient(94deg, ${palette.text} 0%, ${palette.cyan300} 54%, ` +
    `${palette.purple300} 100%)`,

  /** Hairline that fades at both ends — connector rules and timeline spines. */
  ruleFade:
    `linear-gradient(90deg, rgba(53, 214, 240, 0) 0%, ${withAlpha(palette.cyan500, 0.45)} 50%, ` +
    'rgba(53, 214, 240, 0) 100%)',

  /** Bottom fade for cropped media, terminal output and long series. */
  fadeOut: `linear-gradient(180deg, rgba(7, 10, 16, 0) 0%, ${palette.canvas} 100%)`,
};

/* ============================================================================
 * 9. Backgrounds — ready-to-apply slide canvases
 *
 * Use-case mapping (the Linear key set covers the brief; no keys added):
 *   content slides, comparison splits    → canvas
 *   title slides and product reveals     → hero
 *   section breaks, chapter cards        → aurora
 *   control-center dashboards, KPI walls → dotGrid
 *   mission timelines, architecture      → lineGrid
 *   code, terminal, tables, system quotes → panel
 *   framed media and full-bleed stills   → scrim
 * ========================================================================= */

const dotGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' " +
  "height='36'%3E%3Ccircle cx='1' cy='1' r='1' fill='%2335d6f0' fill-opacity='0.12'/%3E%3C/svg%3E\")";

const lineGrid =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' " +
  "height='72'%3E%3Cpath d='M72 0H0V72' fill='none' stroke='%2335d6f0' " +
  "stroke-opacity='0.08' stroke-width='1'/%3E%3C/svg%3E\")";

const backgrounds = {
  /** Default slide canvas — near black. */
  canvas: { background: colors.background },

  /** Title slides and reveals: overhead cyan pool, low magenta bloom. */
  hero: {
    background: `${gradients.halo}, ${gradients.ember}, ${colors.background}`,
  },

  /** Section breaks — the full diagonal wash. */
  aurora: { background: `${gradients.aurora}, ${colors.background}` },

  /** Control-center dashboards — cyan dot field behind KPI panels. */
  dotGrid: {
    background: `${dotGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Mission timelines, architecture and comparison layouts. */
  lineGrid: {
    background: `${lineGrid}, ${colors.background}`,
    backgroundRepeat: 'repeat',
  },

  /** Layered panel fill — code, terminal, tables, system messages. */
  panel: {
    background: `${gradients.surfaceSheen}, ${colors.surface}`,
  },

  /** Framed media scrim so captions stay legible over stills. */
  scrim: {
    background:
      'linear-gradient(180deg, rgba(4, 6, 10, 0.22) 0%, rgba(4, 6, 10, 0.9) 100%)',
  },
};

/* ============================================================================
 * 10. Buttons — dark housings with a lit edge; the fill arrives on hover.
 * ========================================================================= */

const buttonBase = {
  fontFamily: fontStacks.sans,
  fontSize: '16px',
  fontWeight: typography.weight.semibold,
  letterSpacing: '0.02em',
  lineHeight: 1,
  padding: '14px 26px',
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
    sm: { fontSize: '14px', padding: '10px 18px', borderRadius: radius.sm },
    md: { fontSize: '16px', padding: '14px 26px', borderRadius: radius.md },
    lg: { fontSize: '18px', padding: '17px 34px', borderRadius: radius.lg },
  },

  /** Dark housing, cyan edge and label; hover fills cyan with dark ink. */
  primary: {
    ...buttonBase,
    background: colors.surfaceElevated,
    color: colors.primary,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.sm}, ${shadows.hairline}`,
    hover: {
      background: colors.primary,
      color: colors.textOnPrimary,
      border: `1px solid ${palette.cyan400}`,
      boxShadow: shadows.glow,
    },
    active: {
      background: colors.primaryActive,
      color: colors.textOnPrimary,
      boxShadow: shadows.sm,
    },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: {
      background: colors.surface,
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
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.hairline,
    hover: { background: colors.surfaceHover, border: `1px solid ${colors.border}` },
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
    hover: { background: colors.primarySubtle, color: colors.primary },
    active: { background: withAlpha(palette.cyan500, 0.18) },
    focus: { boxShadow: shadows.focus, outline: 'none' },
    disabled: { color: colors.textDisabled, cursor: 'not-allowed' },
  },
};

/* ============================================================================
 * 11. Cards — floating panels. Edge light, soft shadow, medium radius.
 * ========================================================================= */

const cards = {
  base: {
    background: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: `${shadows.md}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textSecondary,
  },

  /** KPI displays and feature panels — the highest float in the theme. */
  elevated: {
    background: `${gradients.surfaceSheen}, ${colors.surfaceElevated}`,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.xl}, ${shadows.hairline}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textSecondary,
  },

  /** Code, terminal output and table bodies — inset, unlit, no float. */
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
   * variant is an opaque layered panel for content over framed media.
   */
  glass: {
    background: palette.surfaceAlt,
    border: `1px solid ${colors.border}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
    borderRadius: radius.lg,
    padding: spacing.md,
    backdropFilter: 'none',
    color: colors.textPrimary,
  },

  /** The lit panel — one per slide. This is the only card that glows. */
  accent: {
    background: `${gradients.halo}, ${colors.surfaceElevated}`,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.glow}, ${shadows.lg}`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    color: colors.textPrimary,
  },

  /** Hover state for clickable cards — the edge brightens, panel lifts 2px. */
  hover: {
    background: colors.surfaceHover,
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: `${shadows.lg}, ${shadows.hairline}`,
  },
};

/* ============================================================================
 * 12. Motion — 220–320ms, ease-out, opacity- and edge-led. No overshoot.
 * ========================================================================= */

const motion = {
  duration: {
    instant: 90,
    fast: 160,
    normal: 240,
    slow: 320,
    slower: 440,
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
    duration: 240,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 320,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 320,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  slide: {
    from: { opacity: 0, transform: 'translateX(24px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: 320,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.985)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 280,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  /** Light blur only — a soft focus-in, not a frosted wipe. */
  blurIn: {
    from: { opacity: 0, filter: 'blur(5px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 320,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  /** Sequencing for KPI panels, timeline nodes and list reveals. */
  stagger: {
    step: 70,
    initialDelay: 90,
    maxItems: 12,
  },

  /** Slide-to-slide transition default. */
  transition: {
    preset: 'fadeUp',
    duration: 320,
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
  maxContentWidth: '1480px',
  columnGap: spacing.lg,
  rowGap: spacing.md,
  grid: { columns: 12, gutter: '32px' },
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
   * @param {'dark'|'light'} [mode]
   * @returns {Record<string, string>} e.g. { '--ld-color-primary': '#35d6f0' }
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
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description:
    'Cinematic sci-fi theme: near-black canvas, layered graphite panels, lit ' +
    'hairline edges, cyan lead with purple and magenta support, 220–320ms motion.',
  ai: {
  summary:
    "A futuristic cinematic theme designed for cybersecurity, AI, gaming, blockchain, hackathons, and emerging technologies.",

  bestFor: [
    "Cybersecurity",
    "Gaming",
    "Hackathons",
    "Artificial Intelligence",
    "Blockchain",
    "Cryptocurrency",
    "Web3",
    "Metaverse",
    "Future Technology",
    "Sci-Fi Concepts",
    "Digital Innovation",
    "Space Technology",
    "Robotics",
    "Quantum Computing"
  ],

  avoidFor: [
    "Academic Research",
    "Financial Reports",
    "Corporate Business Reports",
    "Legal Documents",
    "Traditional Education"
  ],

  keywords: [
    "cybersecurity",
    "hacking",
    "security",
    "gaming",
    "esports",
    "ai",
    "artificial intelligence",
    "robotics",
    "blockchain",
    "crypto",
    "web3",
    "metaverse",
    "future",
    "futuristic",
    "innovation",
    "hackathon",
    "sci-fi",
    "cyber",
    "quantum",
    "space",
    "automation",
    "technology"
  ],

  style: [
    "Futuristic",
    "Bold",
    "Cinematic",
    "High Contrast",
    "Energetic",
    "Technology Focused",
    "Immersive"
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
