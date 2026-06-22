"use client";

import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import type { PropertyResponseDto, VisibilityConditionDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import { Eye, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface VisibilityConditionEditorProps {
  value: VisibilityConditionDto | null | undefined;
  properties: PropertyResponseDto[];
  currentPropertyId?: string;
  onChange: (value: VisibilityConditionDto | null) => void;
}

const NO_VALUE_OPERATORS: VisibilityConditionDto["operator"][] = ["EXISTS", "NOT_EXISTS"];

function getSelectOptions(property: PropertyResponseDto): string[] {
  const config = property.config as Record<string, unknown> | undefined;
  if (!config) return [];
  if (property.type === PropertyType.SELECT) {
    const cats = config.categories as { options: { value: string }[] }[] | undefined;
    return cats?.flatMap((c) => c.options.map((o) => o.value)) ?? [];
  }
  if (property.type === PropertyType.STATUS) {
    const cats = config.categories as { options: { name: string }[] }[] | undefined;
    return cats?.flatMap((c) => c.options.map((o) => o.name)) ?? [];
  }
  return [];
}

const ELIGIBLE_TYPES: PropertyType[] = [
  PropertyType.TEXT,
  PropertyType.SELECT,
  PropertyType.STATUS,
  PropertyType.CHECKBOX,
  PropertyType.NUMBER,
  PropertyType.RATING,
];

export function VisibilityConditionEditor({ value, properties, currentPropertyId, onChange }: VisibilityConditionEditorProps) {
  const t = useTranslations("PropertyForm");

  const eligible = properties.filter((p) => p.id !== currentPropertyId && ELIGIBLE_TYPES.includes(p.type as PropertyType));
  const depProperty = eligible.find((p) => p.name === value?.dependsOnPropertyName) ?? null;
  const selectOptions = depProperty ? getSelectOptions(depProperty) : [];
  const needsValue = !NO_VALUE_OPERATORS.includes(value?.operator as VisibilityConditionDto["operator"]);

  const operators = [
    { value: "EQUALS", label: t("opEquals") },
    { value: "NOT_EQUALS", label: t("opNotEquals") },
    { value: "CONTAINS", label: t("opContains") },
    { value: "EXISTS", label: t("opExists") },
    { value: "NOT_EXISTS", label: t("opNotExists") },
    { value: "IN", label: t("opIn") },
    { value: "NOT_IN", label: t("opNotIn") },
  ];

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange({ dependsOnPropertyName: "", operator: "EQUALS", value: "" })}
        className="flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors duration-150"
      >
        <Eye size={14} />
        <span>{t("addVisibilityCondition")}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="type-hint">{t("visibilityWhen")}</p>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Combobox
            options={eligible.map((p) => ({ value: p.name, label: p.name }))}
            value={value.dependsOnPropertyName}
            onChange={(name) =>
              onChange({
                dependsOnPropertyName: name,
                operator: "EQUALS",
                value: "",
              })
            }
            placeholder={t("visibilityPropertyPlaceholder")}
          />
        </div>

        <div className="shrink-0 w-36">
          <Combobox
            options={operators}
            value={value.operator}
            onChange={(selectedOperator) => {
              const operator = selectedOperator as VisibilityConditionDto["operator"];
              onChange({
                ...value,
                operator,
                value: NO_VALUE_OPERATORS.includes(operator) ? undefined : value.value,
              });
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 text-ink-muted hover:text-error transition-colors duration-150"
          aria-label={t("removeCondition")}
        >
          <X size={14} />
        </button>
      </div>

      {needsValue && (
        <div>
          {selectOptions.length > 0 ? (
            <Combobox
              options={selectOptions.map((o) => ({ value: o, label: o }))}
              value={(value.value as string) ?? ""}
              onChange={(v) => onChange({ ...value, value: v })}
              placeholder={t("visibilityValuePlaceholder")}
            />
          ) : (
            <TextInput
              value={(value.value as string) ?? ""}
              onChange={(v) => onChange({ ...value, value: v })}
              placeholder={t("visibilityValuePlaceholder")}
            />
          )}
        </div>
      )}
    </div>
  );
}
