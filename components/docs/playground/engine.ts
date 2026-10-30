// Playground engine — the seam between the UI and the real deck compiler.
//
// This is deliberately the only module that imports the compiler and the
// registries on the client. The future Sandbox can import `compileSlide`
// unchanged and swap the UI above it; nothing about this contract is
// documentation-specific.
//
// `deck/` is dependency-free and browser-safe, so this is the actual product
// compiler running locally — not a mock or a re-implementation.

import { compileDeck } from "@/deck/compile.js";
import { THEME_LIST } from "@/deck/themes";
import { COMPONENT_LIST } from "@/deck/components/index.js";

export type CompileOutcome =
  | { ok: true; html: string }
  | { ok: false; stage: "json" | "deck"; errors: string[] };

export const PLAYGROUND_THEMES = THEME_LIST.map((theme) => ({
  id: theme.id as string,
  name: theme.name as string,
  mode: theme.mode as string,
}));

export const PLAYGROUND_COMPONENTS = COMPONENT_LIST.map((component) => ({
  name: component.name as string,
  example: component.example as Record<string, unknown>,
}));

export function exampleFor(componentName: string): string {
  const component = PLAYGROUND_COMPONENTS.find((c) => c.name === componentName);
  return JSON.stringify(component?.example ?? {}, null, 2);
}

/**
 * Parse the edited props and compile one slide.
 * Errors are surfaced separately per stage so the UI can explain whether the
 * JSON was malformed or the deck failed validation — the same distinction the
 * generation API makes.
 */
export function compileSlide(
  themeId: string,
  componentName: string,
  propsText: string
): CompileOutcome {
  let props: unknown;
  try {
    props = JSON.parse(propsText);
  } catch (error) {
    return {
      ok: false,
      stage: "json",
      errors: [error instanceof Error ? error.message : "Invalid JSON"],
    };
  }

  const result = compileDeck({
    version: 1,
    theme: themeId,
    slides: [{ component: componentName, props }],
  });

  if (!result.valid) return { ok: false, stage: "deck", errors: result.errors };
  return { ok: true, html: result.slides[0] };
}
