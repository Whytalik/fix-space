"use client";

import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ContentComponentData, ContentColumn, ContentRow as ContentRowType, ContentComponentType } from "@fixspace/domain";
import { GripVertical } from "lucide-react";
import { ContentComponent } from "./content-component";
import { useTranslations } from "next-intl";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ContentRowProps {
  row: ContentRowType;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  onDelete: (rowId: string) => void;
  onDeleteColumn: (rowId: string, columnId: string) => void;
  onSetColumnWidths: (rowId: string, widths: number[]) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateComponentData: (componentId: string, data: ContentComponentData) => void;
  selectedId?: string;
  onSelectComponent?: (id: string, type: ContentComponentType) => void;
  onSelectRow?: (id: string) => void;
  onSelectColumn?: (rowId: string, columnId: string) => void;
}

interface DroppableColumnProps {
  column: ContentColumn;
  rowId: string;
  isActive: boolean;
  index: number;
  isLast: boolean;
  canDelete: boolean;
  isEditing?: boolean;
  onResizeStart: (index: number, e: React.PointerEvent) => void;
  resizingIndex: number | null;
  onDeleteColumn: (rowId: string, columnId: string) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateComponentData: (componentId: string, data: ContentComponentData) => void;
  selectedId?: string;
  onSelectComponent?: (id: string, type: ContentComponentType) => void;
  onSelectColumn?: (rowId: string, columnId: string) => void;
  recordId?: string;
  templateId?: string;
}

function DroppableColumn({
  column,
  rowId,
  isActive,
  index,
  isLast,
  isEditing,
  onResizeStart,
  resizingIndex,
  onDeleteComponent,
  onUpdateComponentData,
  selectedId,
  onSelectComponent,
  onSelectColumn,
  recordId,
  templateId,
}: DroppableColumnProps) {
  const t = useTranslations("RecordPage.canvas");
  const { active } = useDndContext();
  const isPanelRowDrag = active?.data.current?.dragType === "panel-row";
  const isComponentDragActive =
    isActive && !isPanelRowDrag && (active?.data.current?.dragType === "panel-component" || active?.data.current?.dragType === "component");

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { dropType: "column", rowId, columnId: column.id },
    disabled: !isActive || isPanelRowDrag,
  });

  const hasContent = column.children.length > 0;
  const isSelected = selectedId === column.id;

  const sortableItems = column.children.map((c) => c.id);

  return (
    <div
      style={{ width: `${column.width}%` }}
      className={`relative group/column min-h-[60px]`}
      onClick={(e) => {
        if (!isEditing) return;
        const target = e.target as HTMLElement;
        const isColumnClick = target.closest(".group\\/column") === e.currentTarget && !target.closest(".group\\/component");

        if (isColumnClick) {
          e.stopPropagation();
          onSelectColumn?.(rowId, column.id);
        }
      }}
    >
      <div
        ref={setNodeRef}
        className={`h-full border border-dashed rounded-2xl p-3 pb-8 transition-colors duration-150 min-h-[60px]
          ${
            isSelected
              ? "ring-2 ring-accent border-accent bg-accent/5"
              : isOver && isActive
                ? "border-accent bg-accent/10"
                : isComponentDragActive
                  ? "border-stroke-subtle bg-surface/40"
                  : "border-stroke hover:border-stroke-subtle"
          }`}
      >
        <div className="flex flex-col gap-3">
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            {column.children.map((component) => (
              <ContentComponent
                key={component.id}
                component={component}
                recordId={recordId}
                templateId={templateId}
                isEditing={isEditing}
                isSelected={selectedId === component.id}
                onSelect={onSelectComponent}
                onDelete={onDeleteComponent}
                onUpdateData={onUpdateComponentData}
                rowId={rowId}
                columnId={column.id}
              />
            ))}
          </SortableContext>

          {!hasContent && (
            <div className="py-6 flex items-center justify-center text-ink-muted italic text-xs pointer-events-none">
              {isOver && isActive ? <span className="text-accent not-italic font-medium">{t("dropHere")}</span> : t("empty")}
            </div>
          )}
        </div>
      </div>

      {!isLast && isEditing && (
        <div
          onPointerDown={(e) => onResizeStart(index, e)}
          className="absolute -right-[7px] top-4 bottom-4 w-3.5 cursor-col-resize z-20 flex items-center justify-center group/resize"
        >
          <div
            className={`w-0.5 h-full rounded-full transition-colors duration-150 ${
              resizingIndex === index ? "bg-accent" : "bg-transparent group-hover/resize:bg-stroke"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export function ContentRow({
  row,
  recordId,
  templateId,
  isEditing,
  onDeleteColumn,
  onSetColumnWidths,
  onDeleteComponent,
  onUpdateComponentData,
  selectedId,
  onSelectComponent,
  onSelectRow,
  onSelectColumn,
}: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    data: { dragType: "row" },
    disabled: !isEditing,
  });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition: resizingIndex !== null ? "none" : transition,
  };

  const handleResizeStart = (index: number, startEvent: React.PointerEvent) => {
    startEvent.preventDefault();
    startEvent.stopPropagation();

    const target = startEvent.currentTarget as HTMLElement;
    target.setPointerCapture(startEvent.pointerId);

    setResizingIndex(index);
    const startX = startEvent.clientX;
    const initialWidths = row.columns.map((column) => column.width);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMove = (e: PointerEvent) => {
      const containerWidth = rowRef.current?.clientWidth ?? 1000;
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      if (Math.abs(deltaPercent) < 0.05) return;

      const currentW = initialWidths[index];
      const nextW = initialWidths[index + 1];
      if (currentW === undefined || nextW === undefined) return;

      const newLeft = Math.max(10, Math.min(90, currentW + deltaPercent));
      const actualDelta = newLeft - currentW;
      const newRight = Math.max(10, Math.min(90, nextW - actualDelta));

      const updated = [...initialWidths];
      updated[index] = newLeft;
      updated[index + 1] = newRight;
      onSetColumnWidths(row.id, updated);
    };

    const handleUp = (e: PointerEvent) => {
      target.releasePointerCapture(e.pointerId);
      setResizingIndex(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const isSelected = selectedId === row.id;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`group/row relative mb-4 last:mb-0 ${isDragging ? "z-50 opacity-50" : ""} ${isSelected ? "ring-2 ring-accent ring-offset-4 rounded-2xl" : ""}`}
      onClick={(e) => {
        if (!isEditing) return;
        const target = e.target as HTMLElement;
        const isRowClick = target.closest(".group\\/row") === e.currentTarget && !target.closest(".group\\/column");

        if (isRowClick) {
          onSelectRow?.(row.id);
        }
      }}
    >
      {isEditing && (
        <div className="absolute -left-8 top-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 flex flex-col gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink-secondary hover:bg-hover rounded-lg transition-colors duration-150"
          >
            <GripVertical size={16} />
          </button>
        </div>
      )}

      <div ref={rowRef} className="flex gap-3 min-h-[60px]">
        {row.columns.map((column, index) => (
          <DroppableColumn
            key={column.id}
            column={column}
            rowId={row.id}
            isActive={!isDragging}
            index={index}
            isLast={index === row.columns.length - 1}
            canDelete={row.columns.length > 1}
            isEditing={isEditing}
            onResizeStart={handleResizeStart}
            resizingIndex={resizingIndex}
            onDeleteColumn={onDeleteColumn}
            onDeleteComponent={onDeleteComponent}
            onUpdateComponentData={onUpdateComponentData}
            selectedId={selectedId}
            onSelectComponent={onSelectComponent}
            onSelectColumn={onSelectColumn}
            recordId={recordId}
            templateId={templateId}
          />
        ))}
      </div>
    </div>
  );
}
