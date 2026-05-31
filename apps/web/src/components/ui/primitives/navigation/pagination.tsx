"use client";
import { Combobox, type ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  rowsPerPageLabel?: string;
  recordsOfLabel?: (from: number, to: number, total: number) => string;
}

const PAGE_SIZE_OPTIONS: ComboboxOption[] = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "75", label: "75" },
  { value: "100", label: "100" },
];

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  rowsPerPageLabel = "Rows per page:",
  recordsOfLabel = (from, to, total) => `${from}–${to} of ${total}`,
}: PaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 text-xs text-ink-secondary">
      <span className="font-mono tabular-nums">{recordsOfLabel(from, to, total)}</span>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-ink-muted">{rowsPerPageLabel}</span>
            <div className="w-16">
              <Combobox
                options={PAGE_SIZE_OPTIONS}
                value={String(pageSize)}
                onChange={(v) => onPageSizeChange(Number(v))}
                placement="top"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded-md border border-stroke bg-canvas hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} className="text-ink-secondary" />
          </button>
          <span className="px-2 text-ink font-mono tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded-md border border-stroke bg-canvas hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={14} className="text-ink-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
