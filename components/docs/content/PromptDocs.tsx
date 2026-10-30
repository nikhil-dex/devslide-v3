import { DocSection, DocSubsection } from "../DocSection";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";
import Expandable from "../Expandable";

const INGREDIENTS = [
  ["Topic", "What the deck is about — the more concrete, the better.", "the rollout of our new returns policy"],
  ["Audience", "Who is in the room. This shapes tone and depth.", "for regional store managers"],
  ["Length", "A slide count, if you have one in mind.", "in 8 slides"],
  ["Structure", "The beats you want covered, in order.", "problem, new policy, timeline, FAQ"],
  ["Style", "Optional. A named theme or a mood.", "use the notion theme"],
];

const PRACTICES = [
  {
    title: "Name the sections you care about",
    body: "If the deck must cover four specific beats, list them. The model follows an explicit outline more faithfully than it infers one.",
  },
  {
    title: "Ask for the component, not the look",
    body: "Say “compare the two plans side by side” or “show these five metrics” rather than describing boxes and colors. Components carry the design already.",
  },
  {
    title: "Give real numbers and names",
    body: "Concrete figures land in the slides. Vague prompts produce placeholder-flavored copy you will end up rewriting.",
  },
  {
    title: "Set the slide count deliberately",
    body: "Without a count the model chooses one based on the topic. If you have a time slot, say so — a 5-minute talk and a 30-minute workshop are different decks.",
  },
  {
    title: "Generate first, refine second",
    body: "Treat the first output as a strong draft. Editing one slide in the editor is usually faster than re-prompting the whole deck.",
  },
  {
    title: "Keep one idea per slide",
    body: "If a slide description contains “and” three times, it is probably two slides. Say that explicitly and the structure improves.",
  },
];

const EXAMPLES = [
  {
    label: "Startup pitch",
    hint: "12 slides",
    prompt: `Create a 12-slide seed-round pitch for a B2B logistics startup.
Cover: the problem with regional freight matching, our marketplace
product, traction so far (18 customers, $40K MRR), the competitive
landscape, our team, and a $2M ask. Use the linear theme.`,
    note: "Names the count, the beats, real numbers and a theme — the four things that most improve output.",
  },
  {
    label: "Technical talk",
    hint: "code-heavy",
    prompt: `Create a conference talk deck explaining Rust's ownership model
to experienced JavaScript developers. Include code examples for
move semantics, borrowing and lifetimes, a comparison of garbage
collection vs ownership, and a summary of when each wins.
Use the github-dark theme.`,
    note: "Naming the audience changes the depth; asking for code examples pulls in the Code component.",
  },
  {
    label: "Quarterly review",
    hint: "metrics-led",
    prompt: `Create an 8-slide Q3 business review for the leadership team.
Open with a summary of the quarter, then key metrics (revenue $4.2M,
churn 3.1%, NPS 46), what drove the numbers, two risks, and the
priorities for Q4. Keep it factual rather than promotional.`,
    note: "Metric-heavy prompts steer toward Dashboard and Table slides; the tone instruction keeps the copy sober.",
  },
];

export default function PromptDocs() {
  return (
    <>
      <DocSection
        id="prompt-guide"
        title="Prompt Writing Guide"
        eyebrow="Writing Prompts"
      >
        <p>
          A prompt is the only input AIRDeck needs, which makes it the highest
          leverage thing to get right. A good one reads like a brief you would
          hand a colleague.
        </p>

        <DocSubsection id="prompt-anatomy" title="Anatomy of a good prompt">
          <p>
            Five ingredients cover almost every case. Only the first is
            required — each additional one narrows the output toward what you
            actually want:
          </p>
          <div className="my-5 space-y-2.5">
            {INGREDIENTS.map(([name, purpose, example]) => (
              <div
                key={name}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-[#e8e6f0]">{name}</span>
                  <span className="text-xs text-[rgba(232,230,240,0.45)]">{purpose}</span>
                </div>
                <code className="mt-1.5 block font-mono text-xs text-[#b3ffc8]/80">
                  “{example}”
                </code>
              </div>
            ))}
          </div>
          <p>Put together, that reads as one natural sentence:</p>
          <CodeBlock
            language="text"
            filename="prompt"
            code={`Create an 8-slide deck on the rollout of our new returns policy
for regional store managers, covering the problem, the new policy,
the timeline and an FAQ. Use the notion theme.`}
          />
        </DocSubsection>

        <DocSubsection id="steering-output" title="Steering the output">
          <p>
            Two levers give you direct control over what the engine produces:
          </p>
          <ul className="my-4 space-y-3 list-none">
            <li className="flex gap-3">
              <strong className="shrink-0 text-[#e8e6f0]">Theme</strong>
              <span>
                Name any theme ID from the{" "}
                <a href="#theme-catalog" className="text-[#8cc5ff] hover:underline">
                  catalog
                </a>{" "}
                to pin it. Otherwise the model chooses based on your topic.
              </span>
            </li>
            <li className="flex gap-3">
              <strong className="shrink-0 text-[#e8e6f0]">Shape</strong>
              <span>
                Describe the shape of the information — a timeline, a
                comparison, a set of metrics, a step-by-step process — and the
                matching component gets used.
              </span>
            </li>
          </ul>
          <Callout variant="note" title="What you cannot set from a prompt yet">
            Custom fonts, brand color palettes and per-slide theme overrides
            are not prompt-controllable. Since the export is standard CSS, you
            can adjust those by hand afterwards.
          </Callout>
        </DocSubsection>
      </DocSection>

      <DocSection id="best-practices" title="Best Practices" eyebrow="Writing Prompts">
        <p>
          Six habits that reliably produce better decks, drawn from what tends
          to go wrong without them.
        </p>
        <div className="my-5 grid sm:grid-cols-2 gap-4">
          {PRACTICES.map((practice, i) => (
            <div
              key={practice.title}
              className="glass-card docs-grad-card rounded-xl p-5"
            >
              <span className="font-mono text-[10px] text-[#8cc5ff]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-2 text-sm font-bold text-[#e8e6f0] mb-1.5">
                {practice.title}
              </h4>
              <p className="text-xs leading-relaxed text-[rgba(232,230,240,0.45)]">
                {practice.body}
              </p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="examples" title="Examples" eyebrow="Writing Prompts">
        <p>
          Three prompts you can adapt. Expand any of them to see the full text
          and why it works.
        </p>
        <div className="my-5">
          {EXAMPLES.map((example, i) => (
            <Expandable
              key={example.label}
              title={example.label}
              hint={example.hint}
              defaultOpen={i === 0}
            >
              <CodeBlock language="text" filename="prompt" code={example.prompt} />
              <p className="text-xs leading-relaxed text-[rgba(232,230,240,0.45)]">
                <strong className="text-[rgba(232,230,240,0.7)]">Why it works: </strong>
                {example.note}
              </p>
            </Expandable>
          ))}
        </div>
        <p>
          Want to see finished decks instead of prompts? The{" "}
          <a href="/showcase" className="text-[#8cc5ff] hover:underline">
            showcase
          </a>{" "}
          runs real AIRDeck exports live, each with the prompt that produced it.
        </p>
      </DocSection>
    </>
  );
}
