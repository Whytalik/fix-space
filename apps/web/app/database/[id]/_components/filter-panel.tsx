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
import type { RecordFilterDto } from "@nucleus/domain";
import { FilterField, FilterLogic, FilterOperator, PropertyType } from "@nucleus/domain";
import { X } from "lucide-react";

const NO_VALUE_OPERATORS = new Set([
  FilterOperator.IS_EMPTY,
  FilterOperator.IS_NOT_EMPTY,
  FilterOperator.IS_CHECKED,
  FilterOperator.IS_UNCHECKED,
]);

const MULTI_VALUE_OPERATORS = new Set([FilterOperator.IN, FilterOperator.NOT_IN]);

type OperatorDef = { value: FilterOperator; label: string };

const OPERATORS_BY_TYPE: Record<string, OperatorDef[]> = {
  [PropertyType.TEXT]: [
    { value: FilterOperator.EQUALS, label: "equals" },
    { value: FilterOperator.NOT_EQUALS, label: "not equals" },
    { value: FilterOperator.CONTAINS, label: "contains" },
    { value: FilterOperator.NOT_CONTAINS, label: "does not contain" },
    { value: FilterOperator.STARTS_WITH, label: "starts with" },
    { value: FilterOperator.ENDS_WITH, label: "ends with" },
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.NUMBER]: [
    { value: FilterOperator.EQUALS, label: "=" },
    { value: FilterOperator.NOT_EQUALS, label: "≠" },
    { value: FilterOperator.GREATER_THAN, label: ">" },
    { value: FilterOperator.LESS_THAN, label: "<" },
    { value: FilterOperator.GREATER_THAN_OR_EQUAL, label: ">=" },
    { value: FilterOperator.LESS_THAN_OR_EQUAL, label: "<=" },
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.DATE]: [
    { value: FilterOperator.EQUALS, label: "on" },
    { value: FilterOperator.BEFORE, label: "before" },
    { value: FilterOperator.AFTER, label: "after" },
    { value: FilterOperator.ON_OR_BEFORE, label: "on or before" },
    { value: FilterOperator.ON_OR_AFTER, label: "on or after" },
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.CHECKBOX]: [
    { value: FilterOperator.IS_CHECKED, label: "is checked" },
    { value: FilterOperator.IS_UNCHECKED, label: "is unchecked" },
  ],
  [PropertyType.SELECT]: [
    { value: FilterOperator.EQUALS, label: "is exactly" },
    { value: FilterOperator.NOT_EQUALS, label: "is not exactly" },
    { value: FilterOperator.IN, label: "is one of" },
    { value: FilterOperator.NOT_IN, label: "is not one of" },
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.STATUS]: [
    { value: FilterOperator.EQUALS, label: "is exactly" },
    { value: FilterOperator.NOT_EQUALS, label: "is not exactly" },
    { value: FilterOperator.IN, label: "is one of" },
    { value: FilterOperator.NOT_IN, label: "is not one of" },
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.RELATION]: [
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
  ],
  [PropertyType.FORMULA]: [
    { value: FilterOperator.IS_EMPTY, label: "is empty" },
    { value: FilterOperator.IS_NOT_EMPTY, label: "is not empty" },
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
  { value: `meta:${FilterField.CREATED_AT}`, label: "Created At" },
  { value: `meta:${FilterField.UPDATED_AT}`, label: "Updated At" },
];

function FilterRow({ filter, index, onUpdate, onRemove, filterLogic, onToggleLogic }: FilterRowProps) {
  const { properties } = useDatabaseContext();

  const isMeta = filter.field === FilterField.CREATED_AT || filter.field === FilterField.UPDATED_AT;
  const property = isMeta ? undefined : properties.find((p) => p.id === filter.propertyId);
  const propType = isMeta ? PropertyType.DATE : ((property?.type as string) ?? PropertyType.TEXT);
  const operators = getOperators(propType);
  const noValue = NO_VALUE_OPERATORS.has(filter.operator);
  const isMulti = MULTI_VALUE_OPERATORS.has(filter.operator);

  const propertyOptions: ComboboxOption[] = properties.map((p) => ({ value: `prop:${p.id}`, label: p.name }));
  const allOptions: ComboboxOption[] = [...META_OPTIONS, ...propertyOptions];

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

  // Extract options for SELECT / STATUS
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
      {/* Logic pill — only for rows after the first */}
      {index > 0 ? (
        <button
          type="button"
          onClick={onToggleLogic}
          className="w-9 shrink-0 px-1.5 py-0.5 rounded-md text-xs border transition-colors bg-surface border-stroke text-ink-secondary hover:border-ink-muted hover:text-ink text-center"
        >
          {filterLogic}
        </button>
      ) : (
        <span className="w-9 shrink-0" />
      )}

      {/* Property / meta selector */}
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

      {/* Operator selector */}
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

      {/* SELECT / STATUS: multi-value (IN / NOT_IN) */}
      {!noValue && isMulti && (
        <div className="flex-1 min-w-0">
          <Combobox
            options={selectOptions}
            value={filter.values ?? []}
            onChange={(v) => onUpdate(index, { values: v })}
            multiple
            size="sm"
            placeholder="Pick values…"
          />
        </div>
      )}

      {/* STATUS: single-value (EQUALS / NOT_EQUALS) — color-coded dropdown */}
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
            placeholder="Pick status…"
            size="sm"
          />
        </div>
      )}

      {/* SELECT: single-value (EQUALS / NOT_EQUALS) — single combobox */}
      {!noValue && !isMulti && propType === PropertyType.SELECT && (
        <div className="flex-1 min-w-0">
          <Combobox
            options={selectOptions}
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(v) => onUpdate(index, { value: v || undefined })}
            nullable
            size="sm"
            placeholder="Pick option…"
          />
        </div>
      )}

      {/* NUMBER */}
      {!noValue && !isMulti && propType === PropertyType.NUMBER && (
        <div className="w-28">
          <NumberInput
            value={filter.value != null ? Number(filter.value) : null}
            onChange={(v) => onUpdate(index, { value: v ?? undefined })}
            placeholder="Value…"
            size="sm"
          />
        </div>
      )}

      {/* DATE */}
      {!noValue && !isMulti && propType === PropertyType.DATE && (
        <div className="flex-1 min-w-0">
          <DateInput
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(v) => onUpdate(index, { value: v || undefined })}
            size="sm"
          />
        </div>
      )}

      {/* TEXT (and any other text-like type) */}
      {!noValue && !isMulti && propType === PropertyType.TEXT && (
        <div className="flex-1 min-w-0">
          <TextInput
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(v) => onUpdate(index, { value: v || undefined })}
            placeholder="Value…"
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

interface FilterPanelProps {
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FilterPanel({ onClose }: FilterPanelProps) {
  const { properties, filters, setFilters, filterLogic, setFilterLogic } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);

  const propertyOptions: ComboboxOption[] = properties.map((p) => ({ value: `prop:${p.id}`, label: p.name }));
  const allOptions: ComboboxOption[] = [...META_OPTIONS, ...propertyOptions];

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
    <div className="absolute top-full right-0 mt-1 z-50 bg-elevated border border-stroke rounded-lg shadow-lg p-3 w-[680px] max-w-[calc(100vw-2rem)] flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-ink-secondary uppercase tracking-wide">Filter</span>
        {(filters.length > 0 || hasPendingRow) && (
          <button
            type="button"
            onClick={() => {
              setFilters([]);
              setHasPendingRow(false);
            }}
            className="text-xs text-ink-muted hover:text-error transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {filters.length === 0 && !hasPendingRow && (
        <p className="text-xs text-ink-muted py-1">No filter rules. Add one below.</p>
      )}

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
                placeholder="Select property…"
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
        + Add filter
      </Button>
    </div>
  );
}
