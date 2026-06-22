"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/primitives/display/skeleton";

interface SidebarProps {
  initialCollapsed?: boolean;
  initialExpandedSections?: string[];
  initialWidth?: number;
}

export function Sidebar({ initialCollapsed = false, initialExpandedSections = [], initialWidth = 250 }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const { space, isLoading } = useAppContext();
  const { collapsed, toggle, setCollapsedState, expandedSections, toggleSection, setExpandedSectionsState, isMounted, width, changeWidth } =
    useSidebarState(initialCollapsed, initialExpandedSections, initialWidth);

  useEffect(() => {
    if (space?.sections && isMounted && localStorage.getItem("sidebar-expanded-sections") === null) {
      const allSectionIds = space.sections.map((s) => s.id);
      setExpandedSectionsState(allSectionIds);
    }
  }, [space, isMounted, setExpandedSectionsState]);

  const { contentRef, sensors, verticalOnly, collisionDetection, activeDrag, handleDragStart, handleDragCancel, handleDragEnd } =
    useSidebarDnd();
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (pointerDownEvent: React.PointerEvent) => {
    pointerDownEvent.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const startX = pointerDownEvent.clientX;
    const startWidth = collapsed ? 56 : width;
    let hasMoved = false;

    const doResize = (pointerMoveEvent: PointerEvent) => {
      const deltaX = pointerMoveEvent.clientX - startX;
      if (Math.abs(deltaX) > 4) {
        hasMoved = true;
      }

      const newWidth = startWidth + deltaX;

      if (newWidth >= 150) {
        if (collapsed) {
          setCollapsedState(false);
        }
        changeWidth(newWidth);
      } else {
        setCollapsedState(true);
      }
    };

    const stopResize = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", doResize);
      window.removeEventListener("pointerup", stopResize);

      if (!hasMoved) {
        toggle();
      }
    };

    window.addEventListener("pointermove", doResize);
    window.addEventListener("pointerup", stopResize);
  };

  const sections = space?.sections ?? [];
  const sectionedIds = new Set(sections.flatMap((section) => (section.databases ?? []).map((database) => database.id)));
  const unsectioned = (space?.databases ?? []).filter((database) => !sectionedIds.has(database.id));

  return (
    <div className="relative shrink-0 h-full">
      <aside
        style={{ width: collapsed ? 56 : width }}
        className={`${collapsed ? "collapsed" : ""} group/sidebar border-r border-stroke px-3 pt-3 pb-6 flex flex-col gap-4 overflow-hidden${isMounted && !isResizing ? " transition-[width] duration-150" : ""} h-full`}
      >
        {isLoading ? (
          <SidebarSkeletonContent collapsed={collapsed} />
        ) : (
          <>
            <div className="-mx-3 px-3 pb-3 border-b border-stroke">
              <div className="-mx-3 px-3 pb-3 border-b border-stroke">
                <SpaceSwitcher collapsed={collapsed} />
              </div>
              <div className="pt-3">
                <SidebarActions collapsed={collapsed} />
              </div>
            </div>

            <div
              ref={contentRef}
              className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
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
                      collapsed={collapsed}
                      isExpanded={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                    />
                  ))}
                </SortableContext>
                <UnsectionedDropZone>
                  <SortableContext items={unsectioned.map((database) => database.id)} strategy={verticalListSortingStrategy}>
                    {unsectioned.map((database) => (
                      <DatabaseItem spaceId={space!.id} key={database.id} database={database} sectionId={null} collapsed={collapsed} />
                    ))}
                  </SortableContext>
                </UnsectionedDropZone>
                <SidebarDragOverlay
                  activeDrag={activeDrag}
                  sections={sections}
                  unsectioned={unsectioned}
                  expandedSections={expandedSections}
                />
              </DndContext>
            </div>
          </>
        )}
      </aside>

      <div
        onPointerDown={startResize}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        className="absolute -right-2 inset-y-0 w-4 z-10 cursor-col-resize group flex items-center justify-center"
      >
        <span className="w-0.5 h-8 rounded-full bg-stroke opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150" />
      </div>
    </div>
  );
}

function SidebarSkeletonContent({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <>
        <div className="flex justify-center pb-3 -mx-3 border-b border-stroke">
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col items-center gap-0.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-center py-1 px-2 rounded-lg">
                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="-mx-3 px-3 pb-3 border-b border-stroke">
        <div className="-mx-3 px-3 pb-3 border-b border-stroke">
          <div className="flex items-center w-full px-2 py-2 rounded-lg bg-surface">
            <div className="flex items-center gap-1.5 flex-1">
              <Skeleton className="w-4 h-4 rounded shrink-0" />
              <Skeleton className="h-2.5 w-24 rounded-full" />
            </div>
            <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          </div>
        </div>
        <div className="pt-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
            <Skeleton className="h-2.5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
            <Skeleton className="h-2.5 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-3">
          {[1, 2].map((section) => (
            <div key={section} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 px-2 py-1">
                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                <Skeleton className="w-4 h-4 rounded shrink-0 ml-0.5" />
                <Skeleton className="h-2 w-24 rounded-full ml-0.5" />
                <Skeleton className="w-[26px] h-[26px] rounded-lg ml-auto shrink-0" />
              </div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {[1, 2].map((database) => (
                  <div key={database} className="flex items-center gap-2 py-1 pl-5 pr-2">
                    <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                    <Skeleton className="h-2.5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-0.5 mt-2">
            <div className="flex items-center gap-2 py-1 px-2">
              <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
              <Skeleton className="h-2.5 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-2 py-1 px-2">
              <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
              <Skeleton className="h-2.5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
