"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Menu, X } from "lucide-react";
import GlitchButton from "./GlitchButton";
import { GITHUB_URL, NAV_LINKS } from "./landing-data";

// Sticky marketing nav: transparent over the hero, blurred glass once
// the page scrolls. Separate from the in-app Navbar on purpose — the
// landing page is public and has no session UI.
export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#070709]/70 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight glitch shrink-0"
          data-text="airDeck"
          onClick={() => setOpen(false)}
        >
          airDeck
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-[rgba(232,230,240,0.6)]">
          {NAV_LINKS.map((link) =>
            link.soon ? (
              <span
                key={link.label}
                className="cursor-default select-none flex items-center gap-1.5"
                title="Coming soon"
              >
                {link.label}
                <span className="text-[9px] uppercase tracking-widest border border-white/15 rounded-full px-1.5 py-0.5 text-[rgba(232,230,240,0.35)]">
                  soon
                </span>
              </span>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#e8e6f0] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-[#e8e6f0] transition-colors"
          >
            <Github className="w-[18px] h-[18px]" />
          </a>
          <GlitchButton href="/generate" label="Get Started" size="md" />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[rgba(232,230,240,0.7)]"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-[#0a0a0e]/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-6 py-5 flex flex-col gap-4 text-[rgba(232,230,240,0.7)]">
              {NAV_LINKS.map((link) =>
                link.soon ? (
                  <span key={link.label} className="flex items-center gap-2">
                    {link.label}
                    <span className="text-[9px] uppercase tracking-widest border border-white/15 rounded-full px-1.5 py-0.5 text-[rgba(232,230,240,0.35)]">
                      soon
                    </span>
                  </span>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="hover:text-[#e8e6f0] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#e8e6f0] transition-colors"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
              <div className="pt-2">
                <GlitchButton href="/generate" label="Get Started" size="md" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
