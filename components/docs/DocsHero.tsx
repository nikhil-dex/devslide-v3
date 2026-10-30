import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

// Compact page header inside the content column, so the three columns stay
// aligned from the top (Stripe/Vercel pattern) instead of a full-bleed hero.
export default function DocsHero() {
  return (
    <header className="mb-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[rgba(232,230,240,0.35)] list-none">
          <li>
            <Link href="/" className="hover:text-[#8cc5ff] transition-colors">
              AIRDeck
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[#8cc5ff]">Docs</li>
        </ol>
      </nav>

      <h1 className="mt-5 flex items-center gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#e8e6f0]">
        <BookOpen aria-hidden className="w-7 h-7 text-[#8cc5ff] shrink-0" />
        Documentation
      </h1>

      <p className="mt-4 text-base sm:text-lg leading-relaxed text-[rgba(232,230,240,0.5)] max-w-2xl">
        Everything you need to go from a sentence to a finished presentation —
        how the engine works, what the themes and components do, and how to
        write prompts that produce the deck you actually wanted.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/generate"
          className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          Generate a presentation
        </Link>
        <Link
          href="/showcase"
          className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-[rgba(232,230,240,0.7)] hover:border-white/30 hover:text-[#e8e6f0] transition-colors"
        >
          See live examples
          <ArrowUpRight
            aria-hidden
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
