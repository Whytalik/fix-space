"use client";

import { useDateFormat } from "@/hooks/format/use-date-format";
import { useState, useRef } from "react";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";
import { DateInput } from "@/components/ui/primitives/inputs/date-input";
import { useDatabaseContext } from "@/context/database-context";
import type { DatePropertyConfig } from "@fixspace/domain";
import dayjs from "dayjs";

interface DatePropertyProps {
  value: unknown;
  config: DatePropertyConfig | null;
  readOnly?: boolean;
  onChange?: (value: string | null) => void;
  ghost?: boolean;
}

export function DateProperty({ value, config, readOnly, onChange, ghost }: DatePropertyProps) {
  const { formatDate, settings } = useDateFormat();
  const { relativeDates } = useDatabaseContext();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (readOnly) {
    const date = value ? new Date(value as string) : null;
    if (!date || isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
    return <span className="text-ink-secondary text-sm">{formatDate(date, { dateFormat: config?.format }, relativeDates)}</span>;
  }

  if (ghost) {
    return (
      <>
        <button
          ref={buttonRef}
          className="w-full text-left text-sm text-ink-secondary truncate cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {value ? formatDate(value as string, { dateFormat: config?.format }) : <span className="text-ink-muted">—</span>}
        </button>
        {isOpen && (
          <DatePickerPopup
            value={value as string | null}
            onChange={(v) => {
              onChange?.(v);
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
            anchorEl={buttonRef.current}
            includeTime={config?.includeTime}
          />
        )}
      </>
    );
  }

  const raw = value ? String(value) : "";
  let inputValue = "";
  if (raw) {
    const userTimezone = settings.timezone || "UTC";
    const d = dayjs.utc(raw).tz(userTimezone);
    inputValue = config?.includeTime ? d.format("YYYY-MM-DDTHH:mm") : d.format("YYYY-MM-DD");
  }

  const handleInputChange = (v: string | null) => {
    if (!v) {
      onChange?.(null);
      return;
    }
    const userTimezone = settings.timezone || "UTC";
    const isoString = dayjs.tz(v, userTimezone).utc().toISOString();
    onChange?.(isoString);
  };

  return <DateInput value={inputValue} onChange={handleInputChange} includeTime={config?.includeTime ?? false} />;
}
