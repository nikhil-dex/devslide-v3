"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Copy, ExternalLink, Layers, X } from "lucide-react";
import type { ShowcasePresentation } from "./showcase-data";

// Details modal — the iframe here is fully interactive (tabs, buttons and
// the deck's own controls all work). Escape closes; page scroll locks.
export default function PresentationModal({
  presentation,
  onClose,
}: {
  presentation: ShowcasePresentation | null;
  onClose: () => void;
}) {
  // Track WHICH presentation was copied — derived per-deck, so switching
  // decks naturally resets the indicator without an effect.
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copied = copiedId !== null && copiedId === presentation?.id;

  useEffect(() => {
    if (!presentation) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [presentation, onClose]);

  const copyPrompt = async () => {
    if (!presentation) return;
    try {
      await navigator.clipboard.writeText(presentation.prompt);
      setCopiedId(presentation.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <AnimatePresence>
      {presentation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${presentation.title} — presentation details`}
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-sm sm:text-base font-semibold text-[#e8e6f0] truncate">
                  {presentation.title}
                </h2>
                <span className="text-[9px] uppercase tracking-widest text-[#8cc5ff] border border-[#5eadff]/25 rounded-full px-2 py-0.5 shrink-0">
                  {presentation.category}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close details"
                className="p-2 rounded-lg text-[rgba(232,230,240,0.6)] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive preview */}
            <div className="aspect-video rounded-2xl overflow-hidden border border-white/15 bg-[#0b0f1a] shadow-[0_0_80px_rgba(94,173,255,0.15)]">
              <iframe
                src={presentation.src}
                title={presentation.title}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-0"
                allow="fullscreen"
                allowFullScreen
              />
            </div>

            {/* Metadata + actions */}
            <div className="glass-card mt-3 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <p className="flex-1 text-xs sm:text-sm leading-relaxed text-[rgba(232,230,240,0.55)]">
                {presentation.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[rgba(232,230,240,0.45)] shrink-0">
                <span className="border border-white/10 rounded-full px-2 py-0.5">
                  {presentation.style}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {presentation.slideCount} slide{presentation.slideCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />~{presentation.readingMinutes} min
                </span>
                <span className="hidden md:flex flex-wrap gap-1.5">
                  {presentation.components.map((c) => (
                    <span key={c} className="rounded-full border border-white/10 px-2 py-0.5">
                      {c}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={presentation.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </a>
                <button
                  onClick={copyPrompt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-xs font-medium text-[rgba(232,230,240,0.75)] hover:border-white/30 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#b3ffc8]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
