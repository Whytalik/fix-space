"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { DragOverlay } from "@dnd-kit/core";
import type { DatabaseResponseDto, SectionResponseDto } from "@fixspace/domain";
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
          const section = sections.find((sectionItem) => sectionItem.id === activeDrag.id);
          if (!section) return null;
          const isCollapsed = collapsedSections.has(section.id);
          return (
            <div
              className="flex flex-col rounded-lg border border-stroke w-54 py-1"
              style={{
                backgroundColor: section.color ? `color-mix(in srgb, ${section.color} 5%, var(--color-elevated))` : "var(--color-elevated)",
              }}
            >
              <div className="flex items-center gap-1.5 px-2 py-1">
                <ChevronRight
                  size={12}
                  className={`text-ink-muted shrink-0 transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
                />
                {section.icon && (
                  <span className="shrink-0 text-ink-secondary flex items-center">
                    <IconDisplay value={section.icon} size={14} />
                  </span>
                )}
                <span className="type-nav-label truncate" style={{ color: section.color || undefined }}>
                  {section.name}
                </span>
              </div>
              {!isCollapsed && (section.databases ?? []).length > 0 && (
                <div
                  className={`ml-5 border-l py-0.5 ${section.color ? "" : "border-stroke"}`}
                  style={section.color ? { borderColor: `color-mix(in srgb, ${section.color} 50%, transparent)` } : undefined}
                >
                  {(section.databases ?? []).map((database) => (
                    <div key={database.id} className="flex items-center gap-2 pl-3 pr-2 py-1">
                      <span className="shrink-0 flex items-center">
                        <IconDisplay value={database.icon || "📄"} size={14} />
                      </span>
                      <span className="text-sm text-ink-secondary truncate">{database.title || database.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      {activeDrag?.type === "database" &&
        (() => {
          const database = [...sections.flatMap((sectionItem) => sectionItem.databases ?? []), ...unsectioned].find(
            (databaseItem) => databaseItem.id === activeDrag.id,
          );
          if (!database) return null;
          return (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-elevated border border-stroke w-54">
              <span className="shrink-0 flex items-center">
                <IconDisplay value={database.icon || "📄"} size={14} />
              </span>
              <span className="text-sm text-ink truncate">{database.title || database.name}</span>
            </div>
          );
        })()}
    </DragOverlay>
  );
}
