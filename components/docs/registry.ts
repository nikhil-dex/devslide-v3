// Documentation adapter over the real deck registries.
//
// Nothing here restates product facts: theme and component documentation is
// read from `deck/themes` and `deck/components`, and every preview is a real
// slide produced by the real compiler. If a theme is added or a component's
// props change, these docs change with them — drift is impossible by
// construction.
//
// Server-only: this pulls the full theme registry, which must never reach the
// client bundle. The Playground imports the compiler separately, lazily.

import { compileDeck } from "@/deck/compile.js";
import { THEME_LIST } from "@/deck/themes";
import { COMPONENT_LIST } from "@/deck/components/index.js";

export type AiMeta = {
  summary: string;
  bestFor: string[];
  avoidFor: string[];
  keywords: string[];
  style?: string[];
};

export type PropDoc = {
  name: string;
  type: string;
  description: string;
  required: boolean;
};

export type ThemeDoc = {
  id: string;
  name: string;
  mode: string;
  version: string;
  description: string;
  ai: AiMeta;
  swatches: { label: string; value: string }[];
  fonts: { display: string; body: string };
  previewHtml: string;
};

export type ComponentDoc = {
  name: string;
  ai: AiMeta;
  props: PropDoc[];
  example: Record<string, unknown>;
  exampleJson: string;
  previewHtml: string;
};

/** Compile one slide and return the standalone document. Empty string on failure. */
export function compilePreview(
  themeId: string,
  componentName: string,
  props: Record<string, unknown>
): string {
  const result = compileDeck({
    version: 1,
    theme: themeId,
    slides: [{ component: componentName, props }],
  });
  return result.valid ? result.slides[0] : "";
}

/** The slide used to preview a theme — same content across all themes so the
 *  only visible difference is the design system itself. */
const THEME_PREVIEW_SLIDE = {
  component: "hero",
  props: {
    title: "Ideas in. Decks out.",
    subtitle: "Every theme is a complete design system.",
  },
};

export function getThemeDocs(): ThemeDoc[] {
  return THEME_LIST.map((theme) => ({
    id: theme.id,
    name: theme.name,
    mode: theme.mode,
    version: theme.version,
    description: theme.description,
    ai: {
      summary: theme.ai.summary,
      bestFor: theme.ai.bestFor,
      avoidFor: theme.ai.avoidFor,
      keywords: theme.ai.keywords,
      style: theme.ai.style,
    },
    swatches: [
      { label: "background", value: theme.colors.background },
      { label: "surface", value: theme.colors.surface },
      { label: "primary", value: theme.colors.primary },
      { label: "text", value: theme.colors.textPrimary },
      { label: "muted", value: theme.colors.textMuted },
    ],
    fonts: {
      display: theme.typography.display.fontFamily,
      body: theme.typography.body.fontFamily,
    },
    previewHtml: compilePreview(
      theme.id,
      THEME_PREVIEW_SLIDE.component,
      THEME_PREVIEW_SLIDE.props
    ),
  }));
}

export function getComponentDocs(previewTheme = "linear"): ComponentDoc[] {
  return COMPONENT_LIST.map((component) => {
    const props: PropDoc[] = Object.entries(component.props ?? {}).map(
      ([name, meta]: [string, { required?: boolean; type?: string; description?: string }]) => ({
        name,
        type: meta.type ?? "string",
        description: meta.description ?? "",
        required: Boolean(meta.required),
      })
    );

    return {
      name: component.name,
      ai: {
        summary: component.ai.summary,
        bestFor: component.ai.bestFor,
        avoidFor: component.ai.avoidFor,
        keywords: component.ai.keywords,
      },
      props,
      example: component.example,
      exampleJson: JSON.stringify(
        { component: component.name, props: component.example },
        null,
        2
      ),
      previewHtml: compilePreview(previewTheme, component.name, component.example),
    };
  });
}

/** Theme ids and component names, for the Playground's selects. */
export function getRegistryIndex() {
  return {
    themes: THEME_LIST.map((t) => ({ id: t.id, name: t.name, mode: t.mode })),
    components: COMPONENT_LIST.map((c) => ({
      name: c.name,
      example: c.example as Record<string, unknown>,
    })),
  };
}

/** The four stages of the pipeline, each computed with the real engine. */
export function getPipelineStages() {
  const prompt =
    "Create an opening slide for an investor pitch about electric aviation, " +
    "titled “The Future of Flight”.";

  const source = {
    version: 1,
    theme: "aurora",
    slides: [
      {
        component: "hero",
        props: {
          title: "The Future of Flight",
          subtitle: "Electric aviation, from prototype to fleet",
        },
      },
    ],
  };

  const result = compileDeck(source);
  const html = result.valid ? result.slides[0] : "";

  return {
    prompt,
    sourceJson: JSON.stringify(source, null, 2),
    // Trimmed for reading; the full document is what the preview renders.
    htmlExcerpt: html.split("\n").slice(0, 22).join("\n") + "\n…",
    htmlLineCount: html.split("\n").length,
    previewHtml: html,
  };
}
