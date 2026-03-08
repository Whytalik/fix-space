"use client";

import { useDroppable } from "@dnd-kit/core";
import { type ReactNode } from "react";

interface UnsectionedDropZoneProps {
  children: ReactNode;
}

export function UnsectionedDropZone({ children }: UnsectionedDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unsectioned",
    data: { type: "unsectioned" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-0.5 rounded min-h-2 transition-colors ${isOver ? "bg-surface/30" : ""}`}
    >
      {children}
    </div>
  );
}
