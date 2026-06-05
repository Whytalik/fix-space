"use client";

import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { searchRecords } from "@/lib/api/record";
import type { SpaceSearchResultDto } from "@fixspace/domain";
import { Database, FileText, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";

type SearchModalProps = {
  onClose: () => void;
};

function getMatchingValues(values: SpaceSearchResultDto["values"], term: string): Array<{ propertyName: string; snippet: string }> {
  if (!values || !term) return [];
  const lower = term.toLowerCase();
  const matches: Array<{ propertyName: string; snippet: string }> = [];

  for (const pv of values) {
    const name = pv.propertyName;
    if (!name) continue;
    const fieldValue = pv.value;
    if (fieldValue == null) continue;

    let snippet: string | null = null;
    if (typeof fieldValue === "string" && fieldValue.toLowerCase().includes(lower)) {
      snippet = fieldValue;
    } else if (Array.isArray(fieldValue)) {
      const matchedItem = fieldValue.find((valueItem) => typeof valueItem === "string" && valueItem.toLowerCase().includes(lower));
      if (typeof matchedItem === "string") snippet = matchedItem;
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
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-accent/20 text-accent rounded-xs not-italic">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchModal({ onClose }: SearchModalProps) {
  const t = useTranslations("SearchModal");
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
        setError(t("searchFailed"));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, space, t]);

  function handleResultClick(result: SpaceSearchResultDto) {
    router.push(`/database/${result.databaseId}`);
    onClose();
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  const grouped = results.reduce<Record<string, SpaceSearchResultDto[]>>((accumulator, result) => {
    if (!accumulator[result.databaseTitle]) accumulator[result.databaseTitle] = [];
    accumulator[result.databaseTitle]!.push(result);
    return accumulator;
  }, {});

  const hasQuery = query.trim().length >= 1;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={onClose}>
      <div
        className="w-160 bg-elevated border border-stroke rounded-2xl overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stroke">
          <Search size={14} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={handleQueryChange}
            placeholder={t("searchRecords")}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <button type="button" onClick={onClose} className="shrink-0 text-ink-muted hover:text-ink transition-colors duration-150">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="max-h-90 overflow-y-auto scrollbar">
          {!hasQuery && <p className="px-4 py-8 text-sm text-ink-muted text-center">{t("startTyping")}</p>}

          {hasQuery && !isLoading && !error && results.length === 0 && (
            <p className="px-4 py-8 text-sm text-ink-muted text-center">
              {t("noResults")} &laquo;{query}&raquo;
            </p>
          )}

          {hasQuery && error && <p className="px-4 py-8 text-sm text-error text-center">{error}</p>}

          {hasQuery && !error && results.length > 0 && (
            <div className="py-2">
              {Object.entries(grouped).map(([dbTitle, items]) => (
                <div key={dbTitle}>
                  <div className="flex items-center gap-1.5 px-4 py-1.5">
                    <Database size={14} className="shrink-0 text-ink-muted" />
                    <span className="type-nav-label">{dbTitle}</span>
                  </div>
                  {items.map((result) => {
                    const matchingValues = getMatchingValues(result.values, query);
                    return (
                      <button
                        type="button"
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="flex items-start gap-3 w-full px-4 py-2 text-left hover:bg-surface transition-colors duration-150"
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
