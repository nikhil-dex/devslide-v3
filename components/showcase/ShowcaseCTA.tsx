import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import GlitchButton from "@/components/landing/GlitchButton";

// The page's single retro-glitch CTA, per the brand rule.
export default function ShowcaseCTA() {
  return (
    <section id="cta" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/10 px-6 py-16 sm:px-16 sm:py-20 text-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(80% 90% at 50% 0%, rgba(94,173,255,0.16) 0%, rgba(255,110,247,0.08) 45%, rgba(7,7,9,0) 80%), #0a0a0e",
            }}
          />
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#e8e6f0] leading-[1.05]">
            Ready to build
            <span className="text-gradient"> your own?</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[rgba(232,230,240,0.5)] max-w-lg mx-auto">
            Everything on this page started as one sentence. Yours is next.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-5">
            <GlitchButton href="/generate" label="Generate Presentation" size="lg" />
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-sm font-medium text-[rgba(232,230,240,0.75)] hover:border-white/30 hover:text-[#e8e6f0] transition-colors"
            >
              Explore AIRDeck
              <ArrowRight aria-hidden className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
