"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (next: T[], moved: { item: T; newIndex: number }[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderOverlay?: (item: T) => React.ReactNode;
  rowClassName?: string | ((index: number) => string);
}

interface SortableRowProps {
  id: string;
  index: number;
  rowClassName?: string | ((index: number) => string);
  children: React.ReactNode;
}

export function SortableRow({ id, index, rowClassName, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const cls = typeof rowClassName === "function" ? rowClassName(index) : (rowClassName ?? "");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-2 ${cls} ${isDragging ? "opacity-0" : ""}`}
    >
      <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
        <GripVertical size={14} />
      </button>
      {children}
    </div>
  );
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  renderOverlay,
  rowClassName,
}: SortableListProps<T>) {
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const verticalOnly = useMemo<Modifier>(
    () =>
      ({ transform, draggingNodeRect }) => {
        const newTransform = { ...transform, x: 0 };
        const container = containerRef.current;
        if (!container || !draggingNodeRect) return newTransform;
        const rect = container.getBoundingClientRect();
        const minY = rect.top - draggingNodeRect.top;
        const maxY = rect.bottom - draggingNodeRect.bottom;
        return { ...newTransform, y: Math.min(Math.max(newTransform.y, minY), maxY) };
      },
    [],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveItem(items.find((item) => item.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItem(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);

    const moved = next
      .map((item, i) => ({ item, newIndex: i }))
      .filter(({ item, newIndex: i }) => items.findIndex((x) => x.id === item.id) !== i);

    onReorder(next, moved);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div ref={containerRef}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id} index={index} rowClassName={rowClassName}>
              {renderItem(item, index)}
            </SortableRow>
          ))}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem &&
          (renderOverlay ? (
            renderOverlay(activeItem)
          ) : (
            <div
              className={`flex items-center gap-2 shadow-md ${typeof rowClassName === "function" ? rowClassName(items.findIndex((i) => i.id === activeItem.id)) : (rowClassName ?? "")}`}
            >
              <GripVertical size={14} className="text-ink-muted shrink-0" />
              {renderItem(activeItem, items.findIndex((i) => i.id === activeItem.id))}
            </div>
          ))}
      </DragOverlay>
    </DndContext>
  );
}
