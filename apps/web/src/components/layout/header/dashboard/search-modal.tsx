"use client";

import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/ui/use-escape";
import { searchRecords } from "@/lib/api/record";
import type { SpaceSearchResultDto } from "@fixspace/domain";
import { Database, FileText, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";

type SearchModalProps = {
  onClose: () => void;
};

function getMatchingValues(result: SpaceSearchResultDto, term: string): Array<{ propertyName: string; snippet: string }> {
  const { values, content } = result;
  if (!term) return [];
  const lower = term.toLowerCase();
  const matches: Array<{ propertyName: string; snippet: string }> = [];

  if (values) {
    for (const propertyValue of values) {
      const name = propertyValue.propertyName;
      if (!name) continue;
      const fieldValue = propertyValue.value;
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
  }

  if (content) {
    const contentText = extractTextFromJson(content);
    if (contentText.toLowerCase().includes(lower)) {
      const index = contentText.toLowerCase().indexOf(lower);
      const start = Math.max(0, index - 40);
      const end = Math.min(contentText.length, index + term.length + 40);
      let snippet = contentText.slice(start, end);
      if (start > 0) snippet = "..." + snippet;
      if (end < contentText.length) snippet = snippet + "...";
      matches.push({ propertyName: "Content", snippet });
    }
  }

  return matches;
}

function extractTextFromJson(json: unknown): string {
  if (typeof json === "string") return json;
  if (!json || typeof json !== "object") return "";

  let text = "";

  if (Array.isArray(json)) {
    for (const item of json) {
      text += " " + extractTextFromJson(item);
    }
  } else {
    const record = json as Record<string, unknown>;

    if (typeof record.text === "string") text += " " + record.text;
    if (typeof record.title === "string") text += " " + record.title;
    if (typeof record.html === "string") {
      const plainText = record.html.replace(/<[^>]*>?/gm, " ");
      text += " " + plainText;
    }
    if (typeof record.caption === "string") text += " " + record.caption;
    if (typeof record.name === "string") text += " " + record.name;

    const containerFields = ["rows", "columns", "children", "items", "data", "content"];
    for (const field of containerFields) {
      if (record[field]) {
        text += " " + extractTextFromJson(record[field]);
      }
    }
  }

  return text.replace(/\s+/g, " ").trim();
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEscape(useCallback(onClose, [onClose]));

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term || term.length < 2) return;
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!space || query.trim().length < 2) {
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
        if (data.length > 0) {
          saveRecentSearch(query.trim());
        }
      } catch {
        setError(t("searchFailed"));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, space, t, saveRecentSearch]);

  function handleResultClick(result: SpaceSearchResultDto) {
    router.push(`/record/${result.id}`);
    onClose();
  }

  function handleShowAll(databaseId: string) {
    router.push(`/database/${databaseId}?q=${encodeURIComponent(query)}`);
    onClose();
  }

  function handleRecentClick(term: string) {
    setQuery(term);
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  const grouped = results.reduce<Record<string, { title: string; databaseId: string; items: SpaceSearchResultDto[] }>>(
    (accumulator, result) => {
      const key = result.databaseId;
      if (!accumulator[key]) {
        const title = result.sectionName ? `${result.sectionName} / ${result.databaseName}` : result.databaseName;
        accumulator[key] = { title, databaseId: result.databaseId, items: [] };
      }
      accumulator[key]!.items.push(result);
      return accumulator;
    },
    {},
  );

  const hasQuery = query.trim().length >= 2;
  const isTooShort = query.trim().length > 0 && query.trim().length < 2;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={onClose}>
      <div
        className="w-160 bg-elevated border border-stroke rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-up"
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

        <div className="max-h-120 overflow-y-auto scrollbar">
          {!hasQuery && !isTooShort && (
            <div className="px-4 py-6">
              {recentSearches.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="type-nav-label px-2 mb-1">{t("recentSearches")}</span>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleRecentClick(term)}
                      className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface rounded-lg transition-colors duration-150 text-left"
                    >
                      <Search size={13} />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted text-center">{t("startTyping")}</p>
              )}
            </div>
          )}

          {isTooShort && <p className="px-4 py-8 text-sm text-ink-muted text-center">{t("minChars")}</p>}

          {hasQuery && !isLoading && !error && results.length === 0 && (
            <p className="px-4 py-8 text-sm text-ink-muted text-center">
              {t("noResults")} &laquo;{query}&raquo;
            </p>
          )}

          {hasQuery && error && <p className="px-4 py-8 text-sm text-error text-center">{error}</p>}

          {hasQuery && !error && results.length > 0 && (
            <div className="py-2">
              {Object.entries(grouped).map(([databaseId, group]) => (
                <div key={databaseId} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-1.5 px-4 py-1.5">
                    <Database size={14} className="shrink-0 text-ink-muted" />
                    <span className="type-nav-label">{group.title}</span>
                  </div>
                  {group.items.slice(0, 5).map((result) => {
                    const matchingValues = getMatchingValues(result, query);
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
                  {group.items.length > 5 && (
                    <button
                      type="button"
                      onClick={() => handleShowAll(databaseId)}
                      className="w-full px-11 py-1.5 text-left text-xs text-accent hover:underline transition-all duration-150"
                    >
                      {t("showAllResults", { database: group.items[0]?.databaseName ?? "" })}
                    </button>
                  )}
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
