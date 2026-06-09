"use client";

import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useDatabaseContext } from "@/context/database-context";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import type { RecordGroupDto } from "@fixspace/domain";
import { DateGroupGranularity, GroupField, PALETTE_COLOR_VALUES, PropertyType } from "@fixspace/domain/enums";
import { Eye, EyeOff } from "lucide-react";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
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

export function GroupPanelContent({
  grouping,
  onChange,
}: {
  grouping: RecordGroupDto | null;
  onChange: (grouping: RecordGroupDto | null) => void;
}) {
  const { properties, groupedRecords, groupColors, setGroupColor, hiddenGroups, toggleHiddenGroup, isViewLocked } = useDatabaseContext();
  const [colorPickerKey, setColorPickerKey] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const t = useTranslations("GroupPanel");

  const propertyOptions: ComboboxOption[] = properties
    .filter((property) => property.type !== PropertyType.RELATION)
    .map((property) => ({ value: property.id, label: property.name }));

  function handleFieldChange(value: string) {
    if (isViewLocked) return;
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
    if (!grouping || isViewLocked) return;
    onChange({ ...grouping, propertyId: value || undefined });
  }

  function handleGranularityChange(value: string) {
    if (!grouping || isViewLocked) return;
    onChange({ ...grouping, granularity: (value || undefined) as DateGroupGranularity | undefined });
  }

  const showPropertyPicker = grouping?.field === GroupField.PROPERTY;
  const showGranularity = grouping?.field === GroupField.CREATED_AT || grouping?.field === GroupField.UPDATED_AT;

  const visibleGroups = groupedRecords ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 px-1">
        <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          {t("groupBy")} {isViewLocked && <span className="text-ink-muted">({t("locked") || "Locked"})</span>}
        </span>

        <div className="flex flex-col gap-2">
          <Combobox
            options={[
              { value: "", label: t("noGrouping") },
              ...FIELD_OPTIONS.map((option) => ({ ...option, label: t(option.label as unknown as string) })),
            ]}
            value={grouping?.field ?? ""}
            onChange={handleFieldChange}
            placeholder={t("selectField")}
            disabled={isViewLocked}
          />

          {showPropertyPicker && (
            <Combobox
              options={propertyOptions}
              value={grouping?.propertyId ?? ""}
              onChange={handlePropertyChange}
              placeholder={t("selectProperty")}
              disabled={isViewLocked}
            />
          )}

          {showGranularity && (
            <Combobox
              options={GRANULARITY_OPTIONS.map((option) => ({ ...option, label: t(option.label as unknown as string) }))}
              value={grouping?.granularity ?? DateGroupGranularity.DAY}
              onChange={handleGranularityChange}
              placeholder={t("selectGranularity")}
              disabled={isViewLocked}
            />
          )}
        </div>
      </div>

      {visibleGroups.length > 0 && (
        <>
          <div className="h-px bg-stroke" />
          <div className="flex flex-col gap-3 px-1">
            <span className="text-xs font-medium text-ink-muted">{t("groups")}</span>
            <div className="flex flex-col gap-1">
              {visibleGroups.map((group, index) => {
                const color = groupColors[group.key] ?? PALETTE_COLOR_VALUES[index % PALETTE_COLOR_VALUES.length];
                const hidden = hiddenGroups.has(group.key);
                const pickerOpen = colorPickerKey === group.key;

                return (
                  <div
                    key={group.key}
                    className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-canvas-subtle transition-colors duration-150 border border-transparent hover:border-stroke"
                  >
                    <span className="shrink-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (pickerOpen) {
                            setColorPickerKey(null);
                            setColorPickerAnchor(null);
                          } else {
                            setColorPickerKey(group.key);
                            setColorPickerAnchor(e.currentTarget);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded-full block border border-white/20 hover:scale-125 transition-transform duration-150 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={t("changeColor")}
                      />
                    </span>
                    {pickerOpen && (
                      <ColorPicker
                        value={groupColors[group.key] ?? ""}
                        anchorEl={colorPickerAnchor}
                        onChange={(color) => {
                          setGroupColor(group.key, color);
                          setColorPickerKey(null);
                          setColorPickerAnchor(null);
                        }}
                        onClose={() => {
                          setColorPickerKey(null);
                          setColorPickerAnchor(null);
                        }}
                      />
                    )}

                    <span
                      className={`flex-1 text-sm font-medium truncate ${hidden ? "text-ink-muted line-through opacity-50" : "text-ink-secondary"}`}
                    >
                      {group.label}
                    </span>
                    <span className="text-xs font-medium text-ink-muted shrink-0 bg-canvas-subtle px-1.5 py-0.5 rounded-md group-hover:bg-surface transition-colors duration-150">
                      {group.records.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleHiddenGroup(group.key)}
                      className="shrink-0 text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded-md hover:bg-surface"
                      title={hidden ? t("showGroup") : t("hideGroup")}
                    >
                      {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type GroupPanelProps = {
  grouping: RecordGroupDto | null;
  onChange: (grouping: RecordGroupDto | null) => void;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
};

export function GroupPanel({ grouping, onChange, anchorEl, onClose }: GroupPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFloatingPanel(containerRef, onClose, anchorEl, "[data-color-picker]");

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
    zIndex: 9999,
  };

  return createPortal(
    <div
      ref={containerRef}
      style={panelStyle}
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 min-w-[240px] flex flex-col gap-2 max-h-[70vh] overflow-y-auto scrollbar"
    >
      <GroupPanelContent grouping={grouping} onChange={onChange} />
    </div>,
    document.body,
  );
}
