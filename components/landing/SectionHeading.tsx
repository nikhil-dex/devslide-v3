import Reveal from "./Reveal";

// Consistent section opener: eyebrow tag + headline + optional supporting line.
export default function SectionHeading({
  tag,
  title,
  sub,
}: {
  tag: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 px-4">
      <Reveal>
        <span className="tag">{tag}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#e8e6f0]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-base sm:text-lg text-[rgba(232,230,240,0.45)]">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
