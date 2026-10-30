import { PenLine, BrainCircuit, Presentation } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { HOW_STEPS } from "./landing-data";

const ICONS = [PenLine, BrainCircuit, Presentation];

// Prompt → AI → Presentation as a vertical timeline with a gradient spine.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-section py-20 sm:py-28 px-4 sm:px-6">
      <SectionHeading
        tag="How it works"
        title="One prompt. Three moments."
        sub="No outlines, no templates, no drag-and-drop. Describe it, and it exists."
      />

      <div className="relative mx-auto max-w-2xl">
        {/* Spine */}
        <div
          aria-hidden
          className="absolute left-[27px] sm:left-1/2 sm:-translate-x-px top-4 bottom-4 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent, #b3ffc8 15%, #5eadff 50%, #ff6ef7 85%, transparent)",
            opacity: 0.5,
          }}
        />

        <div className="space-y-12 sm:space-y-16">
          {HOW_STEPS.map((step, i) => {
            const Icon = ICONS[i];
            const flip = i % 2 === 1;
            return (
              <Reveal key={step.step} delay={0.1}>
                <div
                  className={`relative flex items-start gap-6 sm:gap-0 ${
                    flip ? "sm:flex-row-reverse" : "sm:flex-row"
                  }`}
                >
                  {/* Node */}
                  <div className="relative z-10 shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                    <div className="w-14 h-14 rounded-2xl bg-[#0c0c12] border border-white/15 flex items-center justify-center shadow-[0_0_24px_rgba(94,173,255,0.15)]">
                      <Icon className="w-6 h-6 text-[#8cc5ff]" />
                    </div>
                  </div>

                  {/* Copy */}
                  <div
                    className={`sm:w-1/2 ${
                      flip ? "sm:pr-0 sm:pl-14 sm:text-left" : "sm:pr-14 sm:text-right"
                    }`}
                  >
                    <p className="font-mono text-xs tracking-[0.25em] text-[rgba(232,230,240,0.35)] mb-1.5">
                      {step.step}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
