"use client";

import { Combobox, type ComboboxOption } from "@/components/ui/primitives/combobox";
import { useDatabaseContext } from "@/context/database-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS: ComboboxOption[] = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "75", label: "75" },
  { value: "100", label: "100" },
];

export function DatabasePagination() {
  const { page, pageSize, total, setPage, setPageSize } = useDatabaseContext();

  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex items-center justify-between gap-4 text-xs text-ink-secondary">
      <span>
        {from}–{to} of {total} records
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-ink-muted">Rows per page:</span>
          <div className="w-20">
            <Combobox
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              placement="top"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded-md border border-stroke hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-ink">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded-md border border-stroke hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
