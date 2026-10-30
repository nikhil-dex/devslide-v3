"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Info, Lightbulb, AlertTriangle, Clock, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "note" | "tip" | "warning" | "soon";

const VARIANTS: Record<
  Variant,
  { icon: LucideIcon; label: string; accent: string; border: string; bg: string }
> = {
  note: {
    icon: Info,
    label: "Note",
    accent: "text-[#8cc5ff]",
    border: "border-[#5eadff]/25",
    bg: "bg-[#5eadff]/[0.06]",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    accent: "text-[#b3ffc8]",
    border: "border-[#b3ffc8]/25",
    bg: "bg-[#b3ffc8]/[0.05]",
  },
  warning: {
    icon: AlertTriangle,
    label: "Heads up",
    accent: "text-[#f2c55c]",
    border: "border-[#f2c55c]/25",
    bg: "bg-[#f2c55c]/[0.05]",
  },
  soon: {
    icon: Clock,
    label: "Coming soon",
    accent: "text-[#ff9ef9]",
    border: "border-[#ff6ef7]/25",
    bg: "bg-[#ff6ef7]/[0.05]",
  },
};

export default function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { icon: Icon, label, accent, border, bg } = VARIANTS[variant];

  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`my-6 rounded-xl border ${border} ${bg} px-5 py-4`}
    >
      <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] ${accent} mb-2`}>
        <Icon aria-hidden className="w-3.5 h-3.5" />
        {title ?? label}
      </p>
      <div className="text-sm leading-relaxed text-[rgba(232,230,240,0.6)]">
        {children}
      </div>
    </motion.aside>
  );
}
