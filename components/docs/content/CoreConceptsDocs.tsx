import { Check, X } from "lucide-react";
import { DocSection, DocSubsection } from "../DocSection";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";
import Expandable from "../Expandable";
import SlidePreview from "../SlidePreview";
import StatusBadge from "../StatusBadge";
import PlaygroundLoader from "../playground/PlaygroundLoader";
import { SCHEMA_LIMITS } from "../docs-data";
import type { ThemeDoc, ComponentDoc } from "../registry";

const DECK_VARS = [
  ["--deck-bg", "Slide canvas background"],
  ["--deck-text", "Primary text color"],
  ["--deck-muted", "Secondary text color"],
  ["--deck-accent", "Brand accent"],
  ["--deck-card-bg", "Card fill"],
  ["--deck-card-border", "Card border color"],
  ["--deck-font-display", "Headline typeface"],
  ["--deck-font-body", "Body typeface"],
];

function Chips({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad" | "neutral";
}) {
  const styles = {
    good: "border-[#b3ffc8]/20 bg-[#b3ffc8]/[0.05] text-[#b3ffc8]/90",
    bad: "border-[#f2c55c]/20 bg-[#f2c55c]/[0.05] text-[#f2c55c]/90",
    neutral: "border-white/10 bg-white/[0.03] text-[rgba(232,230,240,0.5)]",
  }[tone];

  return (
    <ul className="flex flex-wrap gap-1.5 list-none">
      {items.map((item) => (
        <li key={item} className={`rounded-full border px-2 py-0.5 text-[11px] ${styles}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ThemeCard({ theme }: { theme: ThemeDoc }) {
  return (
    <article className="glass-card docs-spotlight rounded-2xl p-3 sm:p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <SlidePreview
          html={theme.previewHtml}
          title={`${theme.name} theme preview`}
          label="live"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="text-base font-bold text-[#e8e6f0]">{theme.name}</h4>
            <code className="font-mono text-xs text-[#8cc5ff]">{theme.id}</code>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[rgba(232,230,240,0.4)]">
              {theme.mode}
            </span>
            <span className="font-mono text-[10px] text-[rgba(232,230,240,0.3)]">
              v{theme.version}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.55)] mb-4">
            {theme.ai.summary}
          </p>

          <div className="space-y-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                <Check aria-hidden className="w-3 h-3 text-[#b3ffc8]" /> Best for
              </p>
              <Chips items={theme.ai.bestFor} tone="good" />
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                <X aria-hidden className="w-3 h-3 text-[#f2c55c]" /> Avoid for
              </p>
              <Chips items={theme.ai.avoidFor} tone="bad" />
            </div>
          </div>

          <Expandable title="Metadata" hint={`${theme.ai.keywords.length} keywords`}>
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                  Palette
                </p>
                <ul className="flex flex-wrap gap-3 list-none">
                  {theme.swatches.map((swatch) => (
                    <li key={swatch.label} className="flex items-center gap-2">
                      <span
                        className="inline-block h-5 w-5 rounded-md border border-white/15"
                        style={{ background: swatch.value }}
                      />
                      <span className="font-mono text-[10px] text-[rgba(232,230,240,0.45)]">
                        {swatch.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                  Keywords
                </p>
                <Chips items={theme.ai.keywords} tone="neutral" />
              </div>
              {theme.ai.style && (
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                    Style
                  </p>
                  <Chips items={theme.ai.style} tone="neutral" />
                </div>
              )}
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                  Typefaces
                </p>
                <p className="font-mono text-[11px] leading-relaxed text-[rgba(232,230,240,0.45)] break-words">
                  display: {theme.fonts.display}
                  <br />
                  body: {theme.fonts.body}
                </p>
              </div>
            </div>
          </Expandable>
        </div>
      </div>
    </article>
  );
}

function ComponentEntry({ component }: { component: ComponentDoc }) {
  const required = component.props.filter((p) => p.required);
  const optional = component.props.filter((p) => !p.required);

  return (
    <Expandable
      title={component.name}
      hint={`${required.length} required · ${optional.length} optional`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div>
          <SlidePreview
            html={component.previewHtml}
            title={`${component.name} component preview`}
            label="live"
          />
          <p className="mt-2 text-[11px] text-[rgba(232,230,240,0.35)]">
            Rendered from the example below, in the Linear theme.
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(232,230,240,0.55)]">
            {component.ai.summary}
          </p>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
              Props
            </p>
            <ul className="space-y-2 list-none">
              {component.props.map((prop) => (
                <li key={prop.name} className="border-b border-white/5 pb-2 last:border-0">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <code className="font-mono text-xs text-[#8cc5ff]">{prop.name}</code>
                    <code className="font-mono text-[11px] text-[rgba(232,230,240,0.4)]">
                      {prop.type}
                    </code>
                    <span
                      className={`text-[9px] uppercase tracking-widest ${
                        prop.required ? "text-[#ff9ef9]" : "text-[rgba(232,230,240,0.3)]"
                      }`}
                    >
                      {prop.required ? "required" : "optional"}
                    </span>
                  </div>
                  {prop.description && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[rgba(232,230,240,0.4)]">
                      {prop.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                <Check aria-hidden className="w-3 h-3 text-[#b3ffc8]" /> Best for
              </p>
              <Chips items={component.ai.bestFor} tone="good" />
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
                <X aria-hidden className="w-3 h-3 text-[#f2c55c]" /> Avoid for
              </p>
              <Chips items={component.ai.avoidFor} tone="bad" />
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)]">
              Keywords
            </p>
            <Chips items={component.ai.keywords} tone="neutral" />
          </div>
        </div>
      </div>

      <div className="[&>figure]:mb-0">
        <CodeBlock
          code={component.exampleJson}
          language="json"
          filename={`${component.name} — example slide`}
          caption="Paste this into the Playground below to edit it live."
        />
      </div>
    </Expandable>
  );
}

export default function CoreConceptsDocs({
  themes,
  components,
}: {
  themes: ThemeDoc[];
  components: ComponentDoc[];
}) {
  return (
    <>
      <DocSection id="themes" title="Themes" eyebrow="Core Concepts">
        <p className="flex flex-wrap items-center gap-3">
          <StatusBadge status="available" />
          <span className="text-sm text-[rgba(232,230,240,0.45)]">
            {themes.length} themes ship with AIRDeck today.
          </span>
        </p>
        <p>
          A theme is a complete design system — color, typography, spacing,
          radius, shadow and motion — not a color swap. The model picks the one
          that best fits your topic unless you name one yourself.
        </p>

        <DocSubsection id="theme-catalog" title="Theme catalog">
          <p>
            Every card below renders the same slide through a different theme,
            compiled by the real engine. The guidance beside it is the same
            metadata the model reads when it chooses a theme for your deck.
          </p>
          <div className="my-6 space-y-4">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
          <Callout variant="tip" title="Pinning a theme">
            Name the theme in your prompt — &ldquo;use the{" "}
            <code className="font-mono text-[#8cc5ff]">github-dark</code>{" "}
            theme&rdquo; — and the model will not substitute another.
          </Callout>
        </DocSubsection>

        <DocSubsection id="theme-tokens" title="Design tokens">
          <p>
            At compile time a theme is flattened into CSS custom properties on
            the slide root. Components only ever read these variables, which is
            why any component works with any theme:
          </p>
          <div className="my-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {DECK_VARS.map(([name, purpose]) => (
              <div key={name} className="flex items-baseline gap-3 text-sm">
                <code className="font-mono text-xs text-[#8cc5ff] shrink-0">{name}</code>
                <span className="text-[rgba(232,230,240,0.45)] text-xs">{purpose}</span>
              </div>
            ))}
          </div>
          <p>
            Because these are ordinary CSS variables, you can override any of
            them by hand in an exported deck to match brand colors or fonts.
          </p>
        </DocSubsection>
      </DocSection>

      <DocSection id="components" title="Components" eyebrow="Core Concepts">
        <p className="flex flex-wrap items-center gap-3">
          <StatusBadge status="available" />
          <span className="text-sm text-[rgba(232,230,240,0.45)]">
            {components.length} slide components, each with a live preview.
          </span>
        </p>
        <p>
          Slides are composed from purpose-built components rather than free
          shapes. Each one owns its layout and CSS, declares the props it
          requires, and validates them before rendering.
        </p>

        <DocSubsection id="component-catalog" title="Component catalog">
          <p>
            Expand any component to see it rendered live, along with its exact
            prop contract and the example that produced the preview.
          </p>
          <div className="my-5">
            {components.map((component) => (
              <ComponentEntry key={component.name} component={component} />
            ))}
          </div>
        </DocSubsection>

        <DocSubsection id="deck-source" title="Deck Source format">
          <p>
            Deck Source is the structured document the model produces and the
            compiler consumes. It is plain JSON:
          </p>
          <CodeBlock
            filename="deck.json"
            showLineNumbers
            highlightLines={[2, 3]}
            code={`{
  "version": 1,
  "theme": "linear",
  "slides": [
    {
      "component": "hero",
      "props": {
        "title": "The Future of Flight",
        "subtitle": "Electric aviation, from prototype to fleet"
      }
    }
  ]
}`}
            caption="version and theme are deck-level; every slide names a component and its props."
          />
          <p>The schema enforces a few limits so model output stays sane:</p>
          <div className="my-5 grid sm:grid-cols-2 gap-3">
            {SCHEMA_LIMITS.map((limit) => (
              <div
                key={limit.label}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.35)] mb-1">
                  {limit.label}
                </p>
                <p className="text-sm font-semibold text-[#e8e6f0]">{limit.value}</p>
              </div>
            ))}
          </div>
          <Callout variant="note" title="Escaping is handled for you">
            Every text value is escaped before it reaches a component, so AI- or
            user-supplied content cannot inject markup into a slide.
          </Callout>
        </DocSubsection>
      </DocSection>

      <DocSection id="playground" title="Playground" eyebrow="Core Concepts">
        <p className="flex flex-wrap items-center gap-3">
          <StatusBadge status="available" />
          <span className="text-sm text-[rgba(232,230,240,0.45)]">
            Runs entirely in your browser.
          </span>
        </p>
        <p>
          The fastest way to understand the deck format is to change it and
          watch what happens. Pick a theme and a component, edit the props, and
          the slide recompiles as you type.
        </p>

        <DocSubsection id="playground-try" title="Try the compiler">
          <PlaygroundLoader />
          <Callout variant="tip" title="Try breaking it">
            Remove a required prop, or set{" "}
            <code className="font-mono text-[#8cc5ff]">items</code> to a string
            instead of an array. The errors you get back are the exact messages
            the generation API returns when a model produces an invalid deck —
            which is why a bad response never reaches your slides.
          </Callout>
        </DocSubsection>
      </DocSection>
    </>
  );
}
