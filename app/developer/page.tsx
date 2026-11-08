import Link from "next/link";
import Playground from "@/components/docs/playground/Playground";

export const metadata = {
  title: "Developer Mode | AIRDeck",
  description: "Preview and test AIRDeck themes and components without generating a deck.",
};

export default function DeveloperPage() {
  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-12 text-[#e8e6f0] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            AIRDeck
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            Back to home
          </Link>
        </nav>
        <header className="max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#9ebaff]">
            Developer Mode
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Theme &amp; Component Lab
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Test every registered theme and component with the real slide compiler.
            Select a component, edit its example props, and inspect the live result.
            No AI generation, credits, or saved deck required.
          </p>
        </header>
        <Playground />
      </div>
    </main>
  );
}
