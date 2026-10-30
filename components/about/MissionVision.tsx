import Reveal from "@/components/landing/Reveal";
import { Sparkles } from "lucide-react";

const VISION_POINTS = [
  "Interactive presentations",
  "Community publishing",
  "Theme & component marketplace",
  "AI design systems",
  "Open ecosystem",
];

// Mission: one large human statement. Vision: where it leads.
export default function MissionVision() {
  return (
    <section id="mission" className="lp-section relative py-20 sm:py-32 px-4 sm:px-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(94,173,255,0.08) 0%, rgba(255,110,247,0.04) 55%, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="tag">Mission</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-7 text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-[#e8e6f0]">
            Help anyone communicate ideas
            <span className="text-gradient"> beautifully</span> — so the time
            once spent formatting can go into the story instead.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-base sm:text-lg text-[rgba(232,230,240,0.5)] max-w-xl mx-auto">
            Great ideas shouldn&rsquo;t lose to bad slides. If you can
            describe it, you should be able to present it.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-3xl mt-20 text-center">
        <Reveal>
          <span className="tag">Vision</span>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-[rgba(232,230,240,0.6)]">
            We&rsquo;re building toward a world where presentations are living
            documents — published, forked and improved by a community, styled
            by AI design systems, and open to everyone.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3 list-none">
            {VISION_POINTS.map((point) => (
              <li
                key={point}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[rgba(232,230,240,0.65)]"
              >
                <Sparkles aria-hidden className="w-3.5 h-3.5 text-[#8cc5ff]" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
