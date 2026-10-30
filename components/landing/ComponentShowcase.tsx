import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { SLIDE_COMPONENTS, type SlideKind } from "./landing-data";

// Pure-CSS miniatures of the slide component library. Deliberately tiny and
// schematic — they suggest each layout without pretending to be screenshots.
function MiniSlide({ kind }: { kind: SlideKind }) {
  const base =
    "aspect-video rounded-xl border border-white/10 p-4 flex flex-col overflow-hidden";
  const canvas = { background: "linear-gradient(160deg, #0d1024 0%, #0a0c16 70%)" };

  switch (kind) {
    case "hero":
      return (
        <div className={`${base} items-center justify-center text-center`} style={canvas}>
          <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#b3ffc8] via-[#5eadff] to-[#ff6ef7] mb-3" />
          <p className="text-lg sm:text-2xl font-extrabold text-gradient leading-tight">
            The Future of Flight
          </p>
          <p className="text-[10px] text-[rgba(232,230,240,0.4)] mt-2">
            Electric aviation, from prototype to fleet
          </p>
        </div>
      );

    case "dashboard":
      return (
        <div className={base} style={canvas}>
          <p className="text-[10px] font-semibold text-[#e8e6f0] mb-2">Key Metrics</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              ["Revenue", "$2.4M"],
              ["Users", "48K"],
              ["Growth", "+32%"],
              ["Retention", "91%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1.5">
                <p className="text-[8px] text-[rgba(232,230,240,0.4)]">{label}</p>
                <p className="text-xs font-bold text-[#8cc5ff]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className={base} style={canvas}>
          <p className="text-[10px] font-semibold text-[#e8e6f0] mb-3">Roadmap</p>
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            {["2024", "2025", "2026"].map((year, i) => (
              <div key={year} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5eadff] shrink-0" />
                <span className="text-[8px] font-mono text-[#8cc5ff]">{year}</span>
                <span
                  className="h-1 rounded-full bg-white/10"
                  style={{ width: `${55 - i * 12}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "code":
      return (
        <div className={base} style={canvas}>
          <div className="flex gap-1 mb-2">
            {[0, 1, 2].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/15" />
            ))}
          </div>
          <div className="font-mono text-[8px] leading-relaxed">
            <p><span className="text-[#ff6ef7]">const</span> <span className="text-[#e8e6f0]">deck</span> = <span className="text-[#b3ffc8]">await</span> <span className="text-[#8cc5ff]">generate</span>(prompt)</p>
            <p><span className="text-[#ff6ef7]">if</span> (deck.<span className="text-[#8cc5ff]">valid</span>) &#123;</p>
            <p className="pl-3"><span className="text-[#8cc5ff]">present</span>(deck.<span className="text-[#e8e6f0]">slides</span>)</p>
            <p>&#125;</p>
          </div>
        </div>
      );

    case "comparison":
      return (
        <div className={base} style={canvas}>
          <p className="text-[10px] font-semibold text-[#e8e6f0] mb-2">Before vs After</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              { title: "Manual", color: "rgba(232,230,240,0.35)" },
              { title: "AIRDeck", color: "#b3ffc8" },
            ].map((side) => (
              <div key={side.title} className="rounded-lg bg-white/[0.04] border border-white/10 p-2">
                <p className="text-[8px] font-bold mb-1.5" style={{ color: side.color }}>
                  {side.title}
                </p>
                {[0, 1, 2].map((r) => (
                  <div key={r} className="w-full h-1 rounded-full bg-white/10 mb-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className={base} style={canvas}>
          <div className="grid grid-cols-3 gap-1.5 flex-1 items-stretch">
            {["Free", "Pro", "Team"].map((tier, i) => (
              <div
                key={tier}
                className={`rounded-lg border p-1.5 flex flex-col items-center justify-center ${
                  i === 1
                    ? "border-[#5eadff]/60 bg-[#5eadff]/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className={`text-[8px] font-bold ${i === 1 ? "text-[#8cc5ff]" : "text-[rgba(232,230,240,0.6)]"}`}>
                  {tier}
                </p>
                <p className="text-[10px] font-extrabold text-[#e8e6f0]">
                  {["$0", "$12", "$49"][i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "stats":
      return (
        <div className={`${base} justify-center`} style={canvas}>
          <div className="flex items-end justify-around">
            {[
              ["120+", "decks/day"],
              ["41s", "avg. generate"],
              ["10", "themes"],
            ].map(([n, label]) => (
              <div key={label} className="text-center">
                <p className="text-base sm:text-xl font-extrabold text-gradient">{n}</p>
                <p className="text-[7px] uppercase tracking-widest text-[rgba(232,230,240,0.35)] mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export default function ComponentShowcase() {
  return (
    <section id="components" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Slide Components"
        title="A layout for every kind of slide"
        sub="The AI composes your deck from purpose-built components — each one designed, spaced and typeset by hand."
      />
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SLIDE_COMPONENTS.map((component, i) => (
          <Reveal
            key={component.kind}
            delay={(i % 3) * 0.08}
            className={component.wide ? "sm:col-span-2 lg:col-span-1" : undefined}
          >
            <div className="glass-card rounded-[20px] p-4 h-full transition-transform duration-300 hover:-translate-y-1">
              <MiniSlide kind={component.kind} />
              <div className="px-1.5 pt-3.5 pb-1 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-[#e8e6f0]">{component.name}</p>
                <p className="text-xs text-[rgba(232,230,240,0.4)] text-right">
                  {component.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
