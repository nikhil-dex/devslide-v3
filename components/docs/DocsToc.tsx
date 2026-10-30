"use client";

import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { NAV, QUICK_LINKS, hrefFor } from "./docs-data";
import { GITHUB_URL } from "@/components/landing/landing-data";

// Right rail: "On This Page" (all sections, with the active one expanded to
// reveal its subsections) plus a small quick-links card.
export default function DocsToc({
  activeSection,
  activeAnchor,
}: {
  activeSection: string;
  activeAnchor: string;
}) {
  const sections = NAV.flatMap((group) =>
    group.sections.map((section) => ({ ...section, groupPath: group.path }))
  );

  return (
    <div className="space-y-8">
      <nav aria-label="On this page">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.3)]">
          On this page
        </p>
        <ul className="space-y-1 list-none border-l border-white/10">
          {sections.map((section) => {
            const active = activeSection === section.id;
            return (
              <li key={section.id}>
                <a
                  href={hrefFor(section.groupPath, section.id)}
                  aria-current={active ? "true" : undefined}
                  className={`block border-l-2 -ml-px py-1 pl-3 text-xs transition-colors ${
                    active
                      ? "border-[#5eadff] text-[#e8e6f0]"
                      : "border-transparent text-[rgba(232,230,240,0.4)] hover:text-[rgba(232,230,240,0.75)]"
                  }`}
                >
                  {section.title}
                </a>
                {active && section.subsections && (
                  <ul className="list-none">
                    {section.subsections.map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={hrefFor(section.groupPath, sub.id)}
                          aria-current={activeAnchor === sub.id ? "true" : undefined}
                          className={`block py-1 pl-7 text-xs transition-colors ${
                            activeAnchor === sub.id
                              ? "text-[#8cc5ff]"
                              : "text-[rgba(232,230,240,0.32)] hover:text-[rgba(232,230,240,0.6)]"
                          }`}
                        >
                          {sub.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="glass-card rounded-xl p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.3)]">
          Quick links
        </p>
        <ul className="space-y-2 list-none">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between gap-2 text-xs text-[rgba(232,230,240,0.55)] hover:text-[#e8e6f0] transition-colors"
              >
                {link.label}
                <ArrowUpRight
                  aria-hidden
                  className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </li>
          ))}
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-xs text-[rgba(232,230,240,0.55)] hover:text-[#e8e6f0] transition-colors"
            >
              <Github aria-hidden className="w-3.5 h-3.5" />
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
