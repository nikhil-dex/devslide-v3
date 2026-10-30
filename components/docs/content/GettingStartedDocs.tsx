import { DocSection, DocSubsection } from "../DocSection";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";
import Pipeline, { type PipelineStages } from "../Pipeline";
import SlidePreview from "../SlidePreview";
import StatusBadge from "../StatusBadge";

export default function GettingStartedDocs({
  pipeline,
}: {
  pipeline: PipelineStages & { previewHtml: string };
}) {
  return (
    <>
      <DocSection id="introduction" title="Introduction" eyebrow="Getting Started">
        <p className="flex flex-wrap items-center gap-3">
          <StatusBadge status="available" />
          <span className="text-sm text-[rgba(232,230,240,0.45)]">
            Everything in this section works today.
          </span>
        </p>
        <p>
          AIRDeck turns a written prompt into a complete, designed
          presentation. You describe what you need; the engine plans the
          slides, applies a theme and produces standalone HTML you can edit,
          share and export.
        </p>

        <DocSubsection id="what-is-airdeck" title="What is AIRDeck?">
          <p>
            AIRDeck is a presentation platform built on web technology rather
            than a slide file format. Every deck it produces is a set of real
            HTML documents — so animations run, layouts respond, and
            interactive elements keep working in any modern browser.
          </p>
          <p>
            That has one practical consequence worth knowing up front:{" "}
            <strong className="text-[#e8e6f0]">you own the output</strong>. A
            generated deck is standard HTML and CSS. You can read it, edit it,
            host it, or throw it into any pipeline that understands the web.
          </p>
        </DocSubsection>

        <DocSubsection id="how-it-works" title="How it works">
          <p>
            Between your prompt and the finished slides there are four steps.
            The middle two are what keep the output reliable:
          </p>
          <ol className="my-4 space-y-3 list-none">
            {[
              ["Prompt", "You describe the presentation in plain language."],
              ["Generation", "The model returns a structured Deck Source document — not raw HTML."],
              ["Validation", "The schema checks every slide, component and prop before anything renders."],
              ["Compilation", "The compiler turns each validated slide into a standalone HTML document."],
            ].map(([step, detail], i) => (
              <li key={step} className="flex gap-4">
                <span className="shrink-0 font-mono text-xs text-[#8cc5ff] pt-0.5">
                  0{i + 1}
                </span>
                <span>
                  <strong className="text-[#e8e6f0]">{step}</strong> — {detail}
                </span>
              </li>
            ))}
          </ol>
          <p>
            Here is one real slide moving through all four. Every stage below
            was produced by the actual engine — step through them:
          </p>

          <Pipeline
            stages={pipeline}
            preview={
              <SlidePreview
                key="pipeline-preview"
                html={pipeline.previewHtml}
                title="Compiled slide preview"
                label="compiled output"
              />
            }
          />

          <Callout variant="note" title="Why the middle steps matter">
            Because the model writes structured data instead of markup, a
            malformed response is caught by the validator rather than shipped
            as a broken slide. Generation either produces a complete deck or
            reports exactly what went wrong.
          </Callout>
        </DocSubsection>
      </DocSection>

      <DocSection id="getting-started" title="Getting Started" eyebrow="Getting Started">
        <p>
          There is nothing to install. AIRDeck runs in the browser, and a deck
          is generated from a single screen.
        </p>

        <DocSubsection id="requirements" title="Requirements">
          <ul className="my-4 space-y-2 list-none">
            {[
              "An AIRDeck account — sign in to generate and save decks.",
              "A modern browser (Chrome, Edge, Safari or Firefox).",
              "Either generation credits, or your own Google Gemini API key.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="text-[#b3ffc8] pt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DocSubsection>

        <DocSubsection id="credits-and-byok" title="Credits & your own key">
          <p>
            Generating a deck with AIRDeck&rsquo;s key costs one credit. If you
            supply your own Gemini API key instead, generation does not consume
            credits — the request is made with your key and billed by your
            provider.
          </p>
          <p>
            When a generation fails validation, the credit is refunded rather
            than spent.
          </p>
          <Callout variant="tip" title="Bring your own key">
            Your key is kept in your browser session and sent with the
            generation request. It is not stored in your AIRDeck profile.
          </Callout>
        </DocSubsection>
      </DocSection>

      <DocSection
        id="first-presentation"
        title="Generate Your First Presentation"
        eyebrow="Getting Started"
      >
        <p>
          The fastest way to understand AIRDeck is to generate something real.
          This walkthrough takes one prompt to a shareable deck.
        </p>

        <DocSubsection id="write-a-prompt" title="Write a prompt">
          <p>
            Open the generator and describe your presentation. Be specific
            about the topic and, if you care about length, say so:
          </p>
          <CodeBlock
            language="text"
            filename="prompt"
            code={`Create a 10-slide investor pitch for an electric aviation
startup: the market opportunity, our aircraft, the roadmap
through certification, the team, and the funding ask.`}
          />
          <p>
            AIRDeck picks the theme and the slide components that fit your
            topic. You can override the theme by naming one — see the{" "}
            <a href="#prompt-guide" className="text-[#8cc5ff] hover:underline">
              Prompt Writing Guide
            </a>
            .
          </p>
        </DocSubsection>

        <DocSubsection id="edit-and-share" title="Edit and share">
          <p>
            When generation finishes you land in the editor with your slides.
            From there you can:
          </p>
          <ul className="my-4 space-y-2 list-none">
            {[
              ["Edit", "Change any slide's HTML and watch the preview update."],
              ["Present", "Run the deck full-screen with keyboard and touch navigation."],
              ["Share", "Publish a public link that keeps animations and interactivity intact."],
              ["Export", "Download standalone HTML, or a .pptx for environments that need it."],
            ].map(([action, detail]) => (
              <li key={action} className="flex gap-3">
                <strong className="shrink-0 w-20 text-[#e8e6f0]">{action}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </DocSubsection>
      </DocSection>
    </>
  );
}
