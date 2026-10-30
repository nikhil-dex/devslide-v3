"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";

// Dependency-free highlighting. Tokens become React nodes rather than an
// HTML string — nothing is ever injected as markup, so slide/user content
// in a code sample can never escape into the page.

export type CodeLanguage = "json" | "bash" | "html" | "text";

const JSON_TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
const HTML_TOKEN = /(<!--.*?-->)|(<\/?[a-zA-Z][\w-]*)|([a-zA-Z-]+)=|("[^"]*")|(>)/g;

const C = {
  key: "text-[#8cc5ff]",
  string: "text-[#b3ffc8]",
  literal: "text-[#ff9ef9]",
  tag: "text-[#ff9ef9]",
  attr: "text-[#8cc5ff]",
  comment: "text-[rgba(232,230,240,0.3)]",
  punct: "text-[rgba(232,230,240,0.4)]",
};

function tokenize(line: string, language: CodeLanguage): ReactNode[] {
  if (language === "text") return [line];

  if (language === "bash") {
    return line.trimStart().startsWith("#")
      ? [<span key="c" className={C.comment}>{line}</span>]
      : [line];
  }

  const pattern = language === "json" ? JSON_TOKEN : HTML_TOKEN;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of line.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) out.push(line.slice(last, start));

    if (language === "json") {
      const [, str, colon, literal, num] = match;
      if (str && colon) {
        out.push(<span key={key++} className={C.key}>{str}</span>, colon);
      } else if (str) {
        out.push(<span key={key++} className={C.string}>{str}</span>);
      } else if (literal || num) {
        out.push(<span key={key++} className={C.literal}>{literal ?? num}</span>);
      }
    } else {
      const [full, comment, tag, attr, str, gt] = match;
      if (comment) out.push(<span key={key++} className={C.comment}>{comment}</span>);
      else if (tag) out.push(<span key={key++} className={C.tag}>{tag}</span>);
      else if (attr) out.push(<span key={key++} className={C.attr}>{attr}</span>, "=");
      else if (str) out.push(<span key={key++} className={C.string}>{str}</span>);
      else if (gt) out.push(<span key={key++} className={C.punct}>{gt}</span>);
      else out.push(full);
    }
    last = start + match[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function CodeBlock({
  code,
  language = "json",
  filename,
  showLineNumbers = false,
  highlightLines = [],
  caption,
}: {
  code: string;
  language?: CodeLanguage;
  filename?: string;
  showLineNumbers?: boolean;
  /** 1-indexed line numbers to emphasize. */
  highlightLines?: number[];
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const highlighted = new Set(highlightLines);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context or denied) — fail quietly.
    }
  };

  return (
    <figure className="group relative my-6 rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(232,230,240,0.4)]">
          {filename ?? language}
        </span>
        <button
          onClick={copy}
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
          className="relative shrink-0 inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] text-[rgba(232,230,240,0.55)] opacity-100 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-white hover:border-white/25 transition-all"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5"
              >
                <Check aria-hidden className="w-3 h-3 text-[#b3ffc8]" /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5"
              >
                <Copy aria-hidden className="w-3 h-3" /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </figcaption>

      <pre className="docs-scroll overflow-x-auto py-3 text-[13px] leading-relaxed">
        <code className="font-mono text-[rgba(232,230,240,0.85)]">
          {lines.map((line, i) => (
            <span
              key={i}
              className="docs-code-line"
              data-highlight={highlighted.has(i + 1) ? "true" : undefined}
            >
              {showLineNumbers && <span className="docs-code-num">{i + 1}</span>}
              {tokenize(line, language)}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>

      {caption && (
        <p className="border-t border-white/10 px-4 py-2 text-[11px] text-[rgba(232,230,240,0.4)]">
          {caption}
        </p>
      )}
    </figure>
  );
}
