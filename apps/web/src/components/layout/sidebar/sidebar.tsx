"use client";

import { useAppContext } from "@/context/app-context";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { DatabaseItem } from "./components/database-item";
import { SectionItem } from "./components/section-item";
import { useSidebarDnd } from "@/hooks/layout/use-sidebar-dnd";
import { useSidebarState } from "@/hooks/layout/use-sidebar-state";
import { SidebarActions } from "./sidebar-actions";
import { SidebarDragOverlay } from "./sidebar-drag-overlay";
import { UnsectionedDropZone } from "./unsectioned-drop-zone";
import { SpaceSwitcher } from "@/components/navigation/space-switcher";
import { SidebarSkeleton } from "./skeletons/sidebar-skeleton";
interface SidebarProps {
  initialCollapsed?: boolean;
  initialCollapsedSections?: string[];
}

export function Sidebar({ initialCollapsed = false, initialCollapsedSections = [] }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const { space, isLoading } = useAppContext();
  const { collapsed, toggle, collapsedSections, toggleSection, isMounted } = useSidebarState(initialCollapsed, initialCollapsedSections);
  const { contentRef, sensors, verticalOnly, collisionDetection, activeDrag, handleDragStart, handleDragCancel, handleDragEnd } =
    useSidebarDnd();

  if (isLoading) return <SidebarSkeleton collapsed={collapsed} />;

  const sections = space?.sections ?? [];
  const sectionedIds = new Set(sections.flatMap((section) => (section.databases ?? []).map((database) => database.id)));
  const unsectioned = (space?.databases ?? []).filter((database) => !sectionedIds.has(database.id));

  return (
    <div className="relative shrink-0 h-full">
      <aside
        className={`${collapsed ? "w-14" : "w-[250px]"} border-r border-stroke px-3 pt-3 pb-6 flex flex-col gap-4 overflow-hidden ${isMounted ? "transition-[width] duration-150" : ""} h-full`}
      >
        {collapsed ? (
          <div className="flex justify-center pb-3 -mx-3 border-b border-stroke">
            <SpaceSwitcher collapsed />
          </div>
        ) : (
          <div className="-mx-3 px-3 pb-3 border-b border-stroke">
            <div className="-mx-3 px-3 pb-3 border-b border-stroke">
              <SpaceSwitcher />
            </div>
            <div className="pt-3">
              <SidebarActions />
            </div>
          </div>
        )}

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
              {unsectioned.map((database) => (
                <DatabaseItem spaceId={space!.id} key={database.id} database={database} collapsed />
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
              <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
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
                <SortableContext items={unsectioned.map((database) => database.id)} strategy={verticalListSortingStrategy}>
                  {unsectioned.map((database) => (
                    <DatabaseItem spaceId={space!.id} key={database.id} database={database} sectionId={null} />
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
      </aside>

      <div
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        className="absolute -right-2 inset-y-0 w-4 z-10 cursor-pointer group flex items-center justify-center"
      >
        <span className="w-0.5 h-8 rounded-full bg-stroke opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150" />
      </div>
    </div>
  );
}
