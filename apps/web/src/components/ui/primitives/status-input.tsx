"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export interface StatusOption {
  name: string;
  color: string;
  icon?: string;
}

export interface StatusValue {
  label: string;
  color: string;
  icon?: string;
}

type StatusInputProps = {
  options: StatusOption[];
  value: StatusValue | null;
  onChange: (value: StatusValue | null) => void;
  placeholder?: string;
  size?: "md" | "sm";
};

export function StatusInput({ options, value, onChange, placeholder = "— None —", size = "md" }: StatusInputProps) {
  const cls =
    size === "sm"
      ? "field-input w-full !py-1 !text-xs flex items-center gap-2 text-left"
      : "field-input w-full flex items-center gap-2 text-left";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleSelect(opt: StatusOption) {
    const isSame = value?.label === opt.name;
    onChange(isSame ? null : { label: opt.name, color: opt.color, icon: opt.icon });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cls}
      >
        {value ? (
          <span
            className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
            style={{ backgroundColor: `${value.color}20`, color: value.color }}
          >
            {value.icon && (
              <span className="leading-none inline-flex shrink-0">
                <IconDisplay value={value.icon} size={12} />
              </span>
            )}
            {value.label}
          </span>
        ) : (
          <span className="flex-1 text-sm text-ink-muted">{placeholder}</span>
        )}
        <ChevronDown size={13} className="text-ink-muted shrink-0" />
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto scrollbar rounded-lg border border-stroke bg-elevated shadow-md">
          {options.map((opt) => {
            const isSelected = value?.label === opt.name;
            return (
              <button
                key={opt.name}
                type="button"
                onMouseDown={() => handleSelect(opt)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface transition-colors text-ink"
              >
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
                  style={{ backgroundColor: `${opt.color}20`, color: opt.color }}
                >
                  {opt.icon && (
                    <span className="leading-none inline-flex shrink-0">
                      <IconDisplay value={opt.icon} size={12} />
                    </span>
                  )}
                  {opt.name}
                </span>
                {isSelected && <Check size={12} className="shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
