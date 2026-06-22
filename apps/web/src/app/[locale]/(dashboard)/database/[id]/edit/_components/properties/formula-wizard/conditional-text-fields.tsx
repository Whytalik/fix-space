"use client";

import type { PropertyResponseDto } from "@fixspace/domain";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { FieldPicker } from "./field-picker";

interface ConditionalTextFieldsProps {
  uiState: Record<string, unknown>;
  properties: PropertyResponseDto[];
  onPatch: (key: string, value: unknown) => void;
  t: (key: string) => string;
}

export function ConditionalTextFields({ t, uiState, properties, onPatch }: ConditionalTextFieldsProps) {
  return (
    <>
      <FieldPicker
        label={t("wizard.conditionalTextField")}
        paramKey="field"
        t={t}
        options={properties}
        uiState={uiState}
        onPatch={onPatch}
      />
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.conditionLabel")}</label>
        <Combobox
          value={(uiState.operator as string) ?? "=="}
          onChange={(value) => onPatch("operator", value)}
          options={[
            { value: "==", label: t("customBuilder.equals") },
            { value: "!=", label: t("customBuilder.notEquals") },
            { value: ">", label: t("customBuilder.greaterThan") },
            { value: "<", label: t("customBuilder.lessThan") },
            { value: ">=", label: t("customBuilder.greaterThanEquals") },
            { value: "<=", label: t("customBuilder.lessThanEquals") },
          ]}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.valueLabel")}</label>
        <TextInput
          value={(uiState.value as string) ?? ""}
          onChange={(value) => onPatch("value", value)}
          placeholder={t("customBuilder.valuePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.thenLabel")}</label>
          <TextInput
            value={(uiState.thenLabel as string) ?? ""}
            onChange={(value) => onPatch("thenLabel", value)}
            placeholder={t("customBuilder.thenPlaceholder")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.elseLabel")}</label>
          <TextInput
            value={(uiState.elseLabel as string) ?? ""}
            onChange={(value) => onPatch("elseLabel", value)}
            placeholder={t("customBuilder.elsePlaceholder")}
          />
        </div>
      </div>
    </>
  );
}
