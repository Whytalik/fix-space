"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, X } from "lucide-react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { RecordSortDto } from "@fixspace/domain";
import { PropertyType, SortDirection, SortField } from "@fixspace/domain";

import { Button } from "@/components/ui/primitives/actions/button";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useDatabaseContext } from "@/context/database-context";
import { PropertyIcon } from "../properties/ui/property-icon";
import { SortRow } from "./sort-row";

const SORTABLE_TYPES = new Set([PropertyType.TEXT, PropertyType.NUMBER, PropertyType.DATE, PropertyType.STATUS, PropertyType.SELECT]);

type SortItem = RecordSortDto & { id: string };

function optionValue(sort: RecordSortDto): string {
  return sort.field === SortField.PROPERTY ? `prop:${sort.propertyId}` : `meta:${sort.field}`;
}

export function SortPanelContent() {
  const { properties, sorts, setSorts, isViewLocked } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const t = useTranslations("SortPanel");

  const containerRef = useRef<HTMLDivElement>(null);

  const sortableProps = properties.filter((property) => SORTABLE_TYPES.has(property.type as PropertyType));

  const metaOptions: ComboboxOption[] = [
    { value: `meta:${SortField.CREATED_AT}`, label: t("createdAt"), iconElement: <Calendar size={14} /> },
    { value: `meta:${SortField.UPDATED_AT}`, label: t("updatedAt"), iconElement: <Calendar size={14} /> },
  ];

  const propertyOptions: ComboboxOption[] = sortableProps.map((property) => ({
    value: `prop:${property.id}`,
    label: property.name,
    iconElement: <PropertyIcon type={property.type} size={14} />,
  }));

  const allOptions = [...metaOptions, ...propertyOptions];

  const usedValues = new Set(sorts.map(optionValue));

  const sortItems: SortItem[] = sorts.map((sort) => ({ ...sort, id: optionValue(sort) }));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const clampBoundsRef = useRef<{ minY: number; maxY: number } | null>(null);

  const verticalOnly = useMemo<Modifier>(
    () =>
      ({ transform }) => {
        const bounds = clampBoundsRef.current;
        if (!bounds) return { ...transform, x: 0 };
        return {
          ...transform,
          x: 0,
          y: Math.min(Math.max(transform.y, bounds.minY), bounds.maxY),
        };
      },
    [],
  );

  function handleDragStart(event: DragStartEvent) {
    if (isViewLocked) return;
    const panel = containerRef.current;
    const initial = event.active.rect.current.initial;
    if (panel && initial) {
      const panelRect = panel.getBoundingClientRect();
      clampBoundsRef.current = {
        minY: panelRect.top - initial.top,
        maxY: panelRect.bottom - initial.bottom,
      };
    } else {
      clampBoundsRef.current = null;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    clampBoundsRef.current = null;
    if (isViewLocked) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortItems.findIndex((sortItem) => sortItem.id === active.id);
    const newIndex = sortItems.findIndex((sortItem) => sortItem.id === over.id);
    setSorts(arrayMove(sorts, oldIndex, newIndex));
  }

  function applyOption(index: number, value: string) {
    if (isViewLocked) return;
    if (value.startsWith("meta:")) {
      const field = value.slice(5) as SortField;
      updateSort(index, { field, propertyId: undefined });
    } else {
      updateSort(index, { field: SortField.PROPERTY, propertyId: value.slice(5) });
    }
  }

  function addSort() {
    if (isViewLocked) return;
    setHasPendingRow(true);
  }

  function confirmPendingSort(value: string) {
    if (!value || isViewLocked) return;
    const isMeta = value.startsWith("meta:");
    setSorts([
      ...sorts,
      {
        field: isMeta ? (value.slice(5) as SortField) : SortField.PROPERTY,
        direction: SortDirection.ASC,
        propertyId: isMeta ? undefined : value.slice(5),
      },
    ]);
    setHasPendingRow(false);
  }

  function updateSort(index: number, patch: Partial<RecordSortDto>) {
    if (isViewLocked) return;
    setSorts(sorts.map((sort, sortIndex) => (sortIndex === index ? { ...sort, ...patch } : sort)));
  }

  function removeSort(index: number) {
    if (isViewLocked) return;
    setSorts(sorts.filter((unusedSortItem, sortIndex) => sortIndex !== index));
  }

  function toggleDirection(index: number) {
    if (isViewLocked) return;
    const sort = sorts[index];
    if (!sort) return;
    updateSort(index, {
      direction: sort.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
    });
  }

  function getPropertyForSort(sort: RecordSortDto) {
    return sort.field === SortField.PROPERTY ? properties.find((property) => property.id === sort.propertyId) : null;
  }

  const canAddSort = !hasPendingRow && usedValues.size < allOptions.length && !isViewLocked;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          {t("title")} {isViewLocked && <span className="text-ink-muted">({t("locked") || "Locked"})</span>}
        </span>
        {(sorts.length > 0 || hasPendingRow) && !isViewLocked && (
          <button
            type="button"
            onClick={() => {
              setSorts([]);
              setHasPendingRow(false);
            }}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-150"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {sorts.length === 0 && !hasPendingRow && <p className="text-xs text-ink-muted py-1 px-1">{t("noRules")}</p>}

      {sorts.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[verticalOnly]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-2">
            <SortableContext items={sortItems.map((sortItem) => sortItem.id)} strategy={verticalListSortingStrategy}>
              {sortItems.map((item) => {
                const sortIndex = sorts.findIndex((sort) => optionValue(sort) === item.id);
                const prop = getPropertyForSort(item);
                const rowOptions = allOptions.filter((option) => !usedValues.has(option.value) || option.value === optionValue(item));
                return (
                  <SortRow
                    key={item.id}
                    item={item}
                    rowOptions={rowOptions}
                    prop={prop}
                    onApplyOption={(value) => applyOption(sortIndex, value)}
                    onToggleDirection={() => toggleDirection(sortIndex)}
                    onRemove={() => removeSort(sortIndex)}
                  />
                );
              })}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {hasPendingRow && (
        <div className="flex items-center gap-1.5 px-1">
          <div className="flex-1 min-w-32">
            <Combobox
              options={allOptions.filter((option) => !usedValues.has(option.value))}
              value=""
              size="sm"
              placeholder={t("selectField")}
              onChange={confirmPendingSort}
            />
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

      {!isViewLocked && (
        <Button variant="secondary" size="sm" onClick={addSort} disabled={!canAddSort} className="self-start">
          {t("addSort")}
        </Button>
      )}
    </div>
  );
}
