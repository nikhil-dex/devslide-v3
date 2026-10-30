"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Copy, Download, ExternalLink, Eye, Layers } from "lucide-react";
import type { ShowcasePresentation } from "./showcase-data";

// Gallery card: the cover is the real presentation running in an iframe
// (pointer-events disabled — full interactivity lives in the modal and the
// opened deck). Action buttons reveal on hover and on keyboard focus.
export default function PresentationCard({
  presentation,
  mounted,
  onPreview,
}: {
  presentation: ShowcasePresentation;
  mounted: boolean;
  onPreview: (p: ShowcasePresentation) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(presentation.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — ignore.
    }
  };

  const actionClass =
    "inline-flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 hover:border-white/30 transition-colors";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group glass-card rounded-[20px] p-3 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(94,173,255,0.3),0_0_40px_rgba(94,173,255,0.15)] focus-within:shadow-[0_0_0_1px_rgba(94,173,255,0.3)]"
    >
      {/* Live cover */}
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#0b0f1a]">
        {mounted && (
          <iframe
            src={presentation.src}
            title={`${presentation.title} — live cover`}
            loading="lazy"
            sandbox="allow-scripts"
            className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden
          />
        )}

        {/* Actions — visible on hover and keyboard focus */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-3 pt-10 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
          <a
            href={presentation.src}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
            aria-label={`View ${presentation.title} in a new tab`}
          >
            <ExternalLink className="w-3.5 h-3.5" /> View
          </a>
          <button
            onClick={() => onPreview(presentation)}
            className={actionClass}
            aria-label={`Preview ${presentation.title}`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={copyPrompt}
            className={actionClass}
            aria-label={`Copy the prompt for ${presentation.title}`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#b3ffc8]" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Prompt
              </>
            )}
          </button>
          <a
            href={presentation.src}
            download
            className={actionClass}
            aria-label={`Download ${presentation.title} as HTML`}
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Meta */}
      <div className="px-2 pt-3 pb-1.5">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <h3 className="text-sm font-semibold text-[#e8e6f0] truncate">
            {presentation.title}
          </h3>
          <span className="text-[9px] uppercase tracking-widest text-[#8cc5ff] border border-[#5eadff]/25 bg-[#5eadff]/5 rounded-full px-2 py-0.5 shrink-0">
            {presentation.category}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[rgba(232,230,240,0.45)] line-clamp-2 mb-3">
          {presentation.description}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-[rgba(232,230,240,0.4)]">
          <span className="border border-white/10 rounded-full px-2 py-0.5">
            {presentation.style}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {presentation.slideCount} slide{presentation.slideCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />~{presentation.readingMinutes} min
          </span>
        </div>
      </div>
    </motion.article>
  );
}
