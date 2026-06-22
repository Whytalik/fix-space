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
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        return (
          <button
            key={`${index}-${option.value}`}
            type="button"
            onMouseDown={() => onSelect(option.value)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface transition-colors duration-150 text-left"
          >
            {option.iconElement ? (
              <span className="shrink-0 text-ink-secondary">{option.iconElement}</span>
            ) : option.icon ? (
              <span className="shrink-0 text-ink-secondary">
                <IconDisplay value={option.icon} size={14} />
              </span>
            ) : null}
            <span className="flex-1">
              {option.color ? (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${option.color}20`, color: option.color }}
                >
                  {option.label}
                </span>
              ) : (
                <span className={isSelected ? "text-accent" : "text-ink"}>{option.label}</span>
              )}
            </span>
            {isSelected && <Check size={12} className="shrink-0 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}
