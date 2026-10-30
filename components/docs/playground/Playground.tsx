"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CircleCheck, RotateCcw } from "lucide-react";
import SlidePreview from "../SlidePreview";
import {
  PLAYGROUND_COMPONENTS,
  PLAYGROUND_THEMES,
  compileSlide,
  exampleFor,
  type CompileOutcome,
} from "./engine";

// Theme × component × editable props → a slide compiled in your browser by
// the product's own compiler. Validation errors shown here are the exact
// strings the generation API would return.

const SELECT_CLASS =
  "w-full rounded-lg border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-[#e8e6f0] outline-none focus:border-[#5eadff]/50 transition-colors";

export default function Playground() {
  const [themeId, setThemeId] = useState("aurora");
  const [componentName, setComponentName] = useState("hero");
  const [propsText, setPropsText] = useState(() => exampleFor("hero"));
  const [outcome, setOutcome] = useState<CompileOutcome>(() =>
    compileSlide("aurora", "hero", exampleFor("hero"))
  );

  // Recompile on a short debounce so typing stays smooth.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setOutcome(compileSlide(themeId, componentName, propsText));
    }, 220);
    return () => window.clearTimeout(id);
  }, [themeId, componentName, propsText]);

  const selectComponent = (name: string) => {
    setComponentName(name);
    setPropsText(exampleFor(name));
  };

  const lineCount = useMemo(() => propsText.split("\n").length, [propsText]);

  return (
    <div className="my-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Controls */}
      <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pg-theme"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]"
          >
            Theme
          </label>
          <select
            id="pg-theme"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className={SELECT_CLASS}
          >
            {PLAYGROUND_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name} ({theme.mode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="pg-component"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]"
          >
            Component
          </label>
          <select
            id="pg-component"
            value={componentName}
            onChange={(e) => selectComponent(e.target.value)}
            className={SELECT_CLASS}
          >
            {PLAYGROUND_COMPONENTS.map((component) => (
              <option key={component.name} value={component.name}>
                {component.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Editor */}
        <div className="border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]">
              props · {lineCount} lines
            </span>
            <button
              onClick={() => setPropsText(exampleFor(componentName))}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] text-[rgba(232,230,240,0.55)] hover:text-white hover:border-white/25 transition-colors"
            >
              <RotateCcw aria-hidden className="w-3 h-3" /> Reset
            </button>
          </div>
          <label htmlFor="pg-props" className="sr-only">
            Component props as JSON
          </label>
          <textarea
            id="pg-props"
            value={propsText}
            onChange={(e) => setPropsText(e.target.value)}
            spellCheck={false}
            rows={14}
            className="docs-scroll w-full resize-y bg-black/40 px-4 py-3 font-mono text-[13px] leading-relaxed text-[rgba(232,230,240,0.85)] outline-none focus:bg-black/50 transition-colors"
          />
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]">
              live preview
            </span>
            {outcome.ok ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#b3ffc8]">
                <CircleCheck aria-hidden className="w-3 h-3" /> compiled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#f2c55c]">
                <AlertTriangle aria-hidden className="w-3 h-3" />
                {outcome.stage === "json" ? "invalid JSON" : "validation failed"}
              </span>
            )}
          </div>

          <div className="p-4">
            {outcome.ok ? (
              <SlidePreview
                html={outcome.html}
                title="Playground slide preview"
                label="live"
              />
            ) : (
              <div
                role="alert"
                className="rounded-xl border border-[#f2c55c]/25 bg-[#f2c55c]/[0.05] p-4"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#f2c55c]">
                  {outcome.stage === "json"
                    ? "The props are not valid JSON"
                    : "The compiler rejected this slide"}
                </p>
                <ul className="space-y-1 list-none">
                  {outcome.errors.map((error) => (
                    <li
                      key={error}
                      className="font-mono text-xs leading-relaxed text-[rgba(232,230,240,0.6)]"
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-white/10 px-4 py-2.5 text-[11px] text-[rgba(232,230,240,0.4)]">
        Compiled in your browser by AIRDeck&rsquo;s own compiler. Delete a
        required prop to see the validation errors the generation API returns.
      </p>
    </div>
  );
}
