"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { RecordFilterDto, FilterOperator } from "@fixspace/domain";
import { FilterField, FilterLogic, PropertyType } from "@fixspace/domain";

import { useDatabaseContext } from "@/context/database-context";
import { PropertyIcon } from "../properties/ui/property-icon";
import { PropertyHint } from "../properties/ui/property-hint";
import { StatusProperty } from "../properties/fields/status-property";
import type { StatusPropertyOption } from "../properties/fields/status-property";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { DateFilterInput } from "./date-filter-input";
import { NO_VALUE_OPERATORS, MULTI_VALUE_OPERATORS, getOperators, defaultOperator, META_OPTIONS } from "./utils";

interface FilterRowProps {
  filter: RecordFilterDto;
  index: number;
  onUpdate: (index: number, patch: Partial<RecordFilterDto>) => void;
  onRemove: (index: number) => void;
  filterLogic: FilterLogic;
  onToggleLogic: () => void;
}

export function FilterRow({ filter, index, onUpdate, onRemove, filterLogic, onToggleLogic }: FilterRowProps) {
  const { properties } = useDatabaseContext();
  const t = useTranslations("FilterPanel");

  const isMeta = filter.field === FilterField.CREATED_AT || filter.field === FilterField.UPDATED_AT;
  const property = isMeta ? undefined : properties.find((prop) => prop.id === filter.propertyId);
  const propType = isMeta ? PropertyType.DATE : ((property?.type as PropertyType) ?? PropertyType.TEXT);
  const operators = getOperators(propType).map((operator) => ({
    ...operator,
    label: t(operator.label),
  }));
  const noValue = NO_VALUE_OPERATORS.has(filter.operator);
  const isMulti = MULTI_VALUE_OPERATORS.has(filter.operator);

  const propertyOptions: ComboboxOption[] = properties.map((prop) => ({
    value: `prop:${prop.id}`,
    label: prop.name,
    iconElement: <PropertyIcon type={prop.type} size={14} />,
  }));

  const allOptions: ComboboxOption[] = [...META_OPTIONS.map((option) => ({ ...option, label: t(option.label) })), ...propertyOptions];

  function selectedOptionValue(): string {
    if (filter.field === FilterField.CREATED_AT) return `meta:${FilterField.CREATED_AT}`;
    if (filter.field === FilterField.UPDATED_AT) return `meta:${FilterField.UPDATED_AT}`;
    return filter.propertyId ? `prop:${filter.propertyId}` : "";
  }

  function handleOptionChange(value: string) {
    if (value.startsWith("meta:")) {
      const field = value.slice(5) as FilterField;
      onUpdate(index, {
        field,
        propertyId: undefined,
        operator: defaultOperator(PropertyType.DATE),
        value: undefined,
        values: undefined,
      });
    } else {
      const propId = value.slice(5);
      const newProp = properties.find((prop) => prop.id === propId);
      const newType = (newProp?.type as PropertyType) ?? PropertyType.TEXT;
      onUpdate(index, {
        field: undefined,
        propertyId: propId,
        operator: defaultOperator(newType),
        value: undefined,
        values: undefined,
      });
    }
  }

  const selectOptions: ComboboxOption[] =
    propType === PropertyType.SELECT
      ? (
          (property?.config as { categories?: Array<{ options: Array<{ value: string }> }> } | null)?.categories?.flatMap(
            (category) => category.options,
          ) ?? []
        ).map((option) => ({ value: option.value, label: option.value }))
      : propType === PropertyType.STATUS
        ? (
            (
              property?.config as {
                categories?: Array<{ options: Array<{ name: string }> }>;
              } | null
            )?.categories?.flatMap((category) => category.options.map((option) => option.name)) ?? []
          ).map((option) => ({ value: option, label: option }))
        : [];

  const statusOptions: StatusPropertyOption[] =
    propType === PropertyType.STATUS
      ? ((property?.config as { categories?: Array<{ options: Array<{ name: string; color: string }> }> } | null)?.categories?.flatMap(
          (category) => category.options,
        ) ?? [])
      : [];

  return (
    <div className="group relative flex items-center gap-2 p-1.5 rounded-lg border border-stroke bg-canvas-subtle/50 hover:bg-canvas-subtle hover:border-stroke-strong transition-colors duration-150">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-10 shrink-0 flex justify-center">
          {index > 0 ? (
            <button
              type="button"
              onClick={onToggleLogic}
              className="px-1.5 py-0.5 rounded-md text-xs font-bold border transition-all duration-150 bg-surface border-stroke text-ink-secondary hover:border-accent hover:text-accent shadow-sm"
            >
              {filterLogic === FilterLogic.AND ? "AND" : "OR"}
            </button>
          ) : (
            <div className="h-6 w-px bg-stroke/50" />
          )}
        </div>

        <div className="flex items-center gap-2 w-44 shrink-0">
          <div className="flex-1 min-w-0">
            <Combobox options={allOptions} value={selectedOptionValue()} onChange={handleOptionChange} size="sm" />
          </div>
          {property?.hint && <PropertyHint hint={property.hint} />}
        </div>

        <div className="w-48 shrink-0">
          <Combobox
            options={operators}
            value={filter.operator}
            size="sm"
            onChange={(operator) => {
              onUpdate(index, {
                operator: operator as FilterOperator,
                value: NO_VALUE_OPERATORS.has(operator as FilterOperator) ? undefined : filter.value,
                values: MULTI_VALUE_OPERATORS.has(operator as FilterOperator) ? (filter.values ?? []) : undefined,
              });
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {!noValue && isMulti && (
            <Combobox
              options={selectOptions}
              value={filter.values ?? []}
              onChange={(value) => onUpdate(index, { values: value })}
              multiple
              size="sm"
              placeholder={t("pickValues")}
            />
          )}

          {!noValue && !isMulti && propType === PropertyType.STATUS && (
            <StatusProperty
              options={statusOptions}
              value={
                filter.value != null
                  ? statusOptions.find((option) => option.name === String(filter.value))
                    ? {
                        label: String(filter.value),
                        color: statusOptions.find((option) => option.name === String(filter.value))!.color,
                      }
                    : null
                  : null
              }
              onChange={(value) => onUpdate(index, { value: value?.label ?? undefined })}
              placeholder={t("pickStatus")}
              size="sm"
            />
          )}

          {!noValue && !isMulti && propType === PropertyType.SELECT && (
            <Combobox
              options={selectOptions}
              value={typeof filter.value === "string" ? filter.value : ""}
              onChange={(value) => onUpdate(index, { value: value || undefined })}
              nullable
              size="sm"
              placeholder={t("pickOption")}
            />
          )}

          {!noValue && !isMulti && propType === PropertyType.NUMBER && (
            <NumberInput
              value={filter.value != null ? Number(filter.value) : null}
              onChange={(value) => onUpdate(index, { value: value ?? undefined })}
              placeholder={t("value")}
              size="sm"
            />
          )}

          {!noValue && !isMulti && propType === PropertyType.DATE && (
            <DateFilterInput
              value={typeof filter.value === "string" ? filter.value : ""}
              onChange={(value) => onUpdate(index, { value: value || undefined })}
            />
          )}

          {!noValue && !isMulti && propType === PropertyType.TEXT && (
            <TextInput
              value={typeof filter.value === "string" ? filter.value : ""}
              onChange={(value) => onUpdate(index, { value: value || undefined })}
              placeholder={t("value")}
              size="sm"
            />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-1.5 rounded-lg text-ink-muted hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
