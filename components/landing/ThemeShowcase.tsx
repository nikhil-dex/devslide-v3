import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Serialized on the server in app/page.tsx from the real deck/themes
// registry — the cards can never drift from what the product ships.
export type ThemePreview = {
  id: string;
  name: string;
  mode: string;
  summary: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  fontDisplay: string;
};

function ThemeCard({ theme }: { theme: ThemePreview }) {
  return (
    <div className="glass-card rounded-[20px] p-3 h-full transition-transform duration-300 hover:-translate-y-1">
      {/* Mini slide rendered with the theme's own tokens */}
      <div
        className="aspect-[16/10] rounded-xl overflow-hidden border p-4 flex flex-col justify-between"
        style={{ background: theme.bg, borderColor: theme.border }}
      >
        <div>
          <div
            className="w-7 h-[3px] rounded-full mb-2.5"
            style={{ background: theme.accent }}
          />
          <p
            className="text-base font-bold leading-tight"
            style={{ color: theme.text, fontFamily: theme.fontDisplay }}
          >
            {theme.name}
          </p>
          <p className="text-[10px] mt-1" style={{ color: theme.muted }}>
            The quick brown fox
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div
            className="rounded-md border px-2 py-1.5"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <div className="w-8 h-1 rounded-full mb-1" style={{ background: theme.accent }} />
            <div className="w-12 h-1 rounded-full" style={{ background: theme.muted, opacity: 0.35 }} />
          </div>
          <div className="flex gap-1">
            {[theme.accent, theme.text, theme.muted].map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/10"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-2 pt-3 pb-1.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-[#e8e6f0]">{theme.name}</p>
          <span className="text-[9px] uppercase tracking-widest text-[rgba(232,230,240,0.35)] border border-white/10 rounded-full px-1.5 py-0.5">
            {theme.mode}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[rgba(232,230,240,0.4)] line-clamp-2">
          {theme.summary}
        </p>
      </div>
    </div>
  );
}

export default function ThemeShowcase({ themes }: { themes: ThemePreview[] }) {
  return (
    <section id="themes" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Themes"
        title="Ten design systems. Zero design work."
        sub="Every theme is a complete visual language — the AI matches one to your topic, or you pick your favorite."
      />
      <div className="mx-auto max-w-6xl grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {themes.map((theme, i) => (
          <Reveal key={theme.id} delay={(i % 5) * 0.06}>
            <ThemeCard theme={theme} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
