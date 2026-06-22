"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useState } from "react";
import type { ContentEditorState } from "./lib/use-content-editor";
import { isDrop } from "./lib/dnd-types";
import { ContentCanvas } from "./nodes/content-canvas";
import { ContentPanel, PanelDragOverlay, type PanelDragData } from "./nodes/content-panel";
import { ComponentDragOverlay } from "./nodes/content-component";
import type { ContentComponentNode } from "@fixspace/domain";

const contentAreaCollision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (hits.length > 0) return hits;
  return closestCenter(args);
};

interface ContentAreaProps {
  editor: ContentEditorState;
  recordId?: string;
  mode?: "edit" | "view";
}

function ViewContentArea({ editor, recordId }: { editor: ContentEditorState; recordId?: string }) {
  if (editor.content.rows.length === 0) {
    return null;
  }

  return (
    <DndContext>
      <ContentCanvas editor={editor} recordId={recordId} isEditing={false} />
    </DndContext>
  );
}

function findComponentById(content: ContentEditorState["content"], id: string): ContentComponentNode | null {
  for (const row of content.rows) {
    for (const column of row.columns) {
      const found = column.children.find((c) => c.id === id);
      if (found) return found;
    }
  }
  return null;
}

export function ContentArea({ editor, recordId, mode = "edit" }: ContentAreaProps) {
  const [activeDragData, setActiveDragData] = useState<PanelDragData | { dragType: "component"; componentId: string } | null>(null);

  const isDraggingPanelRow = activeDragData?.dragType === "panel-row";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (editor.isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <PageLoader />
      </div>
    );
  }

  if (mode === "view") {
    return <ViewContentArea editor={editor} recordId={recordId} />;
  }

  const handleDragStart = (event: DragStartEvent) => {
    const raw = event.active.data.current as Record<string, unknown> | undefined;
    const dragType = raw?.dragType as string | undefined;
    if (dragType === "panel-component" || dragType === "panel-row") {
      setActiveDragData(raw as unknown as PanelDragData);
    } else if (dragType === "component" && typeof raw?.componentId === "string") {
      setActiveDragData({ dragType: "component", componentId: raw.componentId });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as PanelDragData | { dragType: "row" } | undefined;
    const overData = over.data.current as Record<string, unknown> | undefined;

    if (activeData?.dragType === "row" && overData && overData.dragType === "row") {
      const fromIndex = editor.content.rows.findIndex((r) => r.id === active.id);
      const toIndex = editor.content.rows.findIndex((r) => r.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        editor.onMoveRow(fromIndex, toIndex);
      }
      return;
    }

    if (activeData?.dragType === "panel-component") {
      if (isDrop(overData, "column")) {
        editor.onAddComponent(overData.rowId, overData.columnId, activeData.componentType!);
        return;
      }
    }

    if (activeData?.dragType === "panel-row") {
      if (isDrop(overData, "row-insert")) {
        editor.onAddRowWithColumns(activeData.columnCount, overData.insertIndex);
        return;
      }

      if (isDrop(overData, "canvas-end")) {
        editor.onAddRowWithColumns(activeData.columnCount);
        return;
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={contentAreaCollision} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex rounded-2xl border border-stroke overflow-hidden min-h-[300px]">
        <ContentPanel />
        <div className="flex-1 min-w-0 overflow-y-auto">
          <ContentCanvas editor={editor} recordId={recordId} isDraggingPanelRow={isDraggingPanelRow} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {(() => {
          if (!activeDragData) return null;
          if (activeDragData.dragType === "component") {
            const comp = findComponentById(editor.content, activeDragData.componentId);
            return comp ? <ComponentDragOverlay component={comp} /> : null;
          }
          return <PanelDragOverlay data={activeDragData as PanelDragData} />;
        })()}
      </DragOverlay>
    </DndContext>
  );
}
