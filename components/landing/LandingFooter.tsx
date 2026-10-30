import { Github, Mail } from "lucide-react";
import { CONTACT_EMAIL, FOOTER_COLUMNS, GITHUB_URL } from "./landing-data";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 mt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-2xl font-extrabold tracking-tight glitch inline-block" data-text="airDeck">
              airDeck
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(232,230,240,0.4)] max-w-xs">
              The AI presentation platform. One prompt in, a designed,
              editable deck out.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[rgba(232,230,240,0.4)] hover:text-[#e8e6f0] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email"
                className="text-[rgba(232,230,240,0.4)] hover:text-[#e8e6f0] transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(232,230,240,0.35)] mb-4">
                {column.heading}
              </p>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.soon ? (
                      <span
                        className="text-[rgba(232,230,240,0.3)] cursor-default"
                        title="Coming soon"
                      >
                        {link.label}
                        <span className="ml-1.5 text-[8px] uppercase tracking-widest align-middle border border-white/10 rounded-full px-1 py-px">
                          soon
                        </span>
                      </span>
                    ) : (
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-[rgba(232,230,240,0.5)] hover:text-[#e8e6f0] transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.15em] text-[rgba(232,230,240,0.3)]">
            © 2026 AIRDECK. ALL SIGNALS RECEIVED.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-[11px] tracking-[0.15em] text-[rgba(232,230,240,0.3)] hover:text-[#8cc5ff] transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
