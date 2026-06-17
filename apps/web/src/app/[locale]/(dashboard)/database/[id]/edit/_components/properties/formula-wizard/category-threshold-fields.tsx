"use client";

import type { PropertyResponseDto } from "@fixspace/domain";
import { Plus, Trash2 } from "lucide-react";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";

interface CategoryThresholdFieldsProps {
  uiState: Record<string, unknown>;
  numberProps: PropertyResponseDto[];
  onRecompile: (newUiState: Record<string, unknown>) => void;
  t: (key: string) => string;
}

export function CategoryThresholdFields({ t, uiState, numberProps, onRecompile }: CategoryThresholdFieldsProps) {
  const thresholds = (uiState.thresholds ?? []) as Array<{ threshold: string; label: string }>;

  function patchThresholds(nextThresholds: Array<{ threshold: string; label: string }>) {
    onRecompile({ ...uiState, thresholds: nextThresholds });
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.categoryThresholdField")}</label>
        <Combobox
          options={numberProps.map((property) => ({ label: property.name, value: property.id }))}
          value={(uiState.field as string) ?? ""}
          onChange={(value) => onRecompile({ ...uiState, field: value })}
          placeholder={t("wizard.fieldPickerPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="type-form-label">{t("wizard.thresholdsLabel")}</p>
        {thresholds.map((rowItem, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="number"
              className="field-input w-24"
              placeholder={t("wizard.valueLabel")}
              value={rowItem.threshold}
              onChange={(event) =>
                patchThresholds(
                  thresholds.map((innerRow, compareIndex) =>
                    compareIndex === index ? { ...innerRow, threshold: event.target.value } : innerRow,
                  ),
                )
              }
            />
            <span className="type-hint shrink-0">→</span>
            <input
              type="text"
              className="field-input flex-1"
              placeholder={t("wizard.valueLabel")}
              value={rowItem.label}
              onChange={(event) =>
                patchThresholds(
                  thresholds.map((innerRow, compareIndex) =>
                    compareIndex === index ? { ...innerRow, label: event.target.value } : innerRow,
                  ),
                )
              }
            />
            <button
              type="button"
              onClick={() => patchThresholds(thresholds.filter((unusedRow, compareIndex) => compareIndex !== index))}
              className="text-ink-muted hover:text-error transition-colors duration-150"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {thresholds.length < 3 && (
          <button
            type="button"
            onClick={() => patchThresholds([...thresholds, { threshold: "", label: "" }])}
            className="flex items-center gap-1.5 type-hint hover:text-ink-secondary transition-colors duration-150"
          >
            <Plus size={12} />
            {t("wizard.addThreshold")}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.elseLabelCategory")}</label>
        <input
          type="text"
          className="field-input w-full"
          value={(uiState.elseLabel as string) ?? ""}
          onChange={(event) => onRecompile({ ...uiState, elseLabel: event.target.value })}
          placeholder={t("customBuilder.elsePlaceholder")}
        />
      </div>
    </>
  );
}
