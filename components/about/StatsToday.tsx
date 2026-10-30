"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { STATS, type Stat } from "./about-data";

// Count-up number: animates once when scrolled into view; jumps straight to
// the final value under prefers-reduced-motion.
function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = stat.value.toLocaleString();
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [inView, stat.value]);

  return (
    <span>
      <span ref={ref}>0</span>
      {stat.suffix}
    </span>
  );
}

export default function StatsToday() {
  return (
    <section id="today" className="lp-section relative py-20 sm:py-28 px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/[0.015] border-y border-white/5" />

      <SectionHeading
        tag="AIRDeck Today"
        title="The product, in real numbers"
      />
      <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={(i % 6) * 0.05}>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient tabular-nums">
                <Counter stat={stat} />
              </p>
              <p className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.25)]">
        Every figure above is true of the engine today — no vanity metrics
      </p>
    </section>
  );
}
