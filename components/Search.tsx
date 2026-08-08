"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Client-side search over every content file.
 *
 * The index is built once at build time and handed down from the layout, so
 * there is no request and nothing to go stale between deploys.
 */

export type SearchEntry = {
  title: string;
  href: string;
  section: string;
  summary: string;
  /** Body text, markdown syntax stripped, truncated. */
  text: string;
};

type Ctx = {
  index: SearchEntry[];
  open: () => void;
};

const SearchContext = createContext<Ctx>({ index: [], open: () => {} });

/* -------------------------------------------------------------------------
   Matching
   ------------------------------------------------------------------------- */

type Hit = SearchEntry & { score: number; excerpt: string };

function buildExcerpt(text: string, query: string): string {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at === -1) return text.slice(0, 140).trim();
  const start = Math.max(0, at - 50);
  const slice = text.slice(start, start + 160).trim();
  return `${start > 0 ? "…" : ""}${slice}…`;
}

function search(index: SearchEntry[], raw: string): Hit[] {
  const query = raw.trim().toLowerCase();
  if (query.length < 2) return [];

  // Every whitespace-separated term must appear somewhere in the entry.
  // Simple, predictable, and fast enough at this size.
  const terms = query.split(/\s+/);

  return index
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const summary = entry.summary.toLowerCase();
      const text = entry.text.toLowerCase();
      const haystack = `${title} ${summary} ${text}`;

      if (!terms.every((t) => haystack.includes(t))) return null;

      // Title matches rank above summary, which ranks above body.
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 10;
        if (summary.includes(t)) score += 4;
        if (text.includes(t)) score += 1;
      }
      if (title.startsWith(query)) score += 15;

      return {
        ...entry,
        score,
        excerpt: buildExcerpt(entry.summary || entry.text, query),
      };
    })
    .filter((h): h is Hit => h !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

/* -------------------------------------------------------------------------
   Provider + dialog
   ------------------------------------------------------------------------- */

export function SearchProvider({
  index,
  children,
}: {
  index: SearchEntry[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // "/" opens search from anywhere, unless the reader is already typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const hits = useMemo(() => search(index, query), [index, query]);

  /**
   * Results are grouped by section, and the sections appear in a fixed order
   * rather than by score. Open items match strongly on short titles, so
   * scoring alone buried the actual pages under a wall of to-dos — which is
   * the opposite of what someone searching "Vercel" wants to see first.
   */
  const grouped = useMemo(() => {
    const ORDER = ["Pages", "Systems", "Accounts", "Spend", "Runbooks", "To do"];
    const map = new Map<string, Hit[]>();
    for (const hit of hits) {
      const list = map.get(hit.section) ?? [];
      list.push(hit);
      map.set(hit.section, list);
    }
    return [...map.entries()].sort((a, b) => {
      const ai = ORDER.indexOf(a[0]);
      const bi = ORDER.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [hits]);

  return (
    <SearchContext.Provider value={{ index, open }}>
      {children}

      {isOpen ? (
        <div className="no-print fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh]">
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 bg-[#16181a]/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative flex max-h-[80vh] w-full max-w-xl flex-col border border-line bg-surface shadow-xl"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div className="border-b border-line p-3">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search everything…"
                aria-label="Search all content"
                className="w-full bg-transparent px-2 py-2 text-[17px] outline-none"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <p className="px-3 py-6 text-[15px] text-muted">
                  Type at least two characters. Searches every page, system,
                  runbook and to-do.
                </p>
              ) : hits.length === 0 ? (
                <p className="px-3 py-6 text-[15px] text-muted">
                  Nothing matched{" "}
                  <span className="font-mono text-ink">{query}</span>.
                </p>
              ) : (
                grouped.map(([section, sectionHits]) => (
                  <div key={section} className="mb-3">
                    <p className="type-eyebrow px-3 py-2 text-muted">
                      {section}
                    </p>
                    <ul>
                      {sectionHits.map((hit) => (
                        <li key={hit.href + hit.title}>
                          <Link
                            href={hit.href}
                            onClick={close}
                            className="block px-3 py-2 hover:bg-[#efeeea]"
                          >
                            <span className="block font-medium text-cross-navy">
                              {hit.title}
                            </span>
                            <span className="mt-0.5 block text-[14px] leading-snug text-muted">
                              {hit.excerpt}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-line px-4 py-2">
              <p className="type-eyebrow text-muted">
                Press <span className="text-ink">Esc</span> to close
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </SearchContext.Provider>
  );
}

/* -------------------------------------------------------------------------
   Triggers
   ------------------------------------------------------------------------- */

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const { open } = useContext(SearchContext);

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="border border-line bg-surface px-3 py-2 text-[14px]"
        style={{ borderRadius: "var(--radius-control)" }}
      >
        Search
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center justify-between gap-2 border border-line bg-paper px-3 py-2 text-left text-[14px] text-muted hover:border-cross-blue"
      style={{ borderRadius: "var(--radius-control)" }}
    >
      <span>Search…</span>
      <span
        className="type-eyebrow border border-line bg-surface px-1.5 py-0.5"
        style={{ borderRadius: "2px" }}
      >
        /
      </span>
    </button>
  );
}
