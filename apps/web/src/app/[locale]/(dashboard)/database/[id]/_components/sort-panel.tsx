"use client";

import { PropertyIcon } from "./properties/ui/property-icon";
import { PropertyHint } from "./properties/ui/property-hint";
import { Button } from "@/components/ui/primitives/actions/button";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useDatabaseContext } from "@/context/database-context";
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
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RecordSortDto } from "@fixspace/domain";
import { PropertyType, SortDirection, SortField } from "@fixspace/domain/enums";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
import { useTranslations } from "next-intl";

const SORTABLE_TYPES = new Set([PropertyType.TEXT, PropertyType.NUMBER, PropertyType.DATE, PropertyType.STATUS, PropertyType.SELECT]);

type SortItem = RecordSortDto & { id: string };

function optionValue(sort: RecordSortDto): string {
  return sort.field === SortField.PROPERTY ? `prop:${sort.propertyId}` : `meta:${sort.field}`;
}

interface SortRowProps {
  item: SortItem;
  rowOptions: ComboboxOption[];
  prop: { id: string; name: string; type: string; hint?: string | null } | null | undefined;
  onApplyOption: (value: string) => void;
  onToggleDirection: () => void;
  onRemove: () => void;
}

function SortRow({ item, rowOptions, prop, onApplyOption, onToggleDirection, onRemove }: SortRowProps) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
  const t = useTranslations("SortPanel");
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined,
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 p-1.5 rounded-lg border border-stroke bg-canvas-subtle/50 hover:bg-canvas-subtle hover:border-stroke-strong transition-colors duration-150"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="cursor-grab text-ink-muted hover:text-ink transition-colors duration-150 shrink-0 px-1"
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        <div className="flex items-center gap-2 w-44 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-ink-muted shrink-0">
              <PropertyIcon type={(prop?.type as PropertyType) || PropertyType.TEXT} size={14} />
            </span>
            <div className="flex-1">
              <Combobox options={rowOptions} value={optionValue(item)} size="sm" onChange={onApplyOption} />
            </div>
          </div>
          {prop?.hint && <PropertyHint hint={prop.hint} />}
        </div>

        <button
          type="button"
          onClick={onToggleDirection}
          title={item.direction === SortDirection.ASC ? t("ascending") : t("descending")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stroke bg-surface text-xs font-medium text-ink-secondary hover:border-ink-muted hover:text-ink transition-colors duration-150 shadow-sm"
        >
          {item.direction === SortDirection.ASC ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          <span className="min-w-[32px] text-left">{item.direction === SortDirection.ASC ? t("asc") : t("desc")}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-ink-muted hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function SortPanelContent() {
  const { properties, sorts, setSorts, isViewLocked } = useDatabaseContext();
  const [hasPendingRow, setHasPendingRow] = useState(false);
  const t = useTranslations("SortPanel");

  const containerRef = useRef<HTMLDivElement>(null);

  const sortableProps = properties.filter((property) => SORTABLE_TYPES.has(property.type as PropertyType));

  const metaOptions: ComboboxOption[] = [
    { value: `meta:${SortField.CREATED_AT}`, label: t("createdAt") },
    { value: `meta:${SortField.UPDATED_AT}`, label: t("updatedAt") },
  ];

  const propertyOptions: ComboboxOption[] = sortableProps.map((property) => ({
    value: `prop:${property.id}`,
    label: property.name,
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
    setSorts(sorts.map((sort, i) => (i === index ? { ...sort, ...patch } : sort)));
  }

  function removeSort(index: number) {
    if (isViewLocked) return;
    setSorts(sorts.filter((_, i) => i !== index));
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

interface SortPanelProps {
  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

export function SortPanel({ anchorEl, onClose }: SortPanelProps) {
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
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 min-w-72 flex flex-col gap-2"
    >
      <SortPanelContent />
    </div>,
    document.body,
  );
}
