"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// Expandable example / disclosure. Uses a real <button> with aria-expanded
// so it is keyboard operable and announced correctly.
export default function Expandable({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="my-5 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <ChevronRight
          aria-hidden
          className={`w-4 h-4 shrink-0 text-[rgba(232,230,240,0.4)] transition-transform duration-300 ${
            open ? "rotate-90 text-[#8cc5ff]" : ""
          }`}
        />
        <span className="text-sm font-semibold text-[#e8e6f0]">{title}</span>
        {hint && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(232,230,240,0.3)]">
            {hint}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
