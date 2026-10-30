// Search architecture.
//
// Search is intentionally not implemented yet, but the seam is. Everything
// the UI needs is defined here as a provider contract, and the index that a
// real engine would consume is already built from NAV. Shipping Fuse.js or
// Algolia later means writing one `DocsSearchProvider` and passing it to
// <DocsSearch provider={…} /> — no component, prop or type changes.

import { NAV } from "./docs-data";

/** One addressable unit of documentation. */
export type SearchDocument = {
  id: string;
  title: string;
  /** Human-readable breadcrumb, e.g. "Core Concepts › Themes". */
  breadcrumb: string;
  href: string;
  /** Free text an engine can match against. */
  body: string;
  keywords: string[];
};

export type SearchResult = {
  document: SearchDocument;
  /** 0–1, higher is better. Placeholder provider never returns results. */
  score: number;
};

export type SearchOptions = { limit?: number; signal?: AbortSignal };

export interface DocsSearchProvider {
  /** Stable identifier, useful for debugging and analytics. */
  readonly name: string;
  /** False while no engine is wired up — the UI shows its unavailable state. */
  readonly ready: boolean;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

/**
 * The index a real engine would consume. Derived from NAV so it stays
 * complete as the documentation grows — adding a section adds a document.
 * Extra documents (theme ids, component names) can be appended by callers
 * that have the registries in scope.
 */
export function buildSearchIndex(extra: SearchDocument[] = []): SearchDocument[] {
  const documents: SearchDocument[] = [];

  for (const group of NAV) {
    for (const section of group.sections) {
      documents.push({
        id: section.id,
        title: section.title,
        breadcrumb: `${group.label} › ${section.title}`,
        href: `#${section.id}`,
        body: section.title,
        keywords: [section.title.toLowerCase(), group.label.toLowerCase()],
      });

      for (const sub of section.subsections ?? []) {
        documents.push({
          id: sub.id,
          title: sub.title,
          breadcrumb: `${section.title} › ${sub.title}`,
          href: `#${sub.id}`,
          body: sub.title,
          keywords: [sub.title.toLowerCase()],
        });
      }
    }
  }

  return [...documents, ...extra];
}

/**
 * The provider shipped today: reports itself as not ready and returns
 * nothing. The UI reads `ready` to show its "search is on the way" state
 * rather than a fake empty-results screen.
 */
export function createPlaceholderProvider(): DocsSearchProvider {
  return {
    name: "placeholder",
    ready: false,
    async search() {
      return [];
    },
  };
}

/*
 * Reference implementations for later — deliberately not wired up.
 *
 *   // Fuse.js (client-side, no service):
 *   export function createFuseProvider(index: SearchDocument[]): DocsSearchProvider {
 *     const fuse = new Fuse(index, { keys: ["title", "body", "keywords"], threshold: 0.35 });
 *     return {
 *       name: "fuse",
 *       ready: true,
 *       async search(query, { limit = 8 } = {}) {
 *         return fuse.search(query, { limit }).map((r) => ({
 *           document: r.item,
 *           score: 1 - (r.score ?? 0),
 *         }));
 *       },
 *     };
 *   }
 *
 *   // Algolia (hosted): same shape, `search` awaits the client and maps hits
 *   // onto SearchResult. The component never learns which one it is talking to.
 */
