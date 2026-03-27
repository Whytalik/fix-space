"use client";

import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { searchRecords } from "@/lib/api/record";
import type { SpaceSearchResultDto } from "@nucleus/domain";
import { Database, FileText, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/primitives/spinner";

type SearchModalProps = {
  onClose: () => void;
};

function getMatchingValues(
  values: SpaceSearchResultDto["values"],
  term: string,
): Array<{ propertyName: string; snippet: string }> {
  if (!values || !term) return [];
  const lower = term.toLowerCase();
  const matches: Array<{ propertyName: string; snippet: string }> = [];

  for (const pv of values) {
    const name = pv.propertyName;
    if (!name) continue;
    const val = pv.value;
    if (val == null) continue;

    let snippet: string | null = null;
    if (typeof val === "string" && val.toLowerCase().includes(lower)) {
      snippet = val;
    } else if (Array.isArray(val)) {
      const hit = val.find((v) => typeof v === "string" && v.toLowerCase().includes(lower));
      if (typeof hit === "string") snippet = hit;
    }

    if (snippet) matches.push({ propertyName: name, snippet });
  }

  return matches;
}

function highlight(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((p, i) =>
    regex.test(p) ? (
      <mark key={i} className="bg-accent/20 text-accent rounded-xs not-italic">
        {p}
      </mark>
    ) : (
      p
    ),
  );
}

export function SearchModal({ onClose }: SearchModalProps) {
  const { space } = useAppContext();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpaceSearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscape(useCallback(onClose, [onClose]));

  useEffect(() => {
    if (!space || query.trim().length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchRecords(space.id, query.trim());
        setResults(data);
      } catch {
        setError("Search failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, space]);

  function handleResultClick(result: SpaceSearchResultDto) {
    router.push(`/record/${result.id}`);
    onClose();
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  const grouped = results.reduce<Record<string, SpaceSearchResultDto[]>>((acc, r) => {
    if (!acc[r.databaseTitle]) acc[r.databaseTitle] = [];
    acc[r.databaseTitle]!.push(r);
    return acc;
  }, {});

  const hasQuery = query.trim().length >= 1;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="w-130 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stroke">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={handleQueryChange}
            placeholder="Search records..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <button onClick={onClose} className="shrink-0 text-ink-muted hover:text-ink transition-colors duration-150">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results area */}
        <div className="max-h-90 overflow-y-auto scrollbar">
          {!hasQuery && (
            <p className="px-4 py-8 text-sm text-ink-muted text-center">Start typing to search across your space</p>
          )}

          {hasQuery && !isLoading && !error && results.length === 0 && (
            <p className="px-4 py-8 text-sm text-ink-muted text-center">No results for &laquo;{query}&raquo;</p>
          )}

          {hasQuery && error && <p className="px-4 py-8 text-sm text-red-400 text-center">{error}</p>}

          {hasQuery && !error && results.length > 0 && (
            <div className="py-2">
              {Object.entries(grouped).map(([dbTitle, items]) => (
                <div key={dbTitle}>
                  <div className="flex items-center gap-1.5 px-4 py-1.5">
                    <Database size={11} className="shrink-0 text-ink-muted" />
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">{dbTitle}</span>
                  </div>
                  {items.map((result) => {
                    const matchingValues = getMatchingValues(result.values, query);
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="flex items-start gap-3 w-full px-4 py-2 text-left hover:bg-surface transition-colors duration-100"
                      >
                        <FileText size={14} className="shrink-0 text-ink-muted mt-0.5" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm text-ink truncate">{highlight(result.name, query)}</span>
                          {matchingValues.map(({ propertyName, snippet }) => (
                            <span key={propertyName} className="text-xs text-ink-muted truncate">
                              <span className="font-medium">{propertyName}:</span> {highlight(snippet, query)}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
