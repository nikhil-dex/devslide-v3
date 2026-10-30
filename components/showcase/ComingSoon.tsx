import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { COMING_SOON } from "./showcase-data";

// The publish-platform future, clearly labeled — nothing here is live yet.
export default function ComingSoon() {
  return (
    <section id="coming-soon" className="lp-section relative py-20 sm:py-28 px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/[0.015] border-y border-white/5" />

      <SectionHeading
        tag="Coming Soon"
        title="This page is becoming a platform"
        sub="Today it's a curated gallery. We're building toward a community showcase — none of this is live yet."
      />
      <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COMING_SOON.map((item, i) => (
          <Reveal key={item.title} delay={(i % 4) * 0.06}>
            <div className="glass-card h-full rounded-[18px] p-5 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <item.icon aria-hidden className="w-5 h-5 text-[#8cc5ff]" />
                <span className="text-[8px] uppercase tracking-widest text-[rgba(232,230,240,0.35)] border border-white/10 rounded-full px-1.5 py-0.5">
                  Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#e8e6f0] mb-1.5">{item.title}</h3>
              <p className="text-xs leading-relaxed text-[rgba(232,230,240,0.45)]">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
