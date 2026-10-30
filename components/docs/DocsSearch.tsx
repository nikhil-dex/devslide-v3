"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SEARCH_PHRASES } from "./docs-data";
import {
  createPlaceholderProvider,
  type DocsSearchProvider,
  type SearchResult,
} from "./search";

// The search field talks to a DocsSearchProvider and nothing else. Today the
// placeholder provider reports `ready: false`, so the field explains that
// search is not live yet. Passing a Fuse or Algolia provider switches this
// component to real results with no changes here.

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export default function DocsSearch({
  provider,
}: {
  provider?: DocsSearchProvider;
}) {
  const engine = useMemo(() => provider ?? createPlaceholderProvider(), [provider]);

  const [placeholder, setPlaceholder] = useState(SEARCH_PHRASES[0]);
  const [query, setQuery] = useState("");
  // Hits are stored with the query they belong to, so results are derived
  // rather than cleared — a slow provider can never render stale matches.
  const [hits, setHits] = useState<{ query: string; results: SearchResult[] }>({
    query: "",
    results: [],
  });
  const [paused, setPaused] = useState(false);
  const timers = useRef<{ cycle?: number; frame?: number }>({});

  const trimmed = query.trim();
  const searchable = engine.ready && trimmed.length >= 2;
  const results = searchable && hits.query === trimmed ? hits.results : [];

  // Scramble the placeholder until the field is used. Pure decoration —
  // it stops permanently on first focus so it never fights the user.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let phraseIndex = 0;
    const scrambleTo = (next: string) => {
      let iteration = 0;
      window.clearInterval(timers.current.frame);
      timers.current.frame = window.setInterval(() => {
        setPlaceholder(
          next
            .split("")
            .map((ch, i) => {
              if (i < iteration) return next[i];
              if (ch === " ") return " ";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        if (iteration >= next.length) {
          window.clearInterval(timers.current.frame);
          setPlaceholder(next);
        }
        iteration += 0.8;
      }, 38);
    };

    timers.current.cycle = window.setInterval(() => {
      phraseIndex = (phraseIndex + 1) % SEARCH_PHRASES.length;
      scrambleTo(SEARCH_PHRASES[phraseIndex]);
    }, 4200);

    const t = timers.current;
    return () => {
      window.clearInterval(t.cycle);
      window.clearInterval(t.frame);
    };
  }, [paused]);

  // Query the provider. Aborts in-flight work when the query changes, so a
  // future network-backed engine never renders stale results.
  useEffect(() => {
    if (!searchable) return;
    const controller = new AbortController();
    let live = true;
    engine
      .search(trimmed, { limit: 8, signal: controller.signal })
      .then((found) => {
        if (live) setHits({ query: trimmed, results: found });
      })
      .catch(() => {
        if (live) setHits({ query: trimmed, results: [] });
      });
    return () => {
      live = false;
      controller.abort();
    };
  }, [trimmed, searchable, engine]);

  const showUnavailable = !engine.ready && trimmed.length > 0;

  return (
    <div className="relative">
      <label htmlFor="docs-search" className="sr-only">
        Search the documentation
      </label>
      <div className="glass-card flex items-center gap-3 rounded-xl px-4 py-2.5 focus-within:border-[#5eadff]/50 transition-colors">
        <Search aria-hidden className="w-4 h-4 shrink-0 text-[rgba(232,230,240,0.4)]" />
        <input
          id="docs-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setPaused(true);
            setPlaceholder(SEARCH_PHRASES[0]);
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="docs-search-results"
          aria-autocomplete="list"
          className="w-full bg-transparent text-sm text-[#e8e6f0] placeholder:text-[rgba(232,230,240,0.35)] outline-none"
        />
        <kbd className="hidden sm:inline-block rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-[rgba(232,230,240,0.4)]">
          /
        </kbd>
      </div>

      {/* Results render from whatever provider is supplied. With the
          placeholder provider this list is always empty. */}
      {results.length > 0 && (
        <ul
          id="docs-search-results"
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#0c0c12] list-none"
        >
          {results.map(({ document }) => (
            <li key={document.id} role="option" aria-selected="false">
              <a
                href={document.href}
                className="block px-4 py-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="block text-sm text-[#e8e6f0]">{document.title}</span>
                <span className="block text-[11px] text-[rgba(232,230,240,0.4)]">
                  {document.breadcrumb}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {showUnavailable && (
        <p
          id="docs-search-results"
          role="status"
          className="absolute left-0 right-0 z-20 mt-2 rounded-lg border border-white/10 bg-[#0c0c12] px-4 py-3 text-xs text-[rgba(232,230,240,0.45)]"
        >
          Full-text search is not wired up yet. Use the navigation on the left —
          every section is one click away.
        </p>
      )}
    </div>
  );
}
