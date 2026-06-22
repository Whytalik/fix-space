"use client";

import { useRecordsQuery } from "@/hooks/api/use-records-query";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { FileText, Search, X, Check } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import Link from "next/link";
import type { RecordResponseDto } from "@fixspace/domain";
import { cn } from "@/utils/ui/cn";
import { useTranslations } from "next-intl";

interface RelationPropertyProps {
  databaseId?: string;
  records?: RecordResponseDto[] | null;
  multiple: boolean;
  value: unknown;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: unknown) => void;
}

export function RelationProperty({
  databaseId,
  records: providedRecords,
  multiple,
  value,
  readOnly,
  className,
  onChange,
}: RelationPropertyProps) {
  const t = useTranslations("RelationInput");
  const {
    data: fetchedRecords,
    isLoading: isQueryLoading,
    isError: isQueryError,
  } = useRecordsQuery(databaseId ?? "", {
    enabled: !!databaseId && providedRecords === undefined,
  });

  const records = providedRecords !== undefined ? providedRecords : fetchedRecords;
  const isLoading = (providedRecords === undefined && isQueryLoading) || providedRecords === null;
  const isError = providedRecords === undefined && isQueryError;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? (value as string[]) : [value as string];
  }, [value]);

  const [draftSelected, setDraftSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isModalOpen) {
      setDraftSelected(selectedIds);
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isModalOpen, selectedIds]);

  if (!databaseId || isError) {
    if (selectedIds.length === 0) return <span className="text-ink-muted">—</span>;
    return (
      <div className={cn("flex flex-wrap gap-1.5 items-center", className)} title={t("targetDbDeleted")}>
        {selectedIds.map((id) => (
          <span
            key={id}
            className="inline-flex items-center px-2 py-0.5 rounded border border-error/30 bg-error/10 text-xs text-error font-mono"
          >
            {id.slice(0, 8)}...
          </span>
        ))}
        <span className="text-xs text-error italic opacity-80">({t("dbDeleted")})</span>
      </div>
    );
  }

  if (isLoading) {
    return <span className="text-ink-muted text-xs animate-pulse italic">{t("loading")}</span>;
  }

  const allRecords = records || [];
  const selectedRecords = selectedIds.map((id) => allRecords.find((r) => r.id === id)).filter(Boolean) as RecordResponseDto[];

  const filteredOptions = allRecords.filter((r) => {
    if (!search) return true;
    return (r.name || r.id).toLowerCase().includes(search.toLowerCase());
  });

  const handleRemove = (idToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (readOnly) return;
    const next = selectedIds.filter((id) => id !== idToRemove);
    onChange?.(multiple ? next : next[0] || null);
  };

  const handleSelectOption = (idToToggle: string) => {
    if (multiple) {
      setDraftSelected((prev) => (prev.includes(idToToggle) ? prev.filter((i) => i !== idToToggle) : [...prev, idToToggle]));
    } else {
      onChange?.(idToToggle);
      setIsModalOpen(false);
    }
  };

  const handleApply = () => {
    onChange?.(draftSelected);
    setIsModalOpen(false);
  };

  const renderChips = () => {
    if (selectedRecords.length === 0) {
      if (readOnly) return <span className="text-ink-muted">—</span>;
      return <span className="text-ink-muted text-xs italic">{t("selectRecord")}</span>;
    }
    return (
      <div className={cn("flex flex-wrap gap-1.5 items-center", className)}>
        {selectedRecords.map((record) => {
          const isDeleted = !!record.deletedAt;
          const chipContent = (
            <span
              key={record.id}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-sm transition-colors duration-150 ${
                isDeleted
                  ? "bg-surface border-stroke-subtle text-ink-muted line-through opacity-60"
                  : "bg-surface border-stroke text-ink-secondary hover:border-stroke hover:text-ink"
              }`}
            >
              <span className="shrink-0 opacity-70">
                {record.icon ? <IconDisplay value={record.icon} size={12} /> : <FileText size={12} />}
              </span>
              <span className="truncate max-w-[320px]">{record.name || t("untitled")}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(record.id, e)}
                  className="shrink-0 p-0.5 rounded-full hover:bg-hover hover:text-error transition-colors duration-150 ml-0.5 -mr-1"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          );

          if (readOnly && !isDeleted) {
            return (
              <Link key={record.id} href={`/record/${record.id}`} className="hover:no-underline" onClick={(e) => e.stopPropagation()}>
                {chipContent}
              </Link>
            );
          }
          return <span key={record.id}>{chipContent}</span>;
        })}
      </div>
    );
  };

  if (readOnly) {
    return renderChips();
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        className="flex min-h-[32px] w-full items-center text-left outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas rounded-lg px-2 -mx-2 hover:bg-surface/50 transition-colors duration-150"
      >
        {renderChips()}
      </div>

      <ModalShell isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("selectRecords")} size="sm">
        <div className="flex flex-col h-[500px]">
          <div className="flex items-center gap-2 border-b border-stroke px-4 py-3">
            <Search size={16} className="text-ink-muted" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              placeholder={t("searchRecords")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && multiple) {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-ink-muted italic">{t("noRecordsFound")}</p>
              </div>
            ) : (
              filteredOptions.map((record) => {
                const isSelected = multiple ? draftSelected.includes(record.id) : selectedIds.includes(record.id);
                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => handleSelectOption(record.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                      isSelected ? "bg-accent/10 text-accent font-medium" : "text-ink-secondary hover:bg-hover hover:text-ink"
                    }`}
                  >
                    {multiple && (
                      <div
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
                          isSelected ? "border-accent bg-accent text-white" : "border-stroke bg-canvas"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    )}
                    <span className="shrink-0 text-ink-muted">
                      {record.icon ? <IconDisplay value={record.icon} size={16} /> : <FileText size={16} />}
                    </span>
                    <span className="truncate text-left flex-1">{record.name || t("untitled")}</span>
                    {!multiple && isSelected && <Check size={16} className="text-accent" />}
                  </button>
                );
              })
            )}
          </div>
          {multiple && (
            <div className="border-t border-stroke p-4 bg-surface/30 flex justify-between items-center gap-4">
              <span className="text-xs text-ink-muted font-medium uppercase tracking-wider">
                {t("selectedCount", { count: draftSelected.length })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-ink-secondary hover:text-ink transition-colors duration-150"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-accent text-white hover:bg-accent-hover text-sm font-bold px-6 py-2 rounded-lg transition-all duration-150 active:scale-95 shadow-md shadow-accent/20"
                >
                  {t("applyChanges")}
                </button>
              </div>
            </div>
          )}
        </div>
      </ModalShell>
    </>
  );
}
