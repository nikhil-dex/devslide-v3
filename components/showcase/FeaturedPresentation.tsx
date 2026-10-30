"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Star, Terminal } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { FEATURED } from "./showcase-data";

// Large editorial hero card for one curated deck — live cover on the right,
// story on the left, with an expandable "View Prompt" panel.
export default function FeaturedPresentation({ mounted }: { mounted: boolean }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(FEATURED.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <Reveal>
      <article className="glass-card mx-auto max-w-6xl rounded-[24px] overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.25fr]">
          {/* Story */}
          <div className="p-7 sm:p-10 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#ff6ef7]/30 bg-[#ff6ef7]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff9ef9] mb-5">
              <Star className="w-3 h-3" /> Featured
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8e6f0]">
              {FEATURED.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[rgba(232,230,240,0.5)]">
              {FEATURED.description}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.35)] mb-1">
                  Style
                </dt>
                <dd className="text-[#e8e6f0]">{FEATURED.style}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.35)] mb-1">
                  Components
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {FEATURED.components.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-[rgba(232,230,240,0.65)]"
                    >
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={FEATURED.src}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              >
                <ExternalLink className="w-4 h-4" /> View Presentation
              </a>
              <button
                onClick={() => setShowPrompt((v) => !v)}
                aria-expanded={showPrompt}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-[rgba(232,230,240,0.75)] hover:border-white/30 hover:text-[#e8e6f0] transition-colors"
              >
                <Terminal className="w-4 h-4" />
                {showPrompt ? "Hide Prompt" : "View Prompt"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-xs leading-relaxed text-[#b3ffc8]/90">
                        {FEATURED.prompt}
                      </p>
                      <button
                        onClick={copyPrompt}
                        aria-label="Copy prompt"
                        className="shrink-0 p-1.5 rounded-md text-[rgba(232,230,240,0.5)] hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-[#b3ffc8]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live cover */}
          <div className="relative border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0b0f1a]">
            <div className="relative aspect-video lg:h-full lg:aspect-auto lg:min-h-[360px]">
              {mounted && (
                <iframe
                  src={FEATURED.src}
                  title={`${FEATURED.title} — live`}
                  loading="lazy"
                  sandbox="allow-scripts"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  tabIndex={-1}
                  aria-hidden
                />
              )}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
