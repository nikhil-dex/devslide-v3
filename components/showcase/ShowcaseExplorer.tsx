"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import FeaturedPresentation from "./FeaturedPresentation";
import PresentationCard from "./PresentationCard";
import PresentationModal from "./PresentationModal";
import {
  CATEGORIES,
  PRESENTATIONS,
  type ShowcasePresentation,
} from "./showcase-data";

const EASE = [0.16, 1, 0.3, 1] as const;

// The explorer owns all interactive state — search text, active category and
// the open modal — and composes the hero, filters, featured card and grid.
// Swapping PRESENTATIONS for a fetched dataset later touches nothing here.
export default function ShowcaseExplorer() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [openPresentation, setOpenPresentation] = useState<ShowcasePresentation | null>(null);

  // Live covers mount once the gallery approaches the viewport.
  const galleryRef = useRef<HTMLDivElement>(null);
  const mounted = useInView(galleryRef, { once: true, margin: "600px 0px" });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRESENTATIONS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return [p.title, p.description, p.category, p.style]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <div ref={galleryRef}>
      {/* ── Hero ── */}
      <section className="lp-section relative pt-36 sm:pt-44 pb-12 sm:pb-16 px-4 sm:px-6">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[480px] -z-10"
          style={{
            background:
              "radial-gradient(55% 65% at 50% 0%, rgba(94,173,255,0.12) 0%, rgba(255,110,247,0.05) 50%, transparent 80%)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...enter(0)}>
            <span className="tag">Showcase</span>
          </motion.div>
          <motion.h1
            {...enter(0.1)}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#e8e6f0]"
          >
            Explore presentations
            <br />
            <span className="text-gradient">built with AIRDeck</span>
          </motion.h1>
          <motion.p
            {...enter(0.2)}
            className="mt-5 text-base sm:text-lg text-[rgba(232,230,240,0.5)] max-w-xl mx-auto"
          >
            Every deck below is a real AIRDeck export, running live on this
            page — animations, interactions and all. Not a screenshot in sight.
          </motion.p>

          {/* Search */}
          <motion.div {...enter(0.3)} className="mt-9 max-w-xl mx-auto">
            <label htmlFor="showcase-search" className="sr-only">
              Search presentations
            </label>
            <div className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3.5 focus-within:border-[#5eadff]/50 transition-colors">
              <Search aria-hidden className="w-[18px] h-[18px] text-[rgba(232,230,240,0.4)] shrink-0" />
              <input
                id="showcase-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decks, styles, topics…"
                className="w-full bg-transparent text-sm text-[#e8e6f0] placeholder:text-[rgba(232,230,240,0.35)] outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category filters ── */}
      <section aria-label="Filter by category" className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-[#070709]"
                    : "text-[rgba(232,230,240,0.55)] border border-white/10 hover:border-white/25 hover:text-[#e8e6f0]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="showcase-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8cc5ff] to-[#c9a8ff]"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Featured ── */}
      <section aria-label="Featured presentation" className="px-4 sm:px-6 pb-14 sm:pb-20">
        <FeaturedPresentation mounted={mounted} />
      </section>

      {/* ── Gallery ── */}
      <section aria-label="Presentation gallery" className="px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.35)]">
            {visible.length} presentation{visible.length === 1 ? "" : "s"}
            {category !== "All" && ` · ${category}`}
          </p>

          {visible.length > 0 ? (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {visible.map((p) => (
                  <PresentationCard
                    key={p.id}
                    presentation={p}
                    mounted={mounted}
                    onPreview={setOpenPresentation}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass-card rounded-[20px] py-16 text-center">
              <SearchX aria-hidden className="w-8 h-8 mx-auto mb-4 text-[rgba(232,230,240,0.3)]" />
              <p className="text-sm font-semibold text-[#e8e6f0] mb-1.5">
                Nothing here yet
              </p>
              <p className="text-xs text-[rgba(232,230,240,0.4)] max-w-xs mx-auto">
                No presentations match this filter — once community publishing
                arrives, yours could be the first.
              </p>
            </div>
          )}
        </div>
      </section>

      <PresentationModal
        presentation={openPresentation}
        onClose={() => setOpenPresentation(null)}
      />
    </div>
  );
}
