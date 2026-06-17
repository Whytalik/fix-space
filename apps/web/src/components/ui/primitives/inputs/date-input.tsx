"use client";

import { useState, useRef, useMemo } from "react";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";
import { cn } from "@/utils/ui/cn";
import { useDateFormat } from "@/hooks/format/use-date-format";
import dayjs from "dayjs";

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
};

export function DateInput({ value, onChange, includeTime, disabled, size = "md" }: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatDate, formatDateTime } = useDateFormat();

  const handleValueChange = (isoValue: string | null) => {
    if (!isoValue) {
      onChange("");
    } else {
      const d = dayjs(isoValue);
      const formatted = includeTime ? d.format("YYYY-MM-DDTHH:mm") : d.format("YYYY-MM-DD");
      onChange(formatted);
    }
  };

  const displayValue = useMemo(() => {
    if (!value) return "";
    return includeTime ? formatDateTime(value) : formatDate(value);
  }, [value, includeTime, formatDate, formatDateTime]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={displayValue}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn("field-input w-full cursor-pointer", size === "sm" && "!py-1 !text-xs")}
        placeholder={includeTime ? "Select date & time…" : "Select date…"}
      />
      {isOpen && (
        <DatePickerPopup
          value={value || null}
          onChange={handleValueChange}
          onClose={() => setIsOpen(false)}
          anchorEl={inputRef.current}
          includeTime={includeTime}
        />
      )}
    </div>
  );
}
