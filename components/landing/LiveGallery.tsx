"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import Reveal from "./Reveal";
import { GALLERY_DECKS, type GalleryDeck } from "./landing-data";

// Live Gallery — the wall shows REAL exported AIRDeck presentations running
// in iframes, not screenshots. The exports are served same-origin from
// /public/gallery and expose the viewer's global show(n)/i API, so the wall
// can auto-advance multi-slide decks while their internal animations play.
//
// Interaction model: on the wall, a transparent overlay captures hover/click
// (keeping the marquee at 60fps and opening the modal); inside the modal the
// iframe is fully interactive — tabs, buttons and keyboard all work.

type ViewerWindow = Window & {
  show?: (n: number) => void;
  i?: number;
  slides?: string[];
};

function advanceDecks(root: HTMLElement) {
  root.querySelectorAll("iframe").forEach((frame) => {
    try {
      const w = frame.contentWindow as ViewerWindow | null;
      if (
        w &&
        typeof w.show === "function" &&
        typeof w.i === "number" &&
        Array.isArray(w.slides) &&
        w.slides.length > 1
      ) {
        w.show((w.i + 1) % w.slides.length);
      }
    } catch {
      // Cross-origin or not-yet-loaded frames: skip silently.
    }
  });
}

function DeckCard({
  deck,
  mounted,
  onOpen,
  ariaHidden = false,
}: {
  deck: GalleryDeck;
  mounted: boolean;
  onOpen: (deck: GalleryDeck) => void;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="lp-live-card glass-card rounded-[20px] p-2.5 shrink-0 max-w-[82vw]"
      style={{ "--tilt": `${deck.tilt}deg`, width: deck.width } as React.CSSProperties}
      aria-hidden={ariaHidden}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#0b0f1a]">
        {mounted && (
          <iframe
            src={deck.src}
            title={`${deck.title} — live preview`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="absolute inset-0 w-full h-full border-0"
            tabIndex={-1}
          />
        )}
        {/* Overlay: keeps wall hover/click smooth; full interactivity lives in the modal */}
        <button
          className="group absolute inset-0 w-full h-full cursor-pointer"
          aria-label={`Open ${deck.title} fullscreen`}
          tabIndex={ariaHidden ? -1 : 0}
          onClick={() => onOpen(deck)}
        >
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-xs font-medium text-white border border-white/20">
              <Maximize2 className="w-3.5 h-3.5" />
              Open live
            </span>
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between px-2 pt-2.5 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex w-1.5 h-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-[#b3ffc8] opacity-60" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#b3ffc8]" />
          </span>
          <p className="text-sm font-semibold text-[#e8e6f0] truncate">{deck.title}</p>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-[rgba(232,230,240,0.4)] border border-white/10 rounded-full px-2 py-0.5 shrink-0 ml-3">
          {deck.category}
        </span>
      </div>
    </div>
  );
}

export default function LiveGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  // Mount iframes only once the section approaches the viewport; both wall
  // copies mount together so their decks stay in step.
  const inView = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const [openDeck, setOpenDeck] = useState<GalleryDeck | null>(null);

  // Auto-advance every multi-slide deck on one shared clock.
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (document.hidden || !wallRef.current) return;
      advanceDecks(wallRef.current);
    }, 4500);
    return () => clearInterval(id);
  }, [inView]);

  // Modal: lock page scroll and close on Escape.
  useEffect(() => {
    if (!openDeck) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDeck(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openDeck]);

  return (
    <section ref={sectionRef} id="live-gallery" className="lp-section relative py-20 sm:py-28">
      {/* Section backdrop: contained radial lighting + faint grid, nothing loud */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 25% 20%, rgba(94,173,255,0.08) 0%, transparent 70%), radial-gradient(50% 45% at 78% 75%, rgba(255,110,247,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(70% 70% at 50% 50%, #000 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, #000 30%, transparent 100%)",
          }}
        />
      </div>

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-4 px-4">
        <Reveal>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#e8e6f0]">
              Live Gallery
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b3ffc8]/30 bg-[#b3ffc8]/5 px-2.5 py-1 mt-1">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-[#b3ffc8] opacity-60" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#b3ffc8]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3ffc8]">
                Live
              </span>
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 text-base sm:text-lg text-[rgba(232,230,240,0.45)]">
            Real interactive presentations generated with AIRDeck. Every
            presentation below is fully functional and running live.
          </p>
        </Reveal>
      </div>

      {/* Status row */}
      <Reveal delay={0.14}>
        <div className="flex items-center justify-center gap-3 mb-12 font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.35)]">
          <span className="text-[#b3ffc8]">● Live</span>
          <span aria-hidden>·</span>
          <span>Real presentations running</span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Interactive HTML export</span>
        </div>
      </Reveal>

      {/* The wall */}
      <Reveal delay={0.2}>
        <div className="lp-wall" ref={wallRef}>
          <div className="lp-wall-track py-6">
            <div className="lp-wall-group">
              {GALLERY_DECKS.map((deck) => (
                <DeckCard key={deck.src} deck={deck} mounted={inView} onOpen={setOpenDeck} />
              ))}
            </div>
            <div className="lp-wall-group lp-wall-copy-b" aria-hidden>
              {GALLERY_DECKS.map((deck) => (
                <DeckCard
                  key={`b-${deck.src}`}
                  deck={deck}
                  mounted={inView}
                  onOpen={setOpenDeck}
                  ariaHidden
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <p className="text-center mt-8 text-xs text-[rgba(232,230,240,0.3)]">
          Hover to pause · click any presentation to present it fullscreen
        </p>
      </Reveal>

      {/* Fullscreen preview — the iframe here is fully interactive */}
      <AnimatePresence>
        {openDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-md"
            onClick={() => setOpenDeck(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="text-sm font-semibold text-[#e8e6f0] truncate">
                    {openDeck.title}
                  </p>
                  <span className="text-[9px] uppercase tracking-widest text-[rgba(232,230,240,0.45)] border border-white/15 rounded-full px-2 py-0.5 shrink-0">
                    {openDeck.category}
                  </span>
                </div>
                <button
                  onClick={() => setOpenDeck(null)}
                  aria-label="Close preview"
                  className="p-2 rounded-lg text-[rgba(232,230,240,0.6)] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/15 bg-[#0b0f1a] shadow-[0_0_80px_rgba(94,173,255,0.15)]">
                <iframe
                  src={openDeck.src}
                  title={openDeck.title}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-center text-xs text-[rgba(232,230,240,0.35)]">
                Fully interactive — use the on-deck controls, tabs and buttons
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
