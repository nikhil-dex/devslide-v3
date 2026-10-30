"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import StatusBadge, { type Status } from "./StatusBadge";

// One documentation section. `id` must match an entry in NAV so the sidebar,
// the "On This Page" rail and the scroll-spy all stay in sync.
export function DocSection({
  id,
  title,
  eyebrow,
  status,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  /** Shown beside the heading so maturity is never ambiguous. */
  status?: Status;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id={id}
      data-doc-section={id}
      className="docs-anchor scroll-mt-28 mb-20"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8cc5ff] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="flex flex-wrap items-center gap-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8e6f0] mb-5">
        {title}
        {status && <StatusBadge status={status} />}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(232,230,240,0.6)]">
        {children}
      </div>
    </motion.section>
  );
}

// A sub-heading inside a section. Its `id` is tracked by the scroll-spy too.
export function DocSubsection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-doc-subsection={id} className="docs-anchor scroll-mt-28 pt-6">
      <h3 className="text-lg font-bold text-[#e8e6f0] mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
