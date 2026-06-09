"use client";

import { useDateFormat } from "@/hooks/format/use-date-format";
import { useState } from "react";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";
import { useDatabaseContext } from "@/context/database-context";
import type { DatePropertyConfig } from "@fixspace/domain";

interface DatePropertyProps {
  value: unknown;
  config: DatePropertyConfig | null;
  readOnly?: boolean;
  onChange?: (value: string | null) => void;
  ghost?: boolean;
}

export function DateProperty({ value, config, readOnly, onChange, ghost }: DatePropertyProps) {
  const { formatDate } = useDateFormat();
  const { relativeDates } = useDatabaseContext();
  const [isOpen, setIsOpen] = useState(false);

  if (readOnly) {
    const date = value ? new Date(value as string) : null;
    if (!date || isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
    return <span className="text-ink-secondary text-sm">{formatDate(date, { dateFormat: config?.format }, relativeDates)}</span>;
  }

  return (
    <>
      <button
        className={ghost ? "w-full text-left text-sm text-ink-secondary truncate cursor-pointer" : "field-input w-full text-left truncate"}
        onClick={() => setIsOpen(true)}
      >
        {value ? formatDate(value as string, { dateFormat: config?.format }) : <span className="text-ink-muted">—</span>}
      </button>
      {isOpen && (
        <DatePickerPopup
          value={value as string | null}
          onChange={(value) => {
            onChange?.(value);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
          anchorEl={document.body}
          includeTime={config?.includeTime}
        />
      )}
    </>
  );
}
