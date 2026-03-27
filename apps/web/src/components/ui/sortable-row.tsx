"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type SortableRowProps = {
  id: string;
  index: number;
  rowClassName?: string | ((index: number) => string);
  children: React.ReactNode;
};

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
