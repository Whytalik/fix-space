"use client";

import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { DatabaseItem } from "../items/database-item";
import { SectionItem } from "../items/section-item";
import { useSidebarDnd } from "./hooks/use-sidebar-dnd";
import { useSidebarState } from "./hooks/use-sidebar-state";
import { SidebarActions } from "./sidebar-actions";
import { SidebarDragOverlay } from "./sidebar-drag-overlay";
import { UnsectionedDropZone } from "./unsectioned-drop-zone";

export function Sidebar() {
  const { space } = useAppContext();
  const { openSettings } = useUIContext();
  const { collapsed, toggle, collapsedSections, toggleSection } = useSidebarState();
  const {
    contentRef,
    sensors,
    verticalOnly,
    collisionDetection,
    activeDrag,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  } = useSidebarDnd();

  const sections = space?.sections ?? [];
  const sectionedIds = new Set(sections.flatMap((s) => (s.databases ?? []).map((d) => d.id)));
  const unsectioned = (space?.databases ?? []).filter((d) => !sectionedIds.has(d.id));

  return (
    <div className="relative shrink-0 h-full">
      <aside
        className={`${collapsed ? "w-14" : "w-60"} border-r border-stroke px-3 py-6 flex flex-col gap-4 overflow-hidden transition-[width] duration-200 h-full`}
      >
        {!collapsed && <SidebarActions />}

        <div
          ref={contentRef}
          className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {collapsed ? (
            <>
              {sections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  collapsed
                  isCollapsed={collapsedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
              {unsectioned.map((db) => (
                <DatabaseItem spaceId={space!.id} key={db.id} db={db} collapsed />
              ))}
            </>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              modifiers={[verticalOnly]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((section) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    isCollapsed={collapsedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                ))}
              </SortableContext>
              <UnsectionedDropZone>
                <SortableContext items={unsectioned.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  {unsectioned.map((db) => (
                    <DatabaseItem spaceId={space!.id} key={db.id} db={db} sectionId={null} />
                  ))}
                </SortableContext>
              </UnsectionedDropZone>
              <SidebarDragOverlay
                activeDrag={activeDrag}
                sections={sections}
                unsectioned={unsectioned}
                collapsedSections={collapsedSections}
              />
            </DndContext>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-stroke">
          <button
            onClick={openSettings}
            title={collapsed ? "Settings" : undefined}
            className={`flex w-full items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${collapsed ? "justify-center" : ""} text-ink-secondary hover:bg-surface hover:text-ink`}
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full border border-stroke bg-canvas text-ink-muted inline-flex items-center justify-center transition-colors duration-150 hover:bg-surface hover:text-ink cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
}
