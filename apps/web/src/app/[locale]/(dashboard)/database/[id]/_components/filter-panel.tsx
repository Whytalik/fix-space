"use client";

import { PropertyIcon } from "@/components/property/property-icon";
import { Button } from "@/components/ui/primitives/button";
import type { ComboboxOption } from "@/components/ui/primitives/combobox";
import { Combobox } from "@/components/ui/primitives/combobox";
import { useState } from "react";
import { DateInput } from "@/components/ui/primitives/date-input";
import { NumberInput } from "@/components/ui/primitives/number-input";
import { TextInput } from "@/components/ui/primitives/text-input";
import { StatusInput } from "@/components/ui/primitives/status-input";
import type { StatusOption } from "@/components/ui/primitives/status-input";
import { useDatabaseContext } from "@/context/database-context";
import type { RecordFilterDto } from "@fixspace/domain";
import { FilterField, FilterLogic, FilterOperator, PropertyType } from "@fixspace/domain/enums";
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

const OPERATORS_BY_TYPE: Record<string, { value: FilterOperator; label: string }[]> = {
  [PropertyType.TEXT]: [
    { value: FilterOperator.EQUALS, label: "operators.equals" },
    { value: FilterOperator.NOT_EQUALS, label: "operators.notEquals" },
    { value: FilterOperator.CONTAINS, label: "operators.contains" },
    { value: FilterOperator.NOT_CONTAINS, label: "operators.notContains" },
    { value: FilterOperator.STARTS_WITH, label: "operators.startsWith" },
    { value: FilterOperator.ENDS_WITH, label: "operators.endsWith" },
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
  [PropertyType.NUMBER]: [
    { value: FilterOperator.EQUALS, label: "operators.equals" },
    { value: FilterOperator.NOT_EQUALS, label: "operators.notEquals" },
    { value: FilterOperator.GREATER_THAN, label: "operators.greaterThan" },
    { value: FilterOperator.LESS_THAN, label: "operators.lessThan" },
    { value: FilterOperator.GREATER_THAN_OR_EQUAL, label: "operators.greaterThanOrEqual" },
    { value: FilterOperator.LESS_THAN_OR_EQUAL, label: "operators.lessThanOrEqual" },
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
  [PropertyType.DATE]: [
    { value: FilterOperator.EQUALS, label: "operators.on" },
    { value: FilterOperator.BEFORE, label: "operators.before" },
    { value: FilterOperator.AFTER, label: "operators.after" },
    { value: FilterOperator.ON_OR_BEFORE, label: "operators.onOrBefore" },
    { value: FilterOperator.ON_OR_AFTER, label: "operators.onOrAfter" },
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
  [PropertyType.CHECKBOX]: [
    { value: FilterOperator.IS_CHECKED, label: "operators.isChecked" },
    { value: FilterOperator.IS_UNCHECKED, label: "operators.isUnchecked" },
  ],
  [PropertyType.SELECT]: [
    { value: FilterOperator.EQUALS, label: "operators.isExactly" },
    { value: FilterOperator.NOT_EQUALS, label: "operators.isNotExactly" },
    { value: FilterOperator.IN, label: "operators.isOneOf" },
    { value: FilterOperator.NOT_IN, label: "operators.isNotOneOf" },
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
  [PropertyType.STATUS]: [
    { value: FilterOperator.EQUALS, label: "operators.isExactly" },
    { value: FilterOperator.NOT_EQUALS, label: "operators.isNotExactly" },
    { value: FilterOperator.IN, label: "operators.isOneOf" },
    { value: FilterOperator.NOT_IN, label: "operators.isNotOneOf" },
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
  [PropertyType.RELATION]: [
    { value: FilterOperator.IS_EMPTY, label: "operators.isEmpty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "operators.isNotEmpty" },
  ],
};

function getOperators(type: string): OperatorDef[] {
  return OPERATORS_BY_TYPE[type] ?? OPERATORS_BY_TYPE[PropertyType.TEXT] ?? [];
}

function defaultOperator(type: string): FilterOperator {
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
  const property = isMeta ? undefined : properties.find((p) => p.id === filter.propertyId);
  const propType = isMeta ? PropertyType.DATE : ((property?.type as string) ?? PropertyType.TEXT);
  const operators = getOperators(propType).map((op) => ({ ...op, label: t(op.label as unknown as string) }));
  const noValue = NO_VALUE_OPERATORS.has(filter.operator);
  const isMulti = MULTI_VALUE_OPERATORS.has(filter.operator);

  const propertyOptions: ComboboxOption[] = properties.map((p) => ({ value: `prop:${p.id}`, label: p.name }));
  const allOptions: ComboboxOption[] = [
    ...META_OPTIONS.map((opt) => ({ ...opt, label: t(opt.label as unknown as string) })),
    ...propertyOptions,
  ];

  function selectedOptionValue(): string {
    if (filter.field === FilterField.CREATED_AT) return `meta:${FilterField.CREATED_AT}`;
    if (filter.field === FilterField.UPDATED_AT) return `meta:${FilterField.UPDATED_AT}`;
    return filter.propertyId ? `prop:${filter.propertyId}` : "";
  }

  function handleOptionChange(val: string) {
    if (val.startsWith("meta:")) {
      const field = val.slice(5) as FilterField;
      onUpdate(index, {
        field,
        propertyId: undefined,
        operator: defaultOperator(PropertyType.DATE),
        value: undefined,
        values: undefined,
      });
    } else {
      const propId = val.slice(5);
      const newProp = properties.find((p) => p.id === propId);
      const newType = (newProp?.type as string) ?? PropertyType.TEXT;
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
          (
            property?.config as { categories?: Array<{ options: Array<{ value: string }> }> } | null
          )?.categories?.flatMap((c) => c.options) ?? []
        ).map((o) => ({ value: o.value, label: o.value }))
      : propType === PropertyType.STATUS
        ? (
            (
              property?.config as {
                categories?: Array<{ options: Array<{ name: string }> }>;
              } | null
            )?.categories?.flatMap((c) => c.options.map((o) => o.name)) ?? []
          ).map((o) => ({ value: o, label: o }))
        : [];

  const statusOptions: StatusOption[] =
    propType === PropertyType.STATUS
      ? ((
          property?.config as { categories?: Array<{ options: Array<{ name: string; color: string }> }> } | null
        )?.categories?.flatMap((c) => c.options) ?? [])
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
          onChange={(op) => {
            onUpdate(index, {
              operator: op as FilterOperator,
              value: NO_VALUE_OPERATORS.has(op as FilterOperator) ? undefined : filter.value,
              values: MULTI_VALUE_OPERATORS.has(op as FilterOperator) ? (filter.values ?? []) : undefined,
            });
          }}
        />
      </div>

      {!noValue && isMulti && (
        <div className="flex-1 min-w-0">
          <Combobox
            options={selectOptions}
            value={filter.values ?? []}
            onChange={(v) => onUpdate(index, { values: v })}
            multiple
            size="sm"
            placeholder={t("pickValues")}
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.STATUS && (
        <div className="flex-1 min-w-0">
          <StatusInput
            options={statusOptions}
            value={
              filter.value != null
                ? statusOptions.find((o) => o.name === String(filter.value))
                  ? {
                      label: String(filter.value),
                      color: statusOptions.find((o) => o.name === String(filter.value))!.color,
                    }
                  : null
                : null
            }
            onChange={(v) => onUpdate(index, { value: v?.label ?? undefined })}
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
            onChange={(v) => onUpdate(index, { value: v || undefined })}
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
            onChange={(v) => onUpdate(index, { value: v ?? undefined })}
            placeholder={t("value")}
            size="sm"
          />
        </div>
      )}

      {!noValue && !isMulti && propType === PropertyType.DATE && (
        <div className="flex-1 min-w-0">
          <DateInput
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(v) => onUpdate(index, { value: v || undefined })}
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

  const propertyOptions: ComboboxOption[] = properties.map((p) => ({ value: `prop:${p.id}`, label: p.name }));
  const allOptions: ComboboxOption[] = [
    ...META_OPTIONS.map((opt) => ({ ...opt, label: t(opt.label as unknown as string) })),
    ...propertyOptions,
  ];

  function confirmPendingFilter(val: string) {
    if (!val) return;
    let newFilter: RecordFilterDto;
    if (val.startsWith("meta:")) {
      const field = val.slice(5) as FilterField;
      newFilter = {
        field,
        propertyId: undefined as unknown as string,
        operator: defaultOperator(PropertyType.DATE),
        value: undefined,
        values: undefined,
      };
    } else {
      const propId = val.slice(5);
      const prop = properties.find((p) => p.id === propId);
      const propType = (prop?.type as string) ?? PropertyType.TEXT;
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
    setFilters(filters.map((f, i) => (i === index ? { ...f, ...patch } : f)));
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
              <Combobox
                options={allOptions}
                value=""
                size="sm"
                placeholder={t("selectProperty")}
                onChange={confirmPendingFilter}
              />
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

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setHasPendingRow(true)}
        disabled={hasPendingRow}
        className="mt-1 self-start"
      >
        + {t("addFilter")}
      </Button>
    </div>
  );
}
