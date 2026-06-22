"use client";

import { useRef, useState } from "react";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";

interface DateFilterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilterInput({ value, onChange }: DateFilterInputProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-7 px-2 text-left text-xs rounded-md border border-stroke bg-surface text-ink hover:border-accent transition-colors duration-150 truncate"
      >
        {value || <span className="text-ink-muted">Pick date…</span>}
      </button>
      {open && (
        <DatePickerPopup
          value={value || null}
          onChange={(selectedValue) => {
            onChange(selectedValue ?? "");
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          anchorEl={btnRef.current}
        />
      )}
    </>
  );
}
