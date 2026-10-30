"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "lucide-react";
import DocsSidebar from "./DocsSidebar";
import DocsToc from "./DocsToc";
import DocsSearch from "./DocsSearch";
import ScrollProgress from "./ScrollProgress";
import { NAV } from "./docs-data";

// Three-column documentation shell. It owns the single piece of shared
// state — which heading you are currently reading — and hands it to both
// rails, so the sidebar and the "On This Page" panel can never disagree.
export default function DocsShell({ children }: { children: ReactNode }) {
  const [activeAnchor, setActiveAnchor] = useState("introduction");
  const [menuOpen, setMenuOpen] = useState(false);

  // anchor id → owning top-level section id
  const anchorToSection = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of NAV) {
      for (const section of group.sections) {
        map.set(section.id, section.id);
        for (const sub of section.subsections ?? []) map.set(sub.id, section.id);
      }
    }
    return map;
  }, []);

  const activeSection = anchorToSection.get(activeAnchor) ?? "introduction";

  // Scroll-spy: the active heading is the last one to have crossed the
  // reading line. rAF-throttled so scrolling stays smooth.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>("[data-doc-section], [data-doc-subsection]")
      );
      if (headings.length === 0) return;

      const line = 140;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading;
        else break;
      }

      // Near the bottom the last heading wins, even if it never crosses.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      if (atBottom) current = headings[headings.length - 1];

      const id =
        current.dataset.docSection ?? current.dataset.docSubsection ?? "introduction";
      setActiveAnchor((prev) => (prev === id ? prev : id));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lock body scroll while the mobile drawer is open; Escape closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <ScrollProgress />

      {/* Mobile: contents trigger */}
      <div className="lg:hidden sticky top-16 z-30 border-b border-white/10 bg-[#070709]/85 backdrop-blur-xl px-4 py-2.5">
        <button
          onClick={() => setMenuOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-[rgba(232,230,240,0.7)]"
          aria-label="Open documentation navigation"
        >
          <List aria-hidden className="w-4 h-4" />
          Contents
        </button>
      </div>

      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_15rem] lg:gap-10">
        {/* ── Left rail ── */}
        <aside className="hidden lg:block">
          <div className="docs-scroll sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 pr-2">
            <div className="mb-6">
              <DocsSearch />
            </div>
            <DocsSidebar activeSection={activeSection} />
          </div>
        </aside>

        {/* ── Content ── */}
        <main id="docs-content" className="min-w-0 pt-8 lg:pt-14 pb-24">
          {/* Search is surfaced inline on narrow screens */}
          <div className="lg:hidden mb-8">
            <DocsSearch />
          </div>
          {children}
        </main>

        {/* ── Right rail ── */}
        <aside className="hidden xl:block">
          <div className="docs-scroll sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 pl-2">
            <DocsToc activeSection={activeSection} activeAnchor={activeAnchor} />
          </div>
        </aside>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Documentation navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="docs-scroll h-full w-[86%] max-w-xs overflow-y-auto bg-[#0a0a0e] border-r border-white/10 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-[#e8e6f0]">Documentation</p>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation"
                  className="p-1.5 rounded-lg text-[rgba(232,230,240,0.6)] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X aria-hidden className="w-5 h-5" />
                </button>
              </div>
              <DocsSidebar
                activeSection={activeSection}
                onNavigate={() => setMenuOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
