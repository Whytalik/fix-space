"use client";

import { Badge } from "@/components/ui/primitives/display/badge";
import { useTranslations } from "next-intl";
import type { SelectPropertyConfig } from "@fixspace/domain";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useState } from "react";

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

  if (ghost && !isEditing) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <button type="button" className="text-left w-full" onClick={() => setIsEditing(true)}>
        {renderBadges(values)}
      </button>
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
