import { DocSection } from "../DocSection";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";
import Expandable from "../Expandable";
import { DOC_FAQS } from "../docs-data";

export default function ReferenceDocs() {
  return (
    <>
      <DocSection id="faq" title="FAQ" eyebrow="Reference">
        <p>
          Questions that come up most often. If yours is not here, the{" "}
          <a href="/about" className="text-[#8cc5ff] hover:underline">
            about page
          </a>{" "}
          covers where AIRDeck is heading.
        </p>
        <div className="my-5">
          {DOC_FAQS.map((faq, i) => (
            <Expandable key={faq.q} title={faq.q} defaultOpen={i === 0}>
              <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.55)]">
                {faq.a}
              </p>
            </Expandable>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API" eyebrow="Reference" status="soon">
        <Callout variant="soon" title="Not available yet">
          There is no public AIRDeck API today. This section describes the
          shape we are designing toward so you can see where it is going —
          nothing below is callable, and the details will change.
        </Callout>
        <p>
          The goal is a small, boring HTTP surface: send a prompt, get back a
          Deck Source document and compiled slides — the same pipeline the web
          app uses, without the browser.
        </p>
        <CodeBlock
          language="bash"
          filename="design sketch — not live"
          code={`# Planned shape. This endpoint does not exist yet.
curl https://api.airdeck.app/v1/decks \\
  -H "Authorization: Bearer $AIRDECK_KEY" \\
  -d '{ "prompt": "A 10-slide overview of our Q4 roadmap" }'`}
        />
        <p>
          The response we are aiming for mirrors the compiler contract exactly,
          so anything you build against it stays valid as the engine evolves:
        </p>
        <CodeBlock
          filename="design sketch — not live"
          code={`{
  "valid": true,
  "errors": [],
  "source": { "version": 1, "theme": "linear", "slides": [] },
  "slides": ["<!DOCTYPE html>…"]
}`}
        />
        <p>
          Until then, the generator in the web app is the supported way to
          create decks.
        </p>
      </DocSection>

      <DocSection id="cli" title="CLI" eyebrow="Reference" status="soon">
        <Callout variant="soon" title="Not available yet">
          The CLI is a planned companion to the API above. It is not published
          to any package registry, and the commands below are a design sketch
          rather than documentation of shipped behavior.
        </Callout>
        <p>
          The intent is to make decks a build artifact: generate from a prompt
          or a checked-in Deck Source file, and render to HTML in CI the same
          way you would compile any other asset.
        </p>
        <CodeBlock
          language="bash"
          filename="design sketch — not live"
          code={`# Planned commands. Not published yet.
airdeck generate "Q4 roadmap in 10 slides" --theme linear
airdeck build deck.json --out ./dist
airdeck themes list`}
        />
        <p>
          Because Deck Source is plain JSON, a deck could live in your
          repository, be reviewed in a pull request, and be rebuilt whenever
          the content changes.
        </p>
        <Callout variant="tip" title="Want to shape this?">
          Both the API and the CLI are still open designs. Ideas and use cases
          filed on GitHub genuinely influence what gets built first.
        </Callout>
      </DocSection>
    </>
  );
}
