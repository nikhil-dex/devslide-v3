import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { COMPARISONS } from "./about-data";

// Philosophies, not feature checklists: the old way fades on the left,
// the AIRDeck way answers in accent on the right.
export default function Different() {
  return (
    <section id="different" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="What Makes AIRDeck Different"
        title="Two ways of thinking about slides"
        sub="The difference isn't a feature — it's the starting point."
      />

      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="glass-card rounded-[24px] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 py-4 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.25em]">
              <span className="text-[rgba(232,230,240,0.35)]">Traditional software</span>
              <span aria-hidden className="px-4" />
              <span className="text-[#8cc5ff] text-right sm:text-left">AIRDeck</span>
            </div>
            <ul className="divide-y divide-white/5 list-none">
              {COMPARISONS.map((row, i) => (
                <Reveal key={row.before} delay={i * 0.07}>
                  <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 sm:px-10 py-5">
                    <span className="text-sm sm:text-base text-[rgba(232,230,240,0.4)] line-through decoration-[rgba(232,230,240,0.2)]">
                      {row.before}
                    </span>
                    <ArrowRight aria-hidden className="w-4 h-4 text-[#ff6ef7]/70 mx-2 sm:mx-6 shrink-0" />
                    <span className="text-sm sm:text-base font-semibold text-[#e8e6f0] text-right sm:text-left">
                      {row.after}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
