import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { PRINCIPLES } from "./about-data";

export default function Principles() {
  return (
    <section id="principles" className="lp-section relative py-20 sm:py-28 px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/[0.015] border-y border-white/5" />

      <SectionHeading
        tag="Core Principles"
        title="What we refuse to compromise on"
      />
      <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRINCIPLES.map((principle, i) => (
          <Reveal key={principle.title} delay={(i % 3) * 0.08}>
            <div className="glass-card h-full rounded-[20px] p-6 transition-transform duration-300 hover:-translate-y-1">
              <principle.icon aria-hidden className="w-5 h-5 text-[#8cc5ff] mb-4" />
              <h3 className="text-base font-bold text-[#e8e6f0] mb-2">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.45)]">
                {principle.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
