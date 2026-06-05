import { useAppContext } from "@/context/app-context";
import { updateDatabase } from "@/lib/api/database";
import { updateSpace } from "@/lib/api/space";
import {
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { SectionResponseDto } from "@fixspace/domain";
import { useMemo, useRef, useState } from "react";

const collisionDetection: CollisionDetection = (args) => {
  const activeType = (args.active.data.current as { type?: string } | undefined)?.type;

  if (activeType === "section") {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => container.data?.current?.type === "section"),
    });
  }

  const hits = pointerWithin(args);
  const dbHits = hits.filter((container) => container.data?.current?.type === "database");
  if (dbHits.length > 0) return dbHits;
  if (hits.length > 0) return hits;
  return closestCenter(args);
};

export function useSidebarDnd() {
  const { space, reorderSections, reorderDatabasesInSection, moveDatabaseToSection } = useAppContext();

  const contentRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<{ id: string; type: "section" | "database" } | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type?: "section" | "database" } | undefined;
    if (data?.type) {
      setActiveDrag({ id: event.active.id as string, type: data.type });
    }
  }

  function handleDragCancel() {
    setActiveDrag(null);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const verticalOnly = useMemo<Modifier>(
    () =>
      ({ transform, draggingNodeRect }) => {
        const newTransform = { ...transform, x: 0 };
        const container = contentRef.current;
        if (!container || !draggingNodeRect) return newTransform;
        const rect = container.getBoundingClientRect();
        const minY = rect.top - draggingNodeRect.top;
        const maxY = rect.bottom - draggingNodeRect.bottom;
        return { ...newTransform, y: Math.min(Math.max(newTransform.y, minY), maxY) };
      },
    [],
  );

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over || !space) return;

    const sections = space?.sections ?? [];
    const sectionedIds = new Set(sections.flatMap((section) => (section.databases ?? []).map((database) => database.id)));
    const unsectioned = (space?.databases ?? []).filter((database) => !sectionedIds.has(database.id));

    const activeData = active.data.current as { type: string; sectionId?: string | null } | undefined;
    const overData = over.data.current as { type: string; sectionId?: string | null } | undefined;

    if (activeData?.type === "section" && overData?.type === "section") {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(sections, oldIndex, newIndex);
        reorderSections(reordered);
        updateSpace(space.id, {
          sectionOperations: reordered.map((section: SectionResponseDto, index: number) => ({
            operation: "UPDATE" as const,
            id: section.id,
            update: { position: index },
          })),
        }).catch(() => reorderSections(sections));
      }
      return;
    }

    if (activeData?.type !== "database") return;

    const sourceSectionId = activeData.sectionId ?? null;

    if (overData?.type === "database") {
      const targetSectionId = overData.sectionId ?? null;

      if (sourceSectionId === targetSectionId) {
        const databases =
          sourceSectionId === null ? unsectioned : (sections.find((section) => section.id === sourceSectionId)?.databases ?? []);
        const oldIndex = databases.findIndex((database) => database.id === active.id);
        const newIndex = databases.findIndex((database) => database.id === over.id);
        if (oldIndex !== newIndex) {
          reorderDatabasesInSection(sourceSectionId, arrayMove(databases, oldIndex, newIndex));
        }
      } else {
        moveDatabaseToSection(active.id as string, targetSectionId);
        updateDatabase(space.id, active.id as string, { sectionId: targetSectionId }).catch(() =>
          moveDatabaseToSection(active.id as string, sourceSectionId),
        );
      }
    } else if (overData?.type === "section") {
      const targetSectionId = over.id as string;
      if (targetSectionId !== sourceSectionId) {
        moveDatabaseToSection(active.id as string, targetSectionId);
        updateDatabase(space.id, active.id as string, { sectionId: targetSectionId }).catch(() =>
          moveDatabaseToSection(active.id as string, sourceSectionId),
        );
      }
    } else if (overData?.type === "unsectioned") {
      if (sourceSectionId !== null) {
        moveDatabaseToSection(active.id as string, null);
        updateDatabase(space.id, active.id as string, { sectionId: null }).catch(() =>
          moveDatabaseToSection(active.id as string, sourceSectionId),
        );
      }
    }
  }

  return {
    contentRef,
    sensors,
    verticalOnly,
    collisionDetection,
    activeDrag,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
