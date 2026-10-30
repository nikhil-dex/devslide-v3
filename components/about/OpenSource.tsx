import { Github, Palette, Blocks, Lightbulb, Bug, ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { GITHUB_URL } from "@/components/landing/landing-data";

const CONTRIBUTIONS = [
  { icon: Palette, label: "Themes" },
  { icon: Blocks, label: "Components" },
  { icon: Lightbulb, label: "Ideas" },
  { icon: Bug, label: "Bug reports" },
];

// Open philosophy — GitHub as a welcoming front door, not a code dump.
export default function OpenSource() {
  return (
    <section id="open-source" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <Reveal>
        <div className="glass-card mx-auto max-w-4xl rounded-[28px] px-6 py-12 sm:px-14 sm:py-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center mb-6">
            <Github aria-hidden className="w-7 h-7 text-[#e8e6f0]" />
          </div>
          <span className="tag">Open Source</span>
          <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#e8e6f0]">
            Built in the open, better together
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[rgba(232,230,240,0.5)] max-w-2xl mx-auto leading-relaxed">
            AIRDeck grows with its community. Whether you design a theme, build
            a slide component, file a thoughtful bug report or just share an
            idea — every contribution shapes where this goes. First-time
            contributors are genuinely welcome.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3 list-none">
            {CONTRIBUTIONS.map((c) => (
              <li
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[rgba(232,230,240,0.65)]"
              >
                <c.icon aria-hidden className="w-3.5 h-3.5 text-[#b3ffc8]" />
                {c.label}
              </li>
            ))}
          </ul>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-9 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium text-[rgba(232,230,240,0.8)] hover:border-white/30 hover:text-white transition-colors"
          >
            <Github aria-hidden className="w-4 h-4" />
            Visit us on GitHub
            <ArrowRight aria-hidden className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
