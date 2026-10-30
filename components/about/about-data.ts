// All About-page copy in one place — sections stay presentation-only.

import {
  Sparkles,
  Palette,
  Code2,
  Blocks,
  Zap,
  Globe2,
  Accessibility,
  Gauge,
  Heart,
  Layers,
  Lightbulb,
  Hammer,
  Rocket,
  GitFork,
  TrendingUp,
  Upload,
  LayoutTemplate,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

// ── Journey timeline ────────────────────────────────────────────

export type JourneyStep = {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
};

export const JOURNEY: JourneyStep[] = [
  {
    icon: Lightbulb,
    label: "The Problem",
    title: "Presentations felt stuck",
    description:
      "Most decks start the same way: a blank canvas, a template, and hours of dragging boxes around. Somewhere in that grind, the story becomes an afterthought — and the ideas deserve better.",
  },
  {
    icon: Zap,
    label: "The Idea",
    title: "What if slides were code?",
    description:
      "The web already knew how to be beautiful, interactive and shareable. So we asked a simple question: what if a presentation was a living web page — and AI wrote the first draft?",
  },
  {
    icon: Hammer,
    label: "Building AIRDeck",
    title: "An engine, not a template pack",
    description:
      "We built a deck engine from first principles: a structured slide language, a compiler that renders standalone HTML, hand-crafted themes, and a validation layer designed to catch broken slides before they ever render.",
  },
  {
    icon: Rocket,
    label: "AIRDeck Today",
    title: "From prompt to presentation",
    description:
      "Today AIRDeck turns a single prompt into a fully designed, interactive deck — editable like code, shareable as a link, exportable to PowerPoint. And it's just the beginning.",
  },
  {
    icon: Globe2,
    label: "The Future",
    title: "An open presentation ecosystem",
    description:
      "Community publishing, shared themes and components, collaboration — a place where presentations are created, remixed and improved together.",
  },
];

// ── The problem ─────────────────────────────────────────────────

export const PAIN_POINTS = [
  {
    title: "Hours lost to alignment",
    description: "Nudging boxes, matching fonts, eyedropping colors — busywork disguised as design.",
  },
  {
    title: "Generic templates",
    description: "Decks start to look the same. Templates flatten your story into someone else's layout.",
  },
  {
    title: "Static slides",
    description: "Modern audiences live on the interactive web — then we present to them with frozen rectangles.",
  },
  {
    title: "Repetitive workflows",
    description: "The same title-bullets-chart loop, rebuilt by hand, for each new presentation.",
  },
  {
    title: "Poor storytelling",
    description: "When most of your energy goes into formatting, little is left for the narrative that actually persuades.",
  },
];

// ── Why AIRDeck (philosophy) ────────────────────────────────────

export const PHILOSOPHY: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sparkles,
    title: "AI-first workflow",
    description: "You describe the idea; the engine plans the narrative, picks the layout and writes the first draft. You direct — it produces.",
  },
  {
    icon: Palette,
    title: "Beautiful by default",
    description: "Hand-crafted themes with real design systems behind them — color, type and rhythm decided by designers, applied automatically.",
  },
  {
    icon: Code2,
    title: "Interactive HTML presentations",
    description: "Every deck is a living web page. Animations run, charts respond, tabs click — in the browser, where your audience already is.",
  },
  {
    icon: Blocks,
    title: "Reusable components",
    description: "Slides are composed from purpose-built components — heroes, dashboards, timelines, code — not free-floating shapes.",
  },
  {
    icon: Zap,
    title: "Fast generation",
    description: "One prompt, one generation pass, a complete first draft — validated slide by slide before anything renders.",
  },
  {
    icon: Layers,
    title: "Modern web technologies",
    description: "Standards-based HTML and CSS you can open, read and own. No proprietary formats, no lock-in.",
  },
];

// ── What makes AIRDeck different ────────────────────────────────

export const COMPARISONS: { before: string; after: string }[] = [
  { before: "Manual design", after: "Describe your idea" },
  { before: "Static slides", after: "Interactive presentations" },
  { before: "Hours of formatting", after: "A generated first draft" },
  { before: "Generic templates", after: "Ten hand-crafted design systems" },
  { before: "Locked file formats", after: "HTML you own" },
];

// ── Principles ──────────────────────────────────────────────────

export const PRINCIPLES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Sparkles, title: "AI assists creativity", description: "The model drafts; you decide. AI is the instrument — you stay the author." },
  { icon: Palette, title: "Beautiful by default", description: "Good design shouldn't be a skill requirement. The default is the premium path." },
  { icon: Gauge, title: "Performance matters", description: "Decks are built to load fast and animate smoothly — on stage, on phones, in the browser." },
  { icon: Accessibility, title: "Accessibility first", description: "Contrast, keyboards and reduced motion are features, not afterthoughts." },
  { icon: Heart, title: "User experience first", description: "Every flow is measured by one thing: how quickly an idea becomes a deck." },
  { icon: Layers, title: "Consistency over complexity", description: "One design language, everywhere. Fewer concepts, deeper polish." },
];

// ── Community preview ───────────────────────────────────────────

export const COMMUNITY_FUTURE: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Upload, title: "Publish presentations", description: "Share your best decks with the world in one click." },
  { icon: TrendingUp, title: "Trending presentations", description: "Discover what the community is building right now." },
  { icon: GitFork, title: "Fork presentations", description: "Start from any public deck and make it yours." },
  { icon: LayoutTemplate, title: "Community templates", description: "Battle-tested structures for pitches, lectures and launches." },
  { icon: Store, title: "Theme & component marketplace", description: "Design systems and slide components, built and shared by creators." },
  { icon: Users, title: "Collaboration", description: "Build decks together — comments, versions and shared editing." },
];

// ── Stats ───────────────────────────────────────────────────────
// Real, verifiable product facts only — every number here is true of the
// engine today (theme registry, component registry, schema limits, exports).
// No invented usage metrics.

export type Stat = { value: number; suffix?: string; label: string };

export const STATS: Stat[] = [
  { value: 10, label: "Hand-crafted themes" },
  { value: 10, label: "Slide components" },
  { value: 2, label: "Export formats" },
  { value: 50, label: "Slides per deck, max" },
  { value: 1, label: "Prompt to a deck" },
  { value: 100, suffix: "%", label: "Standard HTML output" },
];
