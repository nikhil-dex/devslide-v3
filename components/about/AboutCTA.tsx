import { Github } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import GlitchButton from "@/components/landing/GlitchButton";
import { GITHUB_URL } from "@/components/landing/landing-data";

// The page's single retro-glitch CTA lives here, per the brand rule:
// one glitch accent, at the moment of decision.
export default function AboutCTA() {
  return (
    <section id="cta" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/10 px-6 py-16 sm:px-16 sm:py-24 text-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(80% 90% at 50% 0%, rgba(94,173,255,0.16) 0%, rgba(255,110,247,0.08) 45%, rgba(7,7,9,0) 80%), #0a0a0e",
            }}
          />

          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[rgba(232,230,240,0.35)] mb-5">
            One prompt is all it takes
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#e8e6f0] leading-[1.05]">
            The future of presentations
            <br />
            <span className="text-gradient">starts here.</span>
          </h2>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <GlitchButton href="/" label="Explore AIRDeck" size="lg" />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-sm font-medium text-[rgba(232,230,240,0.75)] hover:border-white/30 hover:text-[#e8e6f0] transition-colors"
            >
              <Github aria-hidden className="w-4 h-4" />
              View GitHub
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
