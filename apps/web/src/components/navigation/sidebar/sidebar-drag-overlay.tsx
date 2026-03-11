"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { DragOverlay } from "@dnd-kit/core";
import type { DatabaseResponseDto, SectionResponseDto } from "@nucleus/domain";
import { ChevronRight } from "lucide-react";

interface SidebarDragOverlayProps {
  activeDrag: { id: string; type: "section" | "database" } | null;
  sections: SectionResponseDto[];
  unsectioned: DatabaseResponseDto[];
  collapsedSections: Set<string>;
}

export function SidebarDragOverlay({ activeDrag, sections, unsectioned, collapsedSections }: SidebarDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeDrag?.type === "section" &&
        (() => {
          const s = sections.find((sec) => sec.id === activeDrag.id);
          if (!s) return null;
          const isCollapsed = collapsedSections.has(s.id);
          return (
            <div
              className="flex flex-col gap-0.5 rounded border border-stroke shadow-md w-54 py-1"
              style={{
                backgroundColor: s.color ? s.color + "18" : "var(--color-elevated)",
              }}
            >
              <div className="flex items-center gap-1 px-2 py-1">
                <ChevronRight
                  size={12}
                  className={`text-ink-secondary shrink-0 transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
                />
                {s.icon && (
                  <span className="shrink-0 text-ink-secondary flex items-center">
                    <IconDisplay value={s.icon} size={16} />
                  </span>
                )}
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider truncate"
                  style={{ color: s.color || undefined }}
                >
                  {s.name}
                </span>
              </div>
              {!isCollapsed &&
                (s.databases ?? []).map((db) => (
                  <div key={db.id} className="flex items-center gap-2 pl-5 pr-2 py-1 rounded-md">
                    <span className="shrink-0 flex items-center">
                      <IconDisplay value={db.icon || "📄"} size={14} />
                    </span>
                    <span className="text-[13px] text-ink-secondary truncate">{db.title || db.name}</span>
                  </div>
                ))}
            </div>
          );
        })()}
      {activeDrag?.type === "database" &&
        (() => {
          const db = [...sections.flatMap((s) => s.databases ?? []), ...unsectioned].find(
            (d) => d.id === activeDrag.id,
          );
          if (!db) return null;
          return (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-elevated border border-stroke shadow-md w-54">
              <span className="shrink-0 flex items-center">
                <IconDisplay value={db.icon || "📄"} size={14} />
              </span>
              <span className="text-[13px] text-ink truncate">{db.title || db.name}</span>
            </div>
          );
        })()}
    </DragOverlay>
  );
}
