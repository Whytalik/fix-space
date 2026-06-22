"use client";

import type { PropertyResponseDto } from "@fixspace/domain";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";

interface FieldPickerProps {
  label: string;
  paramKey: string;
  options: PropertyResponseDto[];
  uiState: Record<string, unknown>;
  onPatch: (key: string, value: unknown) => void;
  t: (key: string) => string;
}

export function FieldPicker({ label, paramKey, options, uiState, onPatch, t }: FieldPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="type-form-label">{label}</label>
      <Combobox
        options={options.map((property) => ({ label: property.name, value: property.id }))}
        value={(uiState[paramKey] as string) ?? ""}
        onChange={(value) => onPatch(paramKey, value)}
        placeholder={t("wizard.fieldPickerPlaceholder")}
      />
    </div>
  );
}
