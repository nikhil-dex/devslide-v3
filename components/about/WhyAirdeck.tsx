import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { PHILOSOPHY } from "./about-data";

export default function WhyAirdeck() {
  return (
    <section id="why" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Why AIRDeck"
        title="A philosophy, not a feature list"
        sub="AIRDeck is shaped by a few convictions about how presentations should work."
      />
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PHILOSOPHY.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.08}>
            <div className="glass-card lp-glow-card h-full p-7 rounded-[20px]">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5eadff]/20 to-[#ff6ef7]/20 border border-white/10 flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5 text-[#8cc5ff]" />
              </div>
              <h3 className="text-lg font-bold text-[#e8e6f0] mb-2.5">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.45)]">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
