// Documentation content model.
//
// NAV is the single source of truth for the page: the left sidebar, the
// right "On This Page" panel and the scroll-spy all read from it. Adding a
// section means adding one entry here plus one <DocSection> in a content
// file — nothing else in the layout needs to change.

import {
  BookOpen,
  Rocket,
  Wand2,
  Palette,
  Blocks,
  Code2,
  FileDown,
  PenLine,
  Sparkles,
  LayoutTemplate,
  HelpCircle,
  Terminal,
  Plug,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export type DocSubsection = { id: string; title: string };

export type DocSectionMeta = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Rendered as a "Soon" pill in the sidebar; content is clearly unshipped. */
  soon?: boolean;
  subsections?: DocSubsection[];
};

export type DocGroup = {
  label: string;
  /** The route this group becomes when the docs split across pages. */
  path: string;
  sections: DocSectionMeta[];
};

/**
 * Routing mode. Today every section lives on /docs and links are in-page
 * anchors. When the docs grow into /docs/themes, /docs/components and so on,
 * flip this to "multi-page": `hrefFor` starts emitting group paths and the
 * sidebar, table of contents and search index all follow. No component needs
 * to change.
 */
export const DOCS_ROUTING: "single-page" | "multi-page" = "single-page";

export function hrefFor(groupPath: string, anchorId: string): string {
  return DOCS_ROUTING === "single-page"
    ? `#${anchorId}`
    : `${groupPath}#${anchorId}`;
}

export const NAV: DocGroup[] = [
  {
    label: "Getting Started",
    path: "/docs/getting-started",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        icon: BookOpen,
        subsections: [
          { id: "what-is-airdeck", title: "What is AIRDeck?" },
          { id: "how-it-works", title: "How it works" },
        ],
      },
      {
        id: "getting-started",
        title: "Getting Started",
        icon: Rocket,
        subsections: [
          { id: "requirements", title: "Requirements" },
          { id: "credits-and-byok", title: "Credits & your own key" },
        ],
      },
      {
        id: "first-presentation",
        title: "Generate Your First Presentation",
        icon: Wand2,
        subsections: [
          { id: "write-a-prompt", title: "Write a prompt" },
          { id: "edit-and-share", title: "Edit and share" },
        ],
      },
    ],
  },
  {
    label: "Core Concepts",
    path: "/docs/concepts",
    sections: [
      {
        id: "themes",
        title: "Themes",
        icon: Palette,
        subsections: [
          { id: "theme-catalog", title: "Theme catalog" },
          { id: "theme-tokens", title: "Design tokens" },
        ],
      },
      {
        id: "components",
        title: "Components",
        icon: Blocks,
        subsections: [
          { id: "component-catalog", title: "Component catalog" },
          { id: "deck-source", title: "Deck Source format" },
        ],
      },
      {
        id: "playground",
        title: "Playground",
        icon: FlaskConical,
        subsections: [{ id: "playground-try", title: "Try the compiler" }],
      },
    ],
  },
  {
    label: "Exporting",
    path: "/docs/export",
    sections: [
      {
        id: "html-export",
        title: "Interactive HTML Export",
        icon: Code2,
        subsections: [{ id: "html-anatomy", title: "Anatomy of an export" }],
      },
      {
        id: "pptx-export",
        title: "PowerPoint Export",
        icon: FileDown,
        subsections: [{ id: "pptx-tradeoffs", title: "What changes on export" }],
      },
    ],
  },
  {
    label: "Writing Prompts",
    path: "/docs/guides",
    sections: [
      {
        id: "prompt-guide",
        title: "Prompt Writing Guide",
        icon: PenLine,
        subsections: [
          { id: "prompt-anatomy", title: "Anatomy of a good prompt" },
          { id: "steering-output", title: "Steering the output" },
        ],
      },
      { id: "best-practices", title: "Best Practices", icon: Sparkles },
      { id: "examples", title: "Examples", icon: LayoutTemplate },
    ],
  },
  {
    label: "Reference",
    path: "/docs/reference",
    sections: [
      { id: "faq", title: "FAQ", icon: HelpCircle },
      { id: "api", title: "API", icon: Plug, soon: true },
      { id: "cli", title: "CLI", icon: Terminal, soon: true },
    ],
  },
];

/** Flat list of every anchor on the page, in document order (scroll-spy). */
export const ALL_ANCHORS: string[] = NAV.flatMap((group) =>
  group.sections.flatMap((section) => [
    section.id,
    ...(section.subsections?.map((s) => s.id) ?? []),
  ])
);

// ── Quick links (right rail) ────────────────────────────────────

export const QUICK_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Generate a presentation", href: "/generate" },
  { label: "Browse the showcase", href: "/showcase" },
  { label: "About AIRDeck", href: "/about" },
];

// ── Scramble phrases for the search placeholder ─────────────────

export const SEARCH_PHRASES = [
  "Search the docs…",
  "How do I pick a theme?",
  "What props does Timeline take?",
  "Export to PowerPoint",
  "Write a better prompt",
];

// ── Component reference ─────────────────────────────────────────
// Component documentation is NOT defined here. It is read from the live
// registry (deck/components) via components/docs/registry.ts, so props,
// required flags and authoring guidance can never drift from the code that
// renders the slides.

// ── Deck Source limits (from deck/schema.js) ────────────────────

export const SCHEMA_LIMITS = [
  { label: "Deck version", value: "1" },
  { label: "Slides per deck", value: "50 max" },
  { label: "Characters per text value", value: "5,000 max" },
  { label: "Prop nesting depth", value: "8 levels" },
];

// ── FAQ ─────────────────────────────────────────────────────────

export const DOC_FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "No. Writing a prompt is the whole workflow. The code view is there if you want it — every slide is plain HTML you can open and edit, but you can ship a full deck without reading a line of it.",
  },
  {
    q: "Can I edit a generated slide?",
    a: "Yes. Each slide is a standalone HTML document. Open the editor, change anything from a single word to the entire layout, and the preview updates as you type.",
  },
  {
    q: "What happens if the AI returns something invalid?",
    a: "The compiler validates the deck before rendering. If a theme, component or prop is unknown, generation fails with a specific error and — when you're using credits rather than your own key — the credit is refunded.",
  },
  {
    q: "Which AI model powers generation?",
    a: "AIRDeck currently generates decks with Google's Gemini models. You can use AIRDeck's key (metered by credits) or supply your own.",
  },
  {
    q: "Are my prompts or decks used for training?",
    a: "AIRDeck does not train models on your content. Prompts are sent to the model provider to generate your deck, and your decks stay in your account unless you choose to share a link.",
  },
  {
    q: "Can I use my own fonts or brand colors?",
    a: "Not through the prompt yet — themes are chosen from the built-in catalog. Since the export is standard HTML and CSS, you can override any of the theme's CSS custom properties by hand after generating.",
  },
];
