import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import GlitchButton from "./GlitchButton";
import { GITHUB_URL } from "./landing-data";

export default function FinalCTA() {
  return (
    <section id="community" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/10 px-6 py-16 sm:px-16 sm:py-24 text-center">
          {/* Contained aurora wash — the section's only background effect */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(80% 90% at 50% 0%, rgba(94,173,255,0.16) 0%, rgba(255,110,247,0.08) 45%, rgba(7,7,9,0) 80%), #0a0a0e",
            }}
          />

          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[rgba(232,230,240,0.35)] mb-5">
            Free to start · Bring your own key
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#e8e6f0] leading-[1.05]">
            Your next deck is
            <br />
            <span className="text-gradient">one prompt away.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[rgba(232,230,240,0.5)] max-w-xl mx-auto">
            Join the builders, founders and educators turning ideas into
            presentations with AIRDeck.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <GlitchButton href={GITHUB_URL} label="Join Community" size="lg" external />
            <a
              href="/generate"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#8cc5ff] hover:text-[#b3d9ff] transition-colors"
            >
              Generate your first deck
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
