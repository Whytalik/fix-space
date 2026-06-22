"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { RecordFilterDto, FilterField } from "@fixspace/domain";
import { FilterLogic, PropertyType } from "@fixspace/domain";

import { Button } from "@/components/ui/primitives/actions/button";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useDatabaseContext } from "@/context/database-context";
import { PropertyIcon } from "../properties/ui/property-icon";
import { FilterRow } from "./filter-row";
import { META_OPTIONS, defaultOperator } from "./utils";

export function FilterPanelContent() {
  const { properties, filters, setFilters, filterLogic, setFilterLogic, isViewLocked } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const t = useTranslations("FilterPanel");

  const propertyOptions: ComboboxOption[] = properties.map((property) => ({
    value: `prop:${property.id}`,
    label: property.name,
    iconElement: <PropertyIcon type={property.type} size={14} />,
  }));
  const allOptions: ComboboxOption[] = [...META_OPTIONS.map((option) => ({ ...option, label: t(option.label) })), ...propertyOptions];

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
    setFilters(filters.map((filter, filterIndex) => (filterIndex === index ? { ...filter, ...patch } : filter)));
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
        {filters.map((filter, index) => (
          <FilterRow
            key={index}
            filter={filter}
            index={index}
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
