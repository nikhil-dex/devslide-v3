// Showcase catalog — deliberately shaped like a future database row so the
// static array can be swapped for an API/DB query without touching the UI.
// `src` points to real AIRDeck HTML exports served from /public/gallery —
// every cover on this page is the actual presentation running live.

import {
  Upload,
  TrendingUp,
  GitFork,
  LayoutTemplate,
  Library,
  Heart,
  MessageCircle,
  Bookmark,
  type LucideIcon,
} from "lucide-react";

export type ShowcasePresentation = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Visual style descriptor shown as the theme badge. */
  style: string;
  /** Slide-component vocabulary used across the deck. */
  components: string[];
  slideCount: number;
  /** Estimated presentation reading time, in minutes. */
  readingMinutes: number;
  /** Same-origin URL of the live HTML export. */
  src: string;
  /** The kind of prompt that produces a deck like this. */
  prompt: string;
  featured?: boolean;
};

export const CATEGORIES = [
  "All",
  "Business",
  "Startup",
  "AI",
  "Research",
  "Education",
  "Programming",
  "Marketing",
  "Finance",
  "Portfolio",
] as const;

export const PRESENTATIONS: ShowcasePresentation[] = [
  {
    id: "airdeck-pitch",
    title: "AIRDeck — Product Launch",
    description:
      "A confident single-slide product pitch: floating app mockup, AI badge and a clear call to action.",
    category: "Startup",
    style: "Aurora Glass",
    components: ["Hero", "Mockup", "CTA"],
    slideCount: 1,
    readingMinutes: 1,
    src: "/gallery/airdeck-pitch.html",
    prompt:
      "Create a product launch pitch slide for a web-native AI presentation platform called AIRDeck. Dark premium look, floating product mockup, strong call to action.",
    featured: true,
  },
  {
    id: "quantum-research",
    title: "Quantum Core Matrix",
    description:
      "Five fully interactive slides — clickable tabs, rotating holograms, radar sweeps and a spinning 3D cube.",
    category: "Research",
    style: "Cyber Neon",
    components: ["Tabs", "Hologram", "Radar", "3D Cube"],
    slideCount: 5,
    readingMinutes: 4,
    src: "/gallery/quantum-research.html",
    prompt:
      "Create a 5-slide interactive sci-fi research briefing about a quantum reactor. Each slide should have clickable tabs that switch content, with neon holographic visuals.",
  },
  {
    id: "data-analyst-report",
    title: "Data Analyst — Power BI",
    description:
      "A four-slide analytics walkthrough that turns a dashboard-heavy topic into a clean visual story.",
    category: "Finance",
    style: "Dashboard",
    components: ["Stats", "Charts", "Timeline"],
    slideCount: 4,
    readingMinutes: 3,
    src: "/gallery/data-analyst-report.html",
    prompt:
      "Create a presentation about the Data Analyst role and Power BI: responsibilities, key metrics, dashboard examples and a learning roadmap.",
  },
  {
    id: "cybersecurity-keynote",
    title: "Defending the Digital Frontier",
    description:
      "A keynote opener with an animated holographic shield, orbiting rings and floating status tags.",
    category: "Business",
    style: "Cyber Shield",
    components: ["Hero", "Orbit Rings", "Status Tags"],
    slideCount: 1,
    readingMinutes: 1,
    src: "/gallery/cybersecurity-keynote.html",
    prompt:
      "Create a cybersecurity keynote title slide for a global summit. Dark tech look with an animated shield hologram and presenter credentials.",
  },
  {
    id: "future-of-ai",
    title: "The Future of AI",
    description:
      "A cinematic opener built around a pulsing neural core with orbiting rings and gradient typography.",
    category: "Education",
    style: "Deep Space",
    components: ["Hero", "Orbit Core", "CTA"],
    slideCount: 1,
    readingMinutes: 1,
    src: "/gallery/future-of-ai.html",
    prompt:
      "Create a keynote opening slide about the future of artificial intelligence. Cinematic dark style with a glowing energy core visual.",
  },
  {
    id: "product-demo",
    title: "Autonomous Intelligence",
    description:
      "Three slides with live behavior: a theme toggle button, an animated engine counter and a build pipeline.",
    category: "AI",
    style: "Terminal",
    components: ["Toggle", "Counter", "Progress"],
    slideCount: 3,
    readingMinutes: 2,
    src: "/gallery/product-demo.html",
    prompt:
      "Create an interactive product demo deck for an AI presentation engine: a slide with a clickable color-scheme toggle, an animated percentage counter, and a live compilation progress bar.",
  },
  {
    id: "cosmic-marketing",
    title: "The Cosmic Engine",
    description:
      "A two-slide brand story with pulsing energy cores, particle orbits and bold stat callouts.",
    category: "Marketing",
    style: "Cosmic",
    components: ["Hero", "Stats", "Particles"],
    slideCount: 2,
    readingMinutes: 2,
    src: "/gallery/cosmic-marketing.html",
    prompt:
      "Create a bold two-slide marketing deck about raw power and precision, with glowing cosmic visuals and big stat callouts.",
  },
];

export const FEATURED = PRESENTATIONS.find((p) => p.featured) ?? PRESENTATIONS[0];

// ── Coming soon (community platform) ────────────────────────────

export const COMING_SOON: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Upload, title: "Publish", description: "Share your decks to this page in one click." },
  { icon: TrendingUp, title: "Trending", description: "See what the community is presenting." },
  { icon: GitFork, title: "Fork", description: "Start from any public deck and remix it." },
  { icon: LayoutTemplate, title: "Templates", description: "Community structures for common talks." },
  { icon: Library, title: "Collections", description: "Curate decks into shareable sets." },
  { icon: Heart, title: "Likes", description: "Celebrate the decks that deserve it." },
  { icon: MessageCircle, title: "Comments", description: "Give feedback, slide by slide." },
  { icon: Bookmark, title: "Bookmarks", description: "Save inspiration for your next deck." },
];
