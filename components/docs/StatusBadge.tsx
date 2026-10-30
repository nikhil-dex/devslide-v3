import { CircleCheck, Clock, Telescope } from "lucide-react";

// One vocabulary for maturity, used everywhere on the page so a reader can
// always tell shipped behavior from intent at a glance.
export type Status = "available" | "soon" | "vision";

const STATUS = {
  available: {
    icon: CircleCheck,
    label: "Available today",
    className: "border-[#b3ffc8]/30 bg-[#b3ffc8]/[0.07] text-[#b3ffc8]",
  },
  soon: {
    icon: Clock,
    label: "Coming soon",
    className: "border-[#ff6ef7]/30 bg-[#ff6ef7]/[0.07] text-[#ff9ef9]",
  },
  vision: {
    icon: Telescope,
    label: "Future vision",
    className: "border-white/15 bg-white/[0.04] text-[rgba(232,230,240,0.5)]",
  },
} as const;

export default function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children?: string;
}) {
  const { icon: Icon, label, className } = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${className}`}
    >
      <Icon aria-hidden className="w-3 h-3" />
      {children ?? label}
    </span>
  );
}
