"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import type { StatusPropertyConfig } from "@fixspace/domain";

export interface StatusPropertyValue {
  label: string;
  color: string;
  icon?: string;
}

export interface StatusPropertyOption {
  name: string;
  color: string;
  icon?: string;
}

type StatusPropertyProps = {
  config?: StatusPropertyConfig | null;
  options?: StatusPropertyOption[];
  value: StatusPropertyValue | null;
  readOnly?: boolean;
  onChange?: (value: StatusPropertyValue | null) => void;
  placeholder?: string;
  size?: "md" | "sm";
};

export function StatusProperty({ config, options, value, readOnly, onChange, placeholder = "None", size = "md" }: StatusPropertyProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (readOnly) {
    if (!value) return null;
    return (
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
    );
  }

  const className =
    size === "sm"
      ? "field-input w-full !py-1 !text-xs flex items-center gap-2 text-left"
      : "field-input w-full flex items-center gap-2 text-left";

  function handleSelect(option: { name: string; color: string; icon?: string }) {
    const isSame = value?.label === option.name;
    onChange?.(isSame ? null : { label: option.name, color: option.color, icon: option.icon });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={className}
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

      {open && (options || config?.categories) && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto scrollbar rounded-lg border border-stroke bg-elevated shadow-md">
          {options
            ? options.map((option) => {
                const isSelected = value?.label === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onMouseDown={() => handleSelect(option)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface transition-colors duration-150 text-ink"
                  >
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
                      style={{ backgroundColor: `${option.color}20`, color: option.color }}
                    >
                      {option.icon && (
                        <span className="leading-none inline-flex shrink-0">
                          <IconDisplay value={option.icon} size={12} />
                        </span>
                      )}
                      {option.name}
                    </span>
                    {isSelected && <Check size={12} className="shrink-0 text-accent" />}
                  </button>
                );
              })
            : config?.categories?.map((category) => (
                <div key={category.category}>
                  <div className="px-3 py-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider bg-canvas-subtle">
                    {category.label || category.category}
                  </div>
                  {category.options.map((option) => {
                    const isSelected = value?.label === option.name;
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onMouseDown={() => handleSelect(option)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface transition-colors duration-150 text-ink"
                      >
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
                          style={{ backgroundColor: `${option.color}20`, color: option.color }}
                        >
                          {option.icon && (
                            <span className="leading-none inline-flex shrink-0">
                              <IconDisplay value={option.icon} size={12} />
                            </span>
                          )}
                          {option.name}
                        </span>
                        {isSelected && <Check size={12} className="shrink-0 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
