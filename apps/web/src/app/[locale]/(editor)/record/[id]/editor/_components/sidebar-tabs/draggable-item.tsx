"use client";

import { useDraggable } from "@dnd-kit/core";
import type { PanelDragData } from "../editor-sidebar";

interface DraggableItemProps {
  id: string;
  data: PanelDragData;
  children: React.ReactNode;
}

export function DraggableItem({ id, data, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing select-none
        hover:bg-surface-hover transition-colors duration-150 text-ink-secondary hover:text-ink
        ${isDragging ? "opacity-40 ring-1 ring-accent" : ""}`}
    >
      {children}
    </div>
  );
}
