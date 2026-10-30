"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AboutHero() {
  const reduce = useReducedMotion();

  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="lp-section relative pt-36 sm:pt-44 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      {/* Elegant contained glow — the aurora backdrop does the rest */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[520px] -z-10"
        style={{
          background:
            "radial-gradient(55% 65% at 50% 0%, rgba(94,173,255,0.12) 0%, rgba(255,110,247,0.05) 50%, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <motion.nav {...enter(0)} aria-label="Breadcrumb">
          <ol className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[rgba(232,230,240,0.35)]">
            <li>
              <Link href="/" className="hover:text-[#8cc5ff] transition-colors">
                AIRDeck
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[#8cc5ff]">About</li>
          </ol>
        </motion.nav>

        <motion.h1
          {...enter(0.1)}
          className="mt-7 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#e8e6f0]"
        >
          Presentations
          <br />
          <span className="text-gradient">deserve better.</span>
        </motion.h1>

        <motion.p
          {...enter(0.2)}
          className="mt-7 text-lg sm:text-xl leading-relaxed text-[rgba(232,230,240,0.5)] max-w-2xl mx-auto"
        >
          Too often, making slides means fighting the tool instead of telling
          the story. AIRDeck exists to change that — an AI engine built to
          turn a single idea into a living, interactive presentation, designed
          like the web at its best.
        </motion.p>
      </div>
    </section>
  );
}
