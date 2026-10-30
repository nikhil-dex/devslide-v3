import Reveal from "./Reveal";
import { TRUSTED_BY } from "./landing-data";

// Placeholder logo cloud — wordmarks in a slow marquee until real logos land.
export default function TrustedBy() {
  const row = [...TRUSTED_BY, ...TRUSTED_BY]; // doubled for a seamless loop

  return (
    <section className="lp-section py-14 sm:py-20 px-4">
      <Reveal>
        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-[rgba(232,230,240,0.3)] mb-8">
          Trusted by teams shipping their story
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="lp-marquee mx-auto max-w-5xl" aria-hidden="true">
          <div className="lp-marquee-track py-2">
            {row.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="font-mono text-sm sm:text-base uppercase tracking-[0.18em] text-[rgba(232,230,240,0.28)] hover:text-[rgba(232,230,240,0.6)] transition-colors whitespace-nowrap select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
