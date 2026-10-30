// All landing copy and showcase data in one place — sections stay
// presentation-only and the copy can be edited without touching JSX.

import {
  Sparkles,
  Palette,
  Code2,
  Share2,
  Download,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

// ── Navigation ──────────────────────────────────────────────────

// Section anchors are root-relative ("/#features") so they resolve from any
// page — on the landing page itself the browser treats them as in-page jumps.
export const NAV_LINKS: { label: string; href: string; soon?: boolean; external?: boolean }[] = [
  { label: "Features", href: "/#features" },
  { label: "Showcase", href: "/showcase" },
  { label: "Docs", href: "/docs" },
  { label: "Community", href: "/#community" },
  { label: "Pricing", href: "#", soon: true },
  { label: "About", href: "/about" },
];

export const GITHUB_URL = "https://github.com/nikhil-dex";
export const CONTACT_EMAIL = "info.noyau@gmail.com";

// ── Trusted by (placeholder wordmarks) ──────────────────────────

export const TRUSTED_BY = [
  "Northwind",
  "Acme Corp",
  "Vertex",
  "Halcyon",
  "Nimbus Labs",
  "Quantica",
  "Structura",
  "Orbital",
];

// ── Live gallery ────────────────────────────────────────────────
// Real AIRDeck HTML exports served from /public/gallery — each one is the
// actual presentation running in an iframe, not a screenshot. Widths and
// tilts vary slightly so the wall reads as a collage, not a grid.

export type GalleryDeck = {
  src: string;
  title: string;
  category: string;
  width: number; // desktop card width in px
  tilt: number; // resting rotation in degrees
};

export const GALLERY_DECKS: GalleryDeck[] = [
  {
    src: "/gallery/airdeck-pitch.html",
    title: "AIRDeck — Product Launch",
    category: "Startup Pitch",
    width: 540,
    tilt: -1.5,
  },
  {
    src: "/gallery/quantum-research.html",
    title: "Quantum Core Matrix",
    category: "Research",
    width: 480,
    tilt: 1.2,
  },
  {
    src: "/gallery/data-analyst-report.html",
    title: "Data Analyst — Power BI",
    category: "Business Report",
    width: 560,
    tilt: 0,
  },
  {
    src: "/gallery/cybersecurity-keynote.html",
    title: "Defending the Digital Frontier",
    category: "Keynote",
    width: 500,
    tilt: 1.8,
  },
  {
    src: "/gallery/future-of-ai.html",
    title: "The Future of AI",
    category: "Education",
    width: 460,
    tilt: -2,
  },
  {
    src: "/gallery/product-demo.html",
    title: "Autonomous Intelligence",
    category: "Product Demo",
    width: 540,
    tilt: 1,
  },
  {
    src: "/gallery/cosmic-marketing.html",
    title: "The Cosmic Engine",
    category: "Marketing",
    width: 490,
    tilt: -1.2,
  },
];

// ── Features ────────────────────────────────────────────────────

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Prompt to deck in seconds",
    description:
      "Describe your presentation in one sentence. AIRDeck plans the slides, picks the layout and writes every word — a complete deck, not a template.",
  },
  {
    icon: Palette,
    title: "Ten hand-crafted themes",
    description:
      "Linear, Apple, Aurora, GitHub Dark and more — every theme is a full design system with its own colors, typography and motion. The AI picks the right one for your topic.",
  },
  {
    icon: Code2,
    title: "Slides you can edit like code",
    description:
      "Every slide is standalone HTML you own. Open the built-in editor, tweak anything, and watch the preview update live — no lock-in, no black box.",
  },
  {
    icon: Share2,
    title: "Share with one link",
    description:
      "Publish any deck to a public link in one click. Viewers get the full experience in the browser — animations, interactivity and all.",
  },
  {
    icon: Download,
    title: "Export anywhere",
    description:
      "Download as PowerPoint for the boardroom or standalone HTML for the web. Your presentation goes wherever the meeting is.",
  },
  {
    icon: KeyRound,
    title: "Bring your own key",
    description:
      "Plug in your own Gemini API key and generate for free — your key never leaves your browser session. Or use credits and skip the setup.",
  },
];

// ── Component showcase ──────────────────────────────────────────

export type SlideKind =
  | "hero"
  | "dashboard"
  | "timeline"
  | "code"
  | "comparison"
  | "pricing"
  | "stats";

export const SLIDE_COMPONENTS: {
  kind: SlideKind;
  name: string;
  description: string;
  wide?: boolean;
}[] = [
  { kind: "hero", name: "Hero", description: "Openers, section breaks and closers", wide: true },
  { kind: "dashboard", name: "Dashboard", description: "KPIs and metrics at a glance" },
  { kind: "timeline", name: "Timeline", description: "History, roadmaps, evolution" },
  { kind: "code", name: "Code", description: "Syntax-aware code walkthroughs" },
  { kind: "comparison", name: "Comparison", description: "Before / after, pros / cons" },
  { kind: "pricing", name: "Pricing", description: "Tiers and plans, side by side" },
  { kind: "stats", name: "Stats", description: "Big numbers that land the point" },
];

// ── How it works ────────────────────────────────────────────────

export const HOW_STEPS = [
  {
    step: "01",
    title: "Prompt",
    description:
      "Type what you need — “a 10-slide pitch for a climate-tech startup”. That's the whole job.",
  },
  {
    step: "02",
    title: "AI",
    description:
      "The model plans your narrative, chooses a theme, and writes a structured deck — validated slide by slide before anything renders.",
  },
  {
    step: "03",
    title: "Presentation",
    description:
      "The deck engine compiles standalone HTML slides. Edit them like code, share a link, or export to PowerPoint.",
  },
];

// ── Example showcase ────────────────────────────────────────────
// Each cover borrows its palette from a real AIRDeck theme so the
// examples preview the actual product range.

export type ExampleDeck = {
  category: string;
  title: string;
  slides: number;
  theme: string;
  bg: string;
  accent: string;
  text: string;
  muted: string;
};

export const EXAMPLE_DECKS: ExampleDeck[] = [
  {
    category: "Business",
    title: "Series A Pitch — Meridian Robotics",
    slides: 12,
    theme: "Linear",
    bg: "#08090a",
    accent: "#5e6ad2",
    text: "#f7f8f8",
    muted: "#8a8f98",
  },
  {
    category: "AI",
    title: "The State of Generative Models, 2026",
    slides: 14,
    theme: "Cyberpunk",
    bg: "#0b0413",
    accent: "#ff2ec4",
    text: "#f4e9ff",
    muted: "#9b7fb8",
  },
  {
    category: "Research",
    title: "CRISPR Off-Target Effects: A Meta-Analysis",
    slides: 18,
    theme: "Academic",
    bg: "#fbf9f4",
    accent: "#8a1f2d",
    text: "#241f1c",
    muted: "#7a736b",
  },
  {
    category: "Education",
    title: "Introduction to Photosynthesis",
    slides: 9,
    theme: "Notion",
    bg: "#ffffff",
    accent: "#2e6fdb",
    text: "#37352f",
    muted: "#9b978f",
  },
  {
    category: "Programming",
    title: "Rust Ownership, Explained with Diagrams",
    slides: 11,
    theme: "GitHub Dark",
    bg: "#0d1117",
    accent: "#58a6ff",
    text: "#e6edf3",
    muted: "#8b949e",
  },
  {
    category: "Marketing",
    title: "Q3 Growth Review — Atlas CRM",
    slides: 10,
    theme: "Stripe",
    bg: "#ffffff",
    accent: "#635bff",
    text: "#0a2540",
    muted: "#6b7c93",
  },
];

// ── FAQ ─────────────────────────────────────────────────────────

export const FAQS = [
  {
    q: "What is AIRDeck?",
    a: "AIRDeck is an AI presentation platform. You describe a presentation in plain language and it generates a fully designed, themed slide deck — as real HTML you can edit, share and export.",
  },
  {
    q: "Do I need design skills?",
    a: "No. Every deck is built on one of ten hand-crafted themes — professional color systems, typography and layout are applied automatically. You just bring the idea.",
  },
  {
    q: "Can I edit the generated slides?",
    a: "Yes — that's the point. Every slide is standalone HTML. The built-in editor gives you a code view with live preview, so you can change anything from a word to the whole layout.",
  },
  {
    q: "How do I share or export a deck?",
    a: "Publish a public link in one click for the full in-browser experience, or export as PowerPoint (.pptx) and standalone HTML. Links keep animations and interactivity alive.",
  },
  {
    q: "What does it cost?",
    a: "Generation runs on credits — one credit per deck. If you bring your own Gemini API key, generation is free and no credits are used.",
  },
  {
    q: "Which AI powers the generation?",
    a: "AIRDeck currently uses Google's Gemini models. The deck engine validates everything the model produces before it renders, so you never get a broken slide.",
  },
];

// ── Footer ──────────────────────────────────────────────────────

export const FOOTER_COLUMNS: {
  heading: string;
  links: { label: string; href: string; external?: boolean; soon?: boolean }[];
}[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Themes", href: "/#themes" },
      { label: "Components", href: "/#components" },
      { label: "Showcase", href: "/showcase" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Community", href: "/#community" },
      { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#", soon: true },
      { label: "Terms", href: "#", soon: true },
    ],
  },
];
