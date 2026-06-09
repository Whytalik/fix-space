"use client";

import { PropertyIcon } from "./properties/ui/property-icon";
import { PropertyHint } from "./properties/ui/property-hint";
import { StatusProperty } from "./properties/fields/status-property";
import type { StatusPropertyOption } from "./properties/fields/status-property";
import { useDatabaseContext } from "@/context/database-context";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";
import { DateInput } from "@/components/ui/primitives/inputs/date-input";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { Button } from "@/components/ui/primitives/actions/button";
import type { RecordFilterDto } from "@fixspace/domain";
import { FilterField, FilterLogic, FilterOperator, OPERATORS_BY_PROPERTY_TYPE, PropertyType } from "@fixspace/domain/enums";
import { X } from "lucide-react";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-ink-muted shrink-0">
              <PropertyIcon type={propType} size={14} />
            </span>
            <div className="flex-1">
              <Combobox options={allOptions} value={selectedOptionValue()} onChange={handleOptionChange} size="sm" />
            </div>
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
            <DateInput
              value={typeof filter.value === "string" ? filter.value : ""}
              onChange={(value) => onUpdate(index, { value: value || undefined })}
              size="sm"
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

export function FilterPanelContent() {
  const { properties, filters, setFilters, filterLogic, setFilterLogic, isViewLocked } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const t = useTranslations("FilterPanel");

  const propertyOptions: ComboboxOption[] = properties.map((property) => ({ value: `prop:${property.id}`, label: property.name }));
  const allOptions: ComboboxOption[] = [
    ...META_OPTIONS.map((option) => ({ ...option, label: t(option.label as unknown as string) })),
    ...propertyOptions,
  ];

  function confirmPendingFilter(value: string) {
    if (!value || isViewLocked) return;
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
    if (isViewLocked) return;
    setFilters(filters.map((filter, i) => (i === index ? { ...filter, ...patch } : filter)));
  }

  function removeFilter(index: number) {
    if (isViewLocked) return;
    setFilters(filters.filter((filter, filterIndex) => filterIndex !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          {t("title")} {isViewLocked && <span className="text-ink-muted">({t("locked") || "Locked"})</span>}
        </span>
        {(filters.length > 0 || hasPendingRow) && !isViewLocked && (
          <button
            type="button"
            onClick={() => {
              setFilters([]);
              setHasPendingRow(false);
            }}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-150"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {filters.length === 0 && !hasPendingRow && <p className="text-xs text-ink-muted py-1 px-1">{t("noRules")}</p>}

      <div className="flex flex-col gap-2">
        {filters.map((filter, i) => (
          <FilterRow
            key={i}
            filter={filter}
            index={i}
            onUpdate={updateFilter}
            onRemove={removeFilter}
            filterLogic={filterLogic}
            onToggleLogic={() => !isViewLocked && setFilterLogic(filterLogic === FilterLogic.AND ? FilterLogic.OR : FilterLogic.AND)}
          />
        ))}

        {hasPendingRow && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-9 shrink-0" />
            <div className="w-40 shrink-0">
              <Combobox options={allOptions} value="" size="sm" placeholder={t("selectProperty")} onChange={confirmPendingFilter} />
            </div>
            <button
              type="button"
              onClick={() => setHasPendingRow(false)}
              className="p-1 rounded text-ink-muted hover:text-error hover:bg-error/10 transition-colors duration-150"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {!isViewLocked && (
        <Button variant="secondary" size="sm" onClick={() => setHasPendingRow(true)} disabled={hasPendingRow} className="self-start">
          {t("addFilter")}
        </Button>
      )}
    </div>
  );
}

interface FilterPanelProps {
  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

export function FilterPanel({ anchorEl, onClose }: FilterPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFloatingPanel(containerRef, onClose, anchorEl);

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
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 w-[680px] max-w-[calc(100vw-2rem)] flex flex-col gap-2"
    >
      <FilterPanelContent />
    </div>,
    document.body,
  );
}
