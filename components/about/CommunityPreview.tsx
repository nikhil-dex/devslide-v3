import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { COMMUNITY_FUTURE } from "./about-data";

// A glimpse of the ecosystem AIRDeck is growing into — excitement without
// dates or promises. "On the horizon" chips keep it honest.
export default function CommunityPreview() {
  return (
    <section id="community-preview" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Community Preview"
        title="More than a generator"
        sub="None of this exists yet — it's the ecosystem we're building toward: a place where presentations are published, discovered and remixed, together."
      />
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMMUNITY_FUTURE.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.08}>
            <div className="glass-card h-full rounded-[20px] p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5eadff]/15 to-[#ff6ef7]/15 border border-white/10 flex items-center justify-center">
                  <item.icon aria-hidden className="w-[18px] h-[18px] text-[#8cc5ff]" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[rgba(232,230,240,0.35)] border border-white/10 rounded-full px-2 py-0.5">
                  On the horizon
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e8e6f0] mb-2">{item.title}</h3>
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
