"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { PenLine, Braces, Code2, MonitorPlay } from "lucide-react";
import CodeBlock from "./CodeBlock";

// Walk one slide through the real pipeline. Every stage below was produced
// by the actual engine at build time — the JSON is what the model returns,
// the HTML is what compileDeck() emits, and the preview renders that exact
// document. Only the step switch runs on the client.

export type PipelineStages = {
  prompt: string;
  sourceJson: string;
  htmlExcerpt: string;
  htmlLineCount: number;
};

const STEPS = [
  { key: "prompt", label: "Prompt", icon: PenLine, note: "What you write" },
  { key: "source", label: "Deck Source", icon: Braces, note: "What the model returns" },
  { key: "html", label: "Compiled HTML", icon: Code2, note: "What the compiler emits" },
  { key: "slide", label: "Rendered Slide", icon: MonitorPlay, note: "What your audience sees" },
] as const;

export default function Pipeline({
  stages,
  preview,
}: {
  stages: PipelineStages;
  /** Server-rendered <SlidePreview>, passed in so it ships no client JS. */
  preview: ReactNode;
}) {
  const [step, setStep] = useState<(typeof STEPS)[number]["key"]>("prompt");
  const active = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="my-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Stepper */}
      <div
        role="tablist"
        aria-label="Deck pipeline stages"
        className="docs-scroll flex overflow-x-auto border-b border-white/10"
      >
        {STEPS.map((s, i) => {
          const isActive = s.key === step;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`pipeline-panel-${s.key}`}
              id={`pipeline-tab-${s.key}`}
              onClick={() => setStep(s.key)}
              className={`relative flex min-w-max items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                isActive ? "text-[#e8e6f0]" : "text-[rgba(232,230,240,0.45)] hover:text-[rgba(232,230,240,0.75)]"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono ${
                  i <= active
                    ? "border-[#5eadff]/50 bg-[#5eadff]/10 text-[#8cc5ff]"
                    : "border-white/10 text-[rgba(232,230,240,0.3)]"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <s.icon aria-hidden className="w-3.5 h-3.5" />
                  {s.label}
                </span>
                <span className="text-[10px] text-[rgba(232,230,240,0.35)]">{s.note}</span>
              </span>
              {isActive && (
                <motion.span
                  layoutId="pipeline-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#5eadff] to-[#ff6ef7]"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Every panel stays mounted and inactive ones are hidden. Keeping them
          mounted means the compiled-slide iframe is never torn down and
          re-fetched when you step back to it, and panel switching cannot
          depend on an animation completing. */}
      <div className="p-4 sm:p-5">
        {STEPS.map(({ key }) => (
          <div
            key={key}
            role="tabpanel"
            id={`pipeline-panel-${key}`}
            aria-labelledby={`pipeline-tab-${key}`}
            hidden={step !== key}
            className={step === key ? "animate-[fadeIn_0.2s_ease]" : undefined}
          >
            {key === "prompt" && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.35)]">
                    prompt
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-[#b3ffc8]/90">
                    {stages.prompt}
                  </p>
                </div>
              )}

            {key === "source" && (
              <div className="[&>figure]:my-0">
                <CodeBlock
                  code={stages.sourceJson}
                  language="json"
                  filename="deck source — model output"
                  showLineNumbers
                  highlightLines={[2, 3]}
                  caption="Structured data, not markup. Lines 2–3 pin the version and theme; the validator checks everything before a single slide renders."
                />
              </div>
            )}

            {key === "html" && (
              <div className="[&>figure]:my-0">
                <CodeBlock
                  code={stages.htmlExcerpt}
                  language="html"
                  filename={`slide-1.html — first 22 of ${stages.htmlLineCount} lines`}
                  showLineNumbers
                  caption="A complete standalone document: the theme's tokens become CSS custom properties, and the component's own CSS follows."
                />
              </div>
            )}

            {key === "slide" && (
              <div>
                {preview}
                <p className="mt-3 text-xs text-[rgba(232,230,240,0.4)]">
                  This is the compiled document from the previous step,
                  rendered at its true 1920×1080 size and scaled to fit.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
