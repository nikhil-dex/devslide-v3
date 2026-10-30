"use client";

import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";

// Renders a real compiled AIRDeck slide. `html` comes straight from
// compileDeck() — the document is never rewritten to fit the docs. It is
// rendered at its true 1920×1080 size and scaled down to the frame.
//
// The scale is measured rather than expressed in CSS: `scale()` needs a
// unitless number, and no container-query expression can produce one from a
// width. AIRDeck's own export viewer scales its slide frame the same way.
//
// The iframe is sandboxed without allow-same-origin, so slide content stays
// fully isolated from the documentation page.

const SLIDE_WIDTH = 1920;

export default function SlidePreview({
  html,
  label,
  title,
  className = "",
}: {
  html: string;
  label?: string;
  title: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const apply = () => {
      const width = el.clientWidth;
      if (width > 0) {
        el.style.setProperty("--slide-scale", String(width / SLIDE_WIDTH));
      }
    };

    // Measure immediately, then track layout changes.
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!html) {
    return (
      <div className={`docs-slide-frame rounded-xl border border-white/10 ${className}`}>
        <p className="absolute inset-0 flex items-center justify-center text-xs text-[rgba(232,230,240,0.35)]">
          Preview unavailable
        </p>
      </div>
    );
  }

  return (
    <figure className={`relative ${className}`}>
      <div ref={frameRef} className="docs-slide-frame rounded-xl border border-white/10">
        <iframe
          srcDoc={html}
          title={title}
          loading="lazy"
          sandbox="allow-scripts"
          scrolling="no"
        />
      </div>
      {label && (
        <figcaption className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.15em] text-[#b3ffc8] border border-[#b3ffc8]/20">
          <Radio aria-hidden className="w-2.5 h-2.5" />
          {label}
        </figcaption>
      )}
    </figure>
  );
}
