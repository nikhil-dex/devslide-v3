import { X } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { PAIN_POINTS } from "./about-data";

// The status quo, laid out plainly. Slightly sunken backdrop separates this
// "before" chapter from the brighter sections around it.
export default function ProblemSection() {
  return (
    <section id="problem" className="lp-section relative py-20 sm:py-28 px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/[0.015] border-y border-white/5" />

      <SectionHeading
        tag="The Problem"
        title="The tools were the bottleneck"
        sub="Slides became busywork. Here's what so many presenters quietly put up with."
      />

      <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PAIN_POINTS.map((pain, i) => (
          <Reveal key={pain.title} delay={(i % 3) * 0.08}>
            <div className="glass-card h-full rounded-[20px] p-6">
              <div className="w-9 h-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center mb-4">
                <X className="w-4 h-4 text-red-400/80" />
              </div>
              <h3 className="text-base font-bold text-[#e8e6f0] mb-2">{pain.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.45)]">
                {pain.description}
              </p>
            </div>
          </Reveal>
        ))}

        {/* The turn: last cell pivots the story */}
        <Reveal delay={0.24}>
          <div className="glass-card h-full rounded-[20px] p-6 border-[#b3ffc8]/20 bg-[#b3ffc8]/[0.03]">
            <div className="w-9 h-9 rounded-lg bg-[#b3ffc8]/10 border border-[#b3ffc8]/25 flex items-center justify-center mb-4">
              <span className="text-[#b3ffc8] text-sm font-bold">→</span>
            </div>
            <h3 className="text-base font-bold text-[#e8e6f0] mb-2">There&rsquo;s a better way</h3>
            <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.45)]">
              This isn&rsquo;t storytelling — it&rsquo;s overhead. Most of it
              can be automated, and that&rsquo;s exactly where AIRDeck begins.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
