import { DocSection, DocSubsection } from "../DocSection";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";

const KEYS = [
  ["→ / Space / PageDown", "Next slide"],
  ["← / PageUp", "Previous slide"],
  ["F", "Fullscreen"],
  ["Tap edges / swipe", "Navigate on touch devices"],
];

export default function ExportDocs() {
  return (
    <>
      <DocSection
        id="html-export"
        title="Interactive HTML Export"
        eyebrow="Exporting"
      >
        <p>
          The HTML export is AIRDeck&rsquo;s native format: one self-contained
          file holding your whole deck. Open it from a hard drive, a USB stick
          or any static host — there is no runtime, no player to install and no
          network dependency.
        </p>
        <p>
          Because it is a real web page, everything your slides do keeps
          working: CSS animations, gradients, hover states, click handlers,
          tabs, counters and progress bars all run exactly as they did in the
          editor.
        </p>

        <DocSubsection id="html-anatomy" title="Anatomy of an export">
          <p>
            Inside the file is a small viewer shell wrapped around your slides.
            Each slide is authored on a fixed 1920×1080 canvas and scaled to
            fit whatever screen it lands on, so the layout never reflows
            unexpectedly:
          </p>
          <CodeBlock
            language="text"
            filename="export.html — structure"
            code={`export.html
├─ viewer shell
│  ├─ scaled 1920×1080 frame
│  ├─ HUD — prev / counter / next / fullscreen
│  └─ touch zones — tap edges, swipe
└─ slides[]  — one standalone HTML document each`}
          />
          <p>Navigation is available from the keyboard and by touch:</p>
          <div className="my-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {KEYS.map(([key, action]) => (
              <div key={key} className="flex items-baseline justify-between gap-3 text-sm border-b border-white/5 py-1.5">
                <kbd className="font-mono text-xs text-[#8cc5ff]">{key}</kbd>
                <span className="text-xs text-[rgba(232,230,240,0.45)]">{action}</span>
              </div>
            ))}
          </div>
          <Callout variant="tip" title="Sharing a link">
            Publishing a deck gives you a public URL with the same viewer, so
            recipients get the interactive version without downloading
            anything.
          </Callout>
        </DocSubsection>
      </DocSection>

      <DocSection id="pptx-export" title="PowerPoint Export" eyebrow="Exporting">
        <p>
          Some rooms run on PowerPoint. AIRDeck exports a{" "}
          <code className="font-mono text-sm text-[#8cc5ff]">.pptx</code> file
          so your deck can open in the software your audience already has.
        </p>

        <DocSubsection id="pptx-tradeoffs" title="What changes on export">
          <p>
            PowerPoint has no equivalent for a live web page, so slides are
            flattened into images. That trade is worth understanding before you
            pick a format:
          </p>
          <div className="my-5 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#b3ffc8]/20 bg-[#b3ffc8]/[0.04] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#b3ffc8] mb-3">
                Kept
              </p>
              <ul className="space-y-1.5 text-sm list-none text-[rgba(232,230,240,0.6)]">
                <li>Exact visual composition</li>
                <li>Typography, color and layout</li>
                <li>Slide order and count</li>
                <li>Offline playback anywhere</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[#f2c55c]/20 bg-[#f2c55c]/[0.04] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f2c55c] mb-3">
                Lost
              </p>
              <ul className="space-y-1.5 text-sm list-none text-[rgba(232,230,240,0.6)]">
                <li>Animations and transitions</li>
                <li>Interactive tabs and buttons</li>
                <li>Live counters and progress bars</li>
                <li>Editable text inside PowerPoint</li>
              </ul>
            </div>
          </div>
          <Callout variant="warning" title="Pick the format for the room">
            Presenting from your own laptop or sharing a link? Use HTML and
            keep everything alive. Handing the file to someone who will open it
            in PowerPoint? Export <code className="font-mono">.pptx</code> and
            expect still frames.
          </Callout>
        </DocSubsection>
      </DocSection>
    </>
  );
}
