"use client";

import { PropertyIcon } from "@/features/property/property-icon";
import { Button } from "@/components/ui/primitives/actions/button";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useState } from "react";
import { DateInput } from "@/components/ui/primitives/inputs/date-input";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { StatusPropertyInput } from "@/features/property/inputs/status-property-input";
import type { StatusPropertyOption } from "@/features/property/inputs/status-property-input";
import { useDatabaseContext } from "@/context/database-context";
import type { RecordFilterDto } from "@fixspace/domain";
import { FilterField, FilterLogic, FilterOperator, OPERATORS_BY_PROPERTY_TYPE, PropertyType } from "@fixspace/domain/enums";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const NO_VALUE_OPERATORS = new Set([
  FilterOperator.IS_EMPTY,
  FilterOperator.IS_NOT_EMPTY,
  FilterOperator.IS_CHECKED,
  FilterOperator.IS_UNCHECKED,
]);

const MULTI_VALUE_OPERATORS = new Set([FilterOperator.IN, FilterOperator.NOT_IN]);

type OperatorDef = { value: FilterOperator; label: string };

function getOperatorLabel(operator: FilterOperator, type: PropertyType): string {
  if (type === PropertyType.DATE && operator === FilterOperator.EQUALS) return "operators.on";
  if (type === PropertyType.SELECT || type === PropertyType.STATUS) {
    if (operator === FilterOperator.EQUALS) return "operators.isExactly";
    if (operator === FilterOperator.NOT_EQUALS) return "operators.isNotExactly";
    if (operator === FilterOperator.IN) return "operators.isOneOf";
    if (operator === FilterOperator.NOT_IN) return "operators.isNotOneOf";
  }
  return `operators.${operator}`;
}

function getOperators(type: PropertyType): OperatorDef[] {
  const operators = OPERATORS_BY_PROPERTY_TYPE[type] || OPERATORS_BY_PROPERTY_TYPE[PropertyType.TEXT] || [];
  return operators.map((operator) => ({
    value: operator,
    label: getOperatorLabel(operator, type),
  }));
}

function defaultOperator(type: PropertyType): FilterOperator {
  return getOperators(type)[0]?.value ?? FilterOperator.EQUALS;
}

interface FilterRowProps {
  filter: RecordFilterDto;
  index: number;
  onUpdate: (index: number, patch: Partial<RecordFilterDto>) => void;
  onRemove: (index: number) => void;
  filterLogic: FilterLogic;
  onToggleLogic: () => void;
}

const META_OPTIONS: ComboboxOption[] = [
  { value: `meta:${FilterField.CREATED_AT}`, label: "createdAt" },
  { value: `meta:${FilterField.UPDATED_AT}`, label: "updatedAt" },
];

function FilterRow({ filter, index, onUpdate, onRemove, filterLogic, onToggleLogic }: FilterRowProps) {
  const { properties } = useDatabaseContext();
  const t = useTranslations("FilterPanel");

  const isMeta = filter.field === FilterField.CREATED_AT || filter.field === FilterField.UPDATED_AT;
  const property = isMeta ? undefined : properties.find((property) => property.id === filter.propertyId);
  const propType = isMeta ? PropertyType.DATE : ((property?.type as PropertyType) ?? PropertyType.TEXT);
  const operators = getOperators(propType).map((operator) => ({ ...operator, label: t(operator.label as unknown as string) }));
  const noValue = NO_VALUE_OPERATORS.has(filter.operator);
  const isMulti = MULTI_VALUE_OPERATORS.has(filter.operator);

  const propertyOptions: ComboboxOption[] = properties.map((property) => ({ value: `prop:${property.id}`, label: property.name }));
  const allOptions: ComboboxOption[] = [
    ...META_OPTIONS.map((option) => ({ ...option, label: t(option.label as unknown as string) })),
    ...propertyOptions,
  ];

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
      const newProp = properties.find((property) => property.id === propId);
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
    <div className="flex items-center gap-1.5">
      {index > 0 ? (
        <button
          type="button"
          onClick={onToggleLogic}
          className="w-9 shrink-0 px-1.5 py-0.5 rounded-md text-xs border transition-colors bg-surface border-stroke text-ink-secondary hover:border-ink-muted hover:text-ink text-center"
        >
          {filterLogic === FilterLogic.AND ? "AND" : "OR"}
        </button>
      ) : (
        <span className="w-9 shrink-0" />
      )}

      <div className="flex items-center gap-1 w-40 shrink-0">
        {property && (
          <span className="text-ink-muted shrink-0">
            <PropertyIcon type={property.type} size={13} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <Combobox options={allOptions} value={selectedOptionValue()} onChange={handleOptionChange} size="sm" />
        </div>
      </div>

      <div className="w-32 shrink-0">
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

      {!noValue && isMulti && (
        <div className="flex-1 min-w-0">
          <Combobox
            options={selectOptions}
            value={filter.values ?? []}
            onChange={(value) => onUpdate(index, { values: value })}
            multiple
            size="sm"
            placeholder={t("pickValues")}
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.STATUS && (
        <div className="flex-1 min-w-0">
          <StatusPropertyInput
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
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.SELECT && (
        <div className="flex-1 min-w-0">
          <Combobox
            options={selectOptions}
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(value) => onUpdate(index, { value: value || undefined })}
            nullable
            size="sm"
            placeholder={t("pickOption")}
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.NUMBER && (
        <div className="w-28">
          <NumberInput
            value={filter.value != null ? Number(filter.value) : null}
            onChange={(value) => onUpdate(index, { value: value ?? undefined })}
            placeholder={t("value")}
            size="sm"
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.DATE && (
        <div className="flex-1 min-w-0">
          <DateInput
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(value) => onUpdate(index, { value: value || undefined })}
            size="sm"
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.TEXT && (
        <div className="flex-1 min-w-0">
          <TextInput
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(v) => onUpdate(index, { value: v || undefined })}
            placeholder={t("value")}
            size="sm"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-1 rounded text-ink-muted hover:text-error hover:bg-error/10 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function FilterPanel() {
  const { properties, filters, setFilters, filterLogic, setFilterLogic } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const t = useTranslations("FilterPanel");

  const propertyOptions: ComboboxOption[] = properties.map((property) => ({ value: `prop:${property.id}`, label: property.name }));
  const allOptions: ComboboxOption[] = [
    ...META_OPTIONS.map((option) => ({ ...option, label: t(option.label as unknown as string) })),
    ...propertyOptions,
  ];

  function confirmPendingFilter(value: string) {
    if (!value) return;
    let newFilter: RecordFilterDto;
    if (value.startsWith("meta:")) {
      const field = value.slice(5) as FilterField;
      newFilter = {
        field,
        propertyId: undefined as unknown as string,
        operator: defaultOperator(PropertyType.DATE),
        value: undefined,
        values: undefined,
      };
    } else {
      const propId = value.slice(5);
      const prop = properties.find((property) => property.id === propId);
      const propType = (prop?.type as PropertyType) ?? PropertyType.TEXT;
      newFilter = {
        field: undefined,
        propertyId: propId,
        operator: defaultOperator(propType),
        value: undefined,
        values: undefined,
      };
    }
    setFilters([...filters, newFilter]);
    setHasPendingRow(false);
  }

  function updateFilter(index: number, patch: Partial<RecordFilterDto>) {
    setFilters(filters.map((filter, i) => (i === index ? { ...filter, ...patch } : filter)));
  }

  function removeFilter(index: number) {
    setFilters(filters.filter((_, i) => i !== index));
  }

  return (
    <div className="absolute top-full right-0 mt-1 z-modal bg-elevated border border-stroke rounded-lg shadow-lg p-3 w-[680px] max-w-[calc(100vw-2rem)] flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-ink-secondary uppercase tracking-wide">{t("title")}</span>
        {(filters.length > 0 || hasPendingRow) && (
          <button
            type="button"
            onClick={() => {
              setFilters([]);
              setHasPendingRow(false);
            }}
            className="text-xs text-ink-muted hover:text-error transition-colors"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {filters.length === 0 && !hasPendingRow && <p className="text-xs text-ink-muted py-1">{t("noRules")}</p>}

      <div className="flex flex-col gap-1.5">
        {filters.map((filter, i) => (
          <FilterRow
            key={i}
            filter={filter}
            index={i}
            onUpdate={updateFilter}
            onRemove={removeFilter}
            filterLogic={filterLogic}
            onToggleLogic={() => setFilterLogic(filterLogic === FilterLogic.AND ? FilterLogic.OR : FilterLogic.AND)}
          />
        ))}

        {hasPendingRow && (
          <div className="flex items-center gap-1.5">
            <span className="w-9 shrink-0" />
            <div className="w-40 shrink-0">
              <Combobox options={allOptions} value="" size="sm" placeholder={t("selectProperty")} onChange={confirmPendingFilter} />
            </div>
            <button
              type="button"
              onClick={() => setHasPendingRow(false)}
              className="p-1 rounded text-ink-muted hover:text-error hover:bg-error/10 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <Button variant="secondary" size="sm" onClick={() => setHasPendingRow(true)} disabled={hasPendingRow} className="mt-1 self-start">
        + {t("addFilter")}
      </Button>
    </div>
  );
}
