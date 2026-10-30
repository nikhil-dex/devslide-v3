import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { JOURNEY } from "./about-data";

// Vertical story timeline — same spine pattern as the landing page's
// "How it works", extended to five narrative chapters.
export default function Journey() {
  return (
    <section id="journey" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="Our Journey"
        title="From a blank slide to a living deck"
        sub="AIRDeck wasn't planned in a boardroom. It grew out of one frustration, one question, and a lot of building."
      />

      <div className="relative mx-auto max-w-2xl">
        <div
          aria-hidden
          className="absolute left-[27px] sm:left-1/2 sm:-translate-x-px top-4 bottom-4 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent, #b3ffc8 12%, #5eadff 50%, #ff6ef7 88%, transparent)",
            opacity: 0.5,
          }}
        />

        <ol className="space-y-12 sm:space-y-16 list-none">
          {JOURNEY.map((step, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={step.label}>
                <Reveal delay={0.08}>
                  <div
                    className={`relative flex items-start gap-6 sm:gap-0 ${
                      flip ? "sm:flex-row-reverse" : "sm:flex-row"
                    }`}
                  >
                    <div className="relative z-10 shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                      <div className="w-14 h-14 rounded-2xl bg-[#0c0c12] border border-white/15 flex items-center justify-center shadow-[0_0_24px_rgba(94,173,255,0.15)]">
                        <step.icon className="w-6 h-6 text-[#8cc5ff]" />
                      </div>
                    </div>

                    <div
                      className={`sm:w-1/2 ${
                        flip ? "sm:pl-14 sm:text-left" : "sm:pr-14 sm:text-right"
                      }`}
                    >
                      <p className="font-mono text-xs tracking-[0.25em] uppercase text-[#8cc5ff] mb-1.5">
                        {step.label}
                      </p>
                      <h3 className="text-2xl font-extrabold text-[#e8e6f0] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.45)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
