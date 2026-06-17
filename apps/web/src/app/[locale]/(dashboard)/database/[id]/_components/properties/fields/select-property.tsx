"use client";

import { Badge } from "@/components/ui/primitives/display/badge";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SelectPropertyConfig } from "@fixspace/domain";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useState } from "react";
import { createPortal } from "react-dom";

interface SelectPropertyProps {
  config: unknown;
  value: unknown;
  readOnly?: boolean;
  onChange?: (value: string | string[]) => void;
  ghost?: boolean;
}

export function SelectProperty({ config, value, readOnly, onChange, ghost }: SelectPropertyProps) {
  const t = useTranslations("PropertyInput");
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const parsedConfig = config as SelectPropertyConfig | null;
  const isMultiSelect = parsedConfig?.isMultiSelect ?? false;

  const options: ComboboxOption[] =
    parsedConfig?.categories?.flatMap((category) =>
      category.options.map((option) => ({
        value: option.value,
        label: option.value,
        color: option.color,
        icon: option.icon,
      })),
    ) ?? [];

  function renderBadges(values: unknown[]) {
    if (values.length === 0) return <span className="text-ink-muted text-sm">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {values.map((item) => {
          const option = options.find((o) => o.value === item);
          return (
            <Badge key={String(item)} color={option?.color} variant={option?.color ? undefined : "neutral"}>
              {option?.label ?? String(item)}
            </Badge>
          );
        })}
      </div>
    );
  }

  if (readOnly) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return renderBadges(values);
  }

  if (ghost) {
    const values = Array.isArray(value) ? value : value ? [value] : [];

    function openDropdown(e: React.MouseEvent<HTMLButtonElement>) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 160) });
      setIsEditing(true);
    }

    function handleSelect(optionValue: string) {
      if (isMultiSelect) {
        const current = Array.isArray(value) ? (value as string[]) : [];
        const next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
        onChange?.(next);
      } else {
        onChange?.(optionValue);
        setIsEditing(false);
        setDropdownPos(null);
      }
    }

    return (
      <>
        <button type="button" className="text-left w-full" onClick={openDropdown}>
          {renderBadges(values)}
        </button>
        {isEditing &&
          dropdownPos &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => {
                  setIsEditing(false);
                  setDropdownPos(null);
                }}
              />
              <div style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                <div className="bg-elevated border border-stroke rounded-lg shadow-md overflow-y-auto max-h-64 scrollbar">
                  {options.map((option) => {
                    const isSelected = isMultiSelect
                      ? Array.isArray(value) && (value as string[]).includes(option.value)
                      : value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onMouseDown={() => handleSelect(option.value)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface transition-colors duration-150"
                      >
                        <Badge color={option.color} variant={option.color ? undefined : "neutral"}>
                          {option.icon && (
                            <span className="mr-1 inline-flex">
                              <IconDisplay value={option.icon} size={12} />
                            </span>
                          )}
                          {option.label}
                        </Badge>
                        {isSelected && <Check size={12} className="shrink-0 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body,
          )}
      </>
    );
  }

  function handleChange(val: string | string[]) {
    onChange?.(val);
    if (!isMultiSelect) setIsEditing(false);
  }

  if (isMultiSelect) {
    return (
      <div onBlur={() => setTimeout(() => setIsEditing(false), 200)}>
        <Combobox
          multiple={true}
          options={options}
          value={(Array.isArray(value) ? value : []) as string[]}
          onChange={(selected) => handleChange(selected as string[])}
          placeholder={t("select")}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div onBlur={() => setTimeout(() => setIsEditing(false), 200)}>
      <Combobox
        options={options}
        value={String(value ?? "")}
        onChange={(selected) => handleChange(selected as string)}
        placeholder={t("select")}
        size="sm"
      />
    </div>
  );
}
