"use client";

import { PropertyIcon } from "@/components/property/property-icon";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PropertyResponseDto } from "@fixspace/domain";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type EditTableViewProps = {
  properties: PropertyResponseDto[];
  onPropertiesChange: (updated: PropertyResponseDto[]) => void;
  onPropertyUpdate: (id: string, data: Partial<{ position: number; isVisible: boolean }>) => void;
};

type TableRow = {
  id: string;
  prop: PropertyResponseDto;
  isPrimary: boolean;
};

function SortableTableRow({ row, onToggleVisibility }: { row: TableRow; onToggleVisibility: () => void }) {
  const t = useTranslations("EditTableView");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: row.isPrimary,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-2.5 border-t border-stroke first:border-t-0 transition-opacity duration-100 ${isDragging ? "opacity-0" : ""} ${row.prop.isVisible === false ? "opacity-60" : ""}`}
    >
      {row.isPrimary ? (
        <span className="w-[14px] shrink-0" />
      ) : (
        <button type="button" className="cursor-grab text-ink-muted shrink-0 hover:text-ink" {...listeners}>
          <GripVertical size={14} />
        </button>
      )}

      <PropertyIcon type={row.prop.type} size={14} className="text-ink-muted shrink-0" />

      <span className={`flex-1 text-sm ${row.prop.isVisible === false ? "text-ink-muted" : "text-ink"}`}>
        {row.prop.name}
      </span>

      {row.isPrimary && (
        <span className="text-tiny font-semibold uppercase tracking-widest text-ink-muted bg-surface border border-stroke rounded px-1.5 py-0.5 mr-1">
          {t("primary")}
        </span>
      )}

      {!row.isPrimary && (
        <button
          type="button"
          onClick={onToggleVisibility}
          title={row.prop.isVisible === false ? t("showColumn") : t("hideColumn")}
          className={`shrink-0 p-1 transition-colors ${row.prop.isVisible === false ? "text-ink-muted hover:text-ink" : "text-ink hover:text-ink-secondary"}`}
        >
          {row.prop.isVisible === false ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

export function EditTableView({ properties, onPropertiesChange, onPropertyUpdate }: EditTableViewProps) {
  const t = useTranslations("EditTableView");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const verticalOnly = useMemo<Modifier>(
    () =>
      ({ transform }) => ({ ...transform, x: 0 }),
    [],
  );

  const rows = useMemo<TableRow[]>(() => {
    const sorted = [...properties].sort((a, b) => a.position - b.position);
    return sorted.map((prop) => ({
      id: `table-prop:${prop.id}`,
      prop,
      isPrimary: prop.position === 0,
    }));
  }, [properties]);

  const primaryRow = rows.find((r) => r.isPrimary) ?? null;
  const nonPrimaryRows = rows.filter((r) => !r.isPrimary);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIdx = nonPrimaryRows.findIndex((r) => r.id === String(active.id));
    const newIdx = nonPrimaryRows.findIndex((r) => r.id === String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(nonPrimaryRows, oldIdx, newIdx);

    const updatedProps: PropertyResponseDto[] = [
      ...(primaryRow ? [primaryRow.prop] : []),
      ...reordered.map((r, i) => ({ ...r.prop, position: i + 1 })),
    ];

    onPropertiesChange(updatedProps);

    const origMap = new Map(properties.map((p) => [p.id, p]));
    for (const p of updatedProps) {
      const orig = origMap.get(p.id);
      if (orig && orig.position !== p.position) {
        onPropertyUpdate(p.id, { position: p.position });
      }
    }
  }

  function handleToggleVisibility(propId: string) {
    const prop = properties.find((p) => p.id === propId);
    if (!prop) return;
    const newVisible = prop.isVisible !== false ? false : true;
    const updated = properties.map((p) => (p.id === propId ? { ...p, isVisible: newVisible } : p));
    onPropertiesChange(updated);
    onPropertyUpdate(propId, { isVisible: newVisible });
  }

  const activeRow = nonPrimaryRows.find((r) => r.id === activeId) ?? null;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke flex items-center justify-center py-8">
        <p className="text-sm text-ink-muted">{t("noPropertiesYet")}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-lg border border-stroke overflow-hidden">
        {primaryRow && (
          <SortableTableRow row={primaryRow} onToggleVisibility={() => handleToggleVisibility(primaryRow.prop.id)} />
        )}
        <SortableContext items={nonPrimaryRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {nonPrimaryRows.map((row) => (
            <SortableTableRow key={row.id} row={row} onToggleVisibility={() => handleToggleVisibility(row.prop.id)} />
          ))}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeRow && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-elevated border border-stroke rounded-lg shadow-md">
            <GripVertical size={14} className="text-ink-muted shrink-0" />
            <PropertyIcon type={activeRow.prop.type} size={14} className="text-ink-muted shrink-0" />
            <span className="text-sm text-ink flex-1">{activeRow.prop.name}</span>
            <span className="text-xs text-ink-muted font-mono">{activeRow.prop.type}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
