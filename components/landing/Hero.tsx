"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import GlitchButton from "./GlitchButton";

const EASE = [0.16, 1, 0.3, 1] as const;

// Mini slide thumbnails inside the product preview window.
const PREVIEW_SLIDES = [
  { title: "The Future of Flight", kind: "hero" },
  { title: "Market Size", kind: "stats" },
  { title: "Roadmap", kind: "timeline" },
  { title: "The Team", kind: "grid" },
] as const;

export default function Hero() {
  const reduce = useReducedMotion();

  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="lp-section relative pt-36 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div {...enter(0)}>
          <span className="tag inline-flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[#b3ffc8]" />
            AI × Presentations as code
          </span>
        </motion.div>

        <motion.h1
          {...enter(0.1)}
          className="mt-7 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#e8e6f0]"
        >
          Ideas in.
          <br />
          <span className="text-gradient">Decks out.</span>
        </motion.h1>

        <motion.p
          {...enter(0.2)}
          className="mt-6 text-lg sm:text-xl text-[rgba(232,230,240,0.5)] max-w-2xl mx-auto"
        >
          AIRDeck turns a single prompt into a fully designed presentation —
          themed, animated and editable like code. From idea to deck in under a
          minute.
        </motion.p>

        <motion.div
          {...enter(0.3)}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <GlitchButton href="/generate" label="Generate Presentation" size="lg" />
          <a
            href="#showcase"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-[rgba(232,230,240,0.75)] hover:border-white/30 hover:text-[#e8e6f0] transition-colors text-sm font-medium"
          >
            Explore the showcase
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>

      {/* ── Product preview ── */}
      <motion.div
        {...enter(0.45)}
        className="relative mx-auto max-w-5xl mt-16 sm:mt-24"
      >
        {/* Soft glow behind the window */}
        <div
          aria-hidden
          className="absolute -inset-8 rounded-[40px] opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(94,173,255,0.14) 0%, rgba(255,110,247,0.07) 45%, transparent 75%)",
          }}
        />

        <div className="glass-card relative overflow-hidden rounded-2xl">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-white/15" />
            <span className="w-3 h-3 rounded-full bg-white/15" />
            <span className="w-3 h-3 rounded-full bg-white/15" />
            <span className="ml-4 text-xs font-mono text-[rgba(232,230,240,0.4)]">
              airdeck — new presentation
            </span>
          </div>

          <div className="grid md:grid-cols-[1.1fr_1.6fr]">
            {/* Prompt panel */}
            <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-white/10 text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.35)] mb-4">
                Describe your presentation
              </p>
              <p className="font-mono text-sm leading-relaxed text-[rgba(232,230,240,0.8)]">
                A 12-slide investor pitch for an electric aviation startup —
                market, product, roadmap, team.
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-[#5eadff] animate-pulse" />
              </p>
              <div className="mt-8 btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm select-none">
                <Sparkles className="w-4 h-4" />
                Generate
              </div>
              <p className="mt-4 text-xs text-[rgba(232,230,240,0.3)]">
                theme: aurora · 12 slides · 41s
              </p>
            </div>

            {/* Generated slides */}
            <div className="p-6 sm:p-8 grid grid-cols-2 gap-4 bg-white/[0.02]">
              {PREVIEW_SLIDES.map((slide, i) => (
                <motion.div
                  key={slide.title}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 + i * 0.12, ease: EASE }}
                  className="aspect-video rounded-lg border border-white/10 p-3.5 flex flex-col justify-between"
                  style={{ background: "linear-gradient(160deg, #0d1024 0%, #0a0c16 70%)" }}
                >
                  <div>
                    <div className="w-8 h-1 rounded-full mb-2 bg-gradient-to-r from-[#5eadff] to-[#ff6ef7]" />
                    <p className="text-[11px] sm:text-xs font-semibold text-[#e8e6f0] leading-tight">
                      {slide.title}
                    </p>
                  </div>

                  {slide.kind === "stats" && (
                    <div className="flex gap-2">
                      {["68%", "$4B", "12x"].map((n) => (
                        <span key={n} className="text-[9px] font-mono text-[#8cc5ff] bg-white/5 rounded px-1.5 py-0.5">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                  {slide.kind === "timeline" && (
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((d) => (
                        <span key={d} className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5eadff]" />
                          {d < 3 && <span className="w-4 sm:w-6 h-px bg-white/15" />}
                        </span>
                      ))}
                    </div>
                  )}
                  {slide.kind === "grid" && (
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="w-5 h-5 rounded-full bg-white/10 border border-white/10" />
                      ))}
                    </div>
                  )}
                  {slide.kind === "hero" && (
                    <div className="space-y-1">
                      <div className="w-3/4 h-1 rounded bg-white/10" />
                      <div className="w-1/2 h-1 rounded bg-white/10" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
