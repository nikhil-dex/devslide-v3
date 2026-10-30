"use client";

import { NAV, hrefFor } from "./docs-data";

// Left rail. Presentational: the shell owns scroll-spy state and passes the
// active section down, so this component never re-implements tracking.
export default function DocsSidebar({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Documentation" className="space-y-7">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.3)]">
            {group.label}
          </p>
          <ul className="space-y-0.5 list-none">
            {group.sections.map((section) => {
              const active = activeSection === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={hrefFor(group.path, section.id)}
                    onClick={onNavigate}
                    aria-current={active ? "true" : undefined}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[#5eadff]/10 text-[#e8e6f0] border-l-2 border-[#5eadff] pl-[10px]"
                        : "text-[rgba(232,230,240,0.5)] hover:text-[#e8e6f0] hover:bg-white/[0.03]"
                    }`}
                  >
                    <section.icon
                      aria-hidden
                      className={`w-4 h-4 shrink-0 ${active ? "text-[#8cc5ff]" : "text-[rgba(232,230,240,0.35)] group-hover:text-[rgba(232,230,240,0.6)]"}`}
                    />
                    <span className="truncate">{section.title}</span>
                    {section.soon && (
                      <span className="ml-auto shrink-0 rounded-full border border-white/10 px-1.5 py-px text-[8px] uppercase tracking-widest text-[rgba(232,230,240,0.35)]">
                        Soon
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
