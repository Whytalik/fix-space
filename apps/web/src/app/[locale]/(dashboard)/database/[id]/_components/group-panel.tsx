"use client";

import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useDatabaseContext } from "@/context/database-context";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import type { RecordGroupDto } from "@fixspace/domain";
import { DateGroupGranularity, GroupField, PALETTE_COLOR_VALUES, PropertyType } from "@fixspace/domain/enums";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

const FIELD_OPTIONS: ComboboxOption[] = [
  { value: GroupField.CREATED_AT, label: "createdAt" },
  { value: GroupField.UPDATED_AT, label: "updatedAt" },
  { value: GroupField.PROPERTY, label: "property" },
];

const GRANULARITY_OPTIONS: ComboboxOption[] = [
  { value: DateGroupGranularity.DAY, label: "day" },
  { value: DateGroupGranularity.WEEK, label: "week" },
  { value: DateGroupGranularity.MONTH, label: "month" },
  { value: DateGroupGranularity.YEAR, label: "year" },
];

type GroupPanelProps = {
  grouping: RecordGroupDto | null;
  onChange: (grouping: RecordGroupDto | null) => void;
};

export function GroupPanel({ grouping, onChange }: GroupPanelProps) {
  const { properties, groupedRecords, groupColors, setGroupColor, hiddenGroups, toggleHiddenGroup } = useDatabaseContext();
  const [colorPickerKey, setColorPickerKey] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const t = useTranslations("GroupPanel");

  const propertyOptions: ComboboxOption[] = properties
    .filter((p) => p.type !== PropertyType.RELATION)
    .map((p) => ({ value: p.id, label: p.name }));

  function handleFieldChange(value: string) {
    if (!value) {
      onChange(null);
      return;
    }
    const field = value as GroupField;
    onChange({
      field,
      propertyId: field === GroupField.PROPERTY ? (propertyOptions[0]?.value ?? undefined) : undefined,
      granularity: field === GroupField.CREATED_AT || field === GroupField.UPDATED_AT ? DateGroupGranularity.DAY : undefined,
    });
  }

  function handlePropertyChange(value: string) {
    if (!grouping) return;
    onChange({ ...grouping, propertyId: value || undefined });
  }

  function handleGranularityChange(value: string) {
    if (!grouping) return;
    onChange({ ...grouping, granularity: (value || undefined) as DateGroupGranularity | undefined });
  }

  const showPropertyPicker = grouping?.field === GroupField.PROPERTY;
  const showGranularity = grouping?.field === GroupField.CREATED_AT || grouping?.field === GroupField.UPDATED_AT;

  const visibleGroups = groupedRecords ?? [];

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface rounded-lg border border-stroke min-w-[240px]">
      <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{t("groupBy")}</span>

      <Combobox
        options={[
          { value: "", label: t("noGrouping") },
          ...FIELD_OPTIONS.map((opt) => ({ ...opt, label: t(opt.label as unknown as string) })),
        ]}
        value={grouping?.field ?? ""}
        onChange={handleFieldChange}
        placeholder={t("selectField")}
      />

      {showPropertyPicker && (
        <Combobox
          options={propertyOptions}
          value={grouping?.propertyId ?? ""}
          onChange={handlePropertyChange}
          placeholder={t("selectProperty")}
        />
      )}

      {showGranularity && (
        <Combobox
          options={GRANULARITY_OPTIONS}
          value={grouping?.granularity ?? DateGroupGranularity.DAY}
          onChange={handleGranularityChange}
          placeholder={t("selectGranularity")}
        />
      )}

      {visibleGroups.length > 0 && (
        <>
          <div className="h-px bg-stroke my-1" />
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{t("groups")}</span>
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto scrollbar">
            {visibleGroups.map((g, idx) => {
              const color = groupColors[g.key] ?? PALETTE_COLOR_VALUES[idx % PALETTE_COLOR_VALUES.length];
              const hidden = hiddenGroups.has(g.key);
              const pickerOpen = colorPickerKey === g.key;

              return (
                <div key={g.key} className="flex items-center gap-2 px-1 py-0.5 rounded-md hover:bg-elevated">
                  <span className="shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        if (pickerOpen) {
                          setColorPickerKey(null);
                          setColorPickerAnchor(null);
                        } else {
                          setColorPickerKey(g.key);
                          setColorPickerAnchor(e.currentTarget);
                        }
                      }}
                      className="w-3 h-3 rounded-full block border border-white/20 hover:scale-125 transition-transform"
                      style={{ backgroundColor: color }}
                      title={t("changeColor")}
                    />
                  </span>
                  {pickerOpen && (
                    <ColorPicker
                      value={groupColors[g.key] ?? ""}
                      anchorEl={colorPickerAnchor}
                      onChange={(c) => {
                        setGroupColor(g.key, c);
                        setColorPickerKey(null);
                        setColorPickerAnchor(null);
                      }}
                      onClose={() => {
                        setColorPickerKey(null);
                        setColorPickerAnchor(null);
                      }}
                    />
                  )}

                  <span className={`flex-1 text-xs truncate ${hidden ? "text-ink-muted line-through" : "text-ink-secondary"}`}>
                    {g.label}
                  </span>
                  <span className="text-tiny text-ink-muted shrink-0">{g.records.length}</span>

                  <button
                    type="button"
                    onClick={() => toggleHiddenGroup(g.key)}
                    className="shrink-0 text-ink-muted hover:text-ink transition-colors"
                    title={hidden ? t("showGroup") : t("hideGroup")}
                  >
                    {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
