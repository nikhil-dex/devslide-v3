import { Layers } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { EXAMPLE_DECKS } from "./landing-data";

// Example deck covers — each borrows its palette from a real AIRDeck theme,
// so this section quietly previews the product's range.
export default function ExampleShowcase() {
  return (
    <section id="showcase" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Showcase"
        title="Made with AIRDeck"
        sub="From boardrooms to classrooms — one platform, every kind of story."
      />
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {EXAMPLE_DECKS.map((deck, i) => (
          <Reveal key={deck.category} delay={(i % 3) * 0.08}>
            <div className="glass-card rounded-[20px] p-3 h-full transition-transform duration-300 hover:-translate-y-1">
              {/* Deck cover */}
              <div
                className="aspect-video rounded-xl p-5 flex flex-col justify-between border border-black/10"
                style={{ background: deck.bg }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono uppercase tracking-[0.2em] rounded-full border px-2 py-0.5"
                    style={{ color: deck.accent, borderColor: `${deck.accent}55` }}
                  >
                    {deck.category}
                  </span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: deck.muted, opacity: 0.4 }}
                      />
                    ))}
                  </span>
                </div>
                <div>
                  <div
                    className="w-8 h-[3px] rounded-full mb-2.5"
                    style={{ background: deck.accent }}
                  />
                  <p
                    className="text-sm sm:text-base font-bold leading-snug"
                    style={{ color: deck.text }}
                  >
                    {deck.title}
                  </p>
                </div>
              </div>

              <div className="px-2 pt-3 pb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[rgba(232,230,240,0.45)]">
                  <Layers className="w-3.5 h-3.5" />
                  {deck.slides} slides
                </span>
                <span className="text-[rgba(232,230,240,0.35)]">
                  {deck.theme} theme
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
