"use client";

import { Check } from "lucide-react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { ComboboxOption } from "./combobox";

type ComboboxDropdownProps = {
  options: ComboboxOption[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  placement?: "top" | "bottom";
};

export function ComboboxDropdown({ options, onSelect, selectedValue, placement = "bottom" }: ComboboxDropdownProps) {
  const positionClass = placement === "top" ? "bottom-full mb-1" : "top-full mt-1";
  return (
    <div
      className={`absolute ${positionClass} left-0 right-0 z-10 max-h-48 overflow-y-auto scrollbar rounded-lg border border-stroke bg-elevated shadow-md`}
    >
      {options.map((opt, index) => {
        const isSelected = opt.value === selectedValue;
        return (
          <button
            key={`${index}-${opt.value}`}
            type="button"
            onMouseDown={() => onSelect(opt.value)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface transition-colors text-left"
          >
            <span className="flex-1">
              {opt.color ? (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${opt.color}20`, color: opt.color }}
                >
                  {opt.label}
                </span>
              ) : opt.icon ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-elevated text-ink-secondary">
                  <IconDisplay value={opt.icon} size={12} />
                  {opt.label}
                </span>
              ) : (
                <span className={isSelected ? "text-accent" : "text-ink"}>{opt.label}</span>
              )}
            </span>
            {isSelected && <Check size={12} className="shrink-0 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}
