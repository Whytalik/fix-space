"use client";

import { useParams, useRouter } from "next/navigation";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { useRecordContentQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { useContentEditor } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { ContentCanvas } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/content-canvas";
import { EditorSidebar, EditorDragOverlay, type PanelDragData } from "./_components/editor-sidebar";
import type { ActiveDragData } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import { EditorRightPanel, type SelectedElement } from "./_components/editor-right-panel";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Link } from "@/i18n/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { ContentComponentType } from "@fixspace/domain";
import { isDrop } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import { ContentComponent } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/content-component";
import { contentEditorCollision } from "@/lib/dnd";

export type { SelectedElement };

export default function ContentEditorPage() {
  const params = useParams<{ id: string }>();
  const recordId = params.id;
  const router = useRouter();
  const t = useTranslations("RecordPage");

  const { data: record, isLoading: isRecordLoading } = useRecordQuery(recordId);
  const { data: serverContent, isLoading: isContentLoading } = useRecordContentQuery(recordId);
  const { updateMutation } = useRecordContentMutations(recordId);

  const editor = useContentEditor({
    initialContent: serverContent?.content,
    isLoading: isContentLoading,
    onSave: (content) => updateMutation.mutate({ content }),
  });

  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);

  async function handleDone() {
    setIsSavingAndLeaving(true);
    try {
      await updateMutation.mutateAsync({ content: editor.content, forceSnapshot: true });
      router.push(`/record/${recordId}`);
    } catch {
      setIsSavingAndLeaving(false);
    }
  }

  const [activeDragData, setActiveDragData] = useState<PanelDragData | ActiveDragData | null>(null);
  const isDraggingPanelRow = activeDragData?.dragType === "panel-row";

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"library" | "layout" | "structure" | "history">("library");
  const [selection, setSelection] = useState<SelectedElement>(null);

  const onSelectComponent = useCallback((id: string, type: ContentComponentType) => {
    setSelection({ kind: "component", id, componentType: type });
    setRightOpen(true);
    setLeftOpen(true);
    setActiveTab("structure");
  }, []);

  const onSelectRow = useCallback((id: string) => {
    setSelection({ kind: "row", id });
    setRightOpen(true);
    setLeftOpen(true);
    setActiveTab("structure");
  }, []);

  const onSelectColumn = useCallback((rowId: string, columnId: string) => {
    setSelection({ kind: "column", rowId, columnId });
    setRightOpen(true);
    setLeftOpen(true);
    setActiveTab("structure");
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data) setActiveDragData(data as PanelDragData | ActiveDragData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as ActiveDragData | PanelDragData | undefined;
    const overData = over.data.current as Record<string, unknown> | undefined;

    if (activeData?.dragType === "component" && overData) {
      editor.onMoveContentItem(active.id as string, over.id as string, activeData, overData);
      return;
    }

    if (activeData?.dragType === "row" && overData && overData.dragType === "row") {
      const fromIndex = editor.content.rows.findIndex((r) => r.id === active.id);
      const toIndex = editor.content.rows.findIndex((r) => r.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        editor.onMoveRow(fromIndex, toIndex);
      }
      return;
    }

    if (activeData?.dragType === "panel-component") {
      let targetRowId = "";
      let targetColId = "";
      let overId: string | undefined = undefined;

      if (isDrop(overData, "column")) {
        targetRowId = overData.rowId;
        targetColId = overData.columnId;
      } else if (overData?.dragType === "component") {
        targetRowId = (overData.rowId as string) ?? "";
        targetColId = (overData.columnId as string) ?? "";
        overId = over.id as string;
      }

      if (targetRowId && targetColId) {
        editor.onAddComponent(
          targetRowId,
          targetColId,
          (activeData as Extract<PanelDragData, { dragType: "panel-component" }>).componentType,
          overId,
        );
        return;
      }
    }

    if (activeData?.dragType === "panel-row" && isDrop(overData, "row-insert")) {
      editor.onAddRowWithColumns((activeData as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount, overData.insertIndex);
      return;
    }

    if (activeData?.dragType === "panel-row" && isDrop(overData, "canvas-end")) {
      editor.onAddRowWithColumns((activeData as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount);
      return;
    }
  };

  const renderDragOverlay = () => {
    if (!activeDragData) return null;

    if (activeDragData.dragType === "component") {
      let componentNode = null;
      for (const row of editor.content.rows) {
        for (const column of row.columns) {
          const found = column.children.find((c) => c.id === activeDragData.id);
          if (found) {
            componentNode = found;
            break;
          }
        }
      }

      if (componentNode) {
        return (
          <div className="w-[300px] opacity-80 pointer-events-none ring-2 ring-accent rounded-lg bg-canvas shadow-2xl">
            <ContentComponent component={componentNode} isEditing={false} onDelete={() => {}} onUpdateData={() => {}} />
          </div>
        );
      }
    }

    return <EditorDragOverlay data={activeDragData} />;
  };

  if (isRecordLoading || isContentLoading) {
    return <PageLoader />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={contentEditorCollision} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-canvas">
        <header className="flex items-center justify-between px-5 h-12 border-b border-stroke shrink-0 bg-canvas">
          <div className="flex items-center gap-3">
            <Link
              href={`/record/${recordId}`}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
              aria-label={t("backToRecord")}
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-ink-muted">
                {record?.icon ? <IconDisplay value={record.icon} size={18} /> : <FileText size={18} />}
              </span>
              <span className="text-sm font-semibold text-ink truncate max-w-[320px]">{record?.name || t("untitled")}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted px-1.5 py-0.5 bg-surface border border-stroke rounded">
                {t("contentEditor")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDone}
            disabled={isSavingAndLeaving}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-stroke text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50"
          >
            {isSavingAndLeaving ? "..." : t("done")}
          </button>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <EditorSidebar
            recordId={recordId}
            editor={editor}
            onSelectRow={onSelectRow}
            onSelectColumn={onSelectColumn}
            onSelectComponent={onSelectComponent}
            selectedId={
              selection?.kind === "component"
                ? selection.id
                : selection?.kind === "row"
                  ? selection.id
                  : selection?.kind === "column"
                    ? selection.columnId
                    : undefined
            }
            isOpen={leftOpen}
            activeTab={activeTab}
            onToggle={(tab) => {
              if (tab) {
                if (activeTab === tab && leftOpen) setLeftOpen(false);
                else {
                  setActiveTab(tab);
                  setLeftOpen(true);
                }
              } else {
                setLeftOpen(!leftOpen);
              }
            }}
          />

          <main
            className="flex-1 overflow-y-auto no-scrollbar"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelection(null);
            }}
          >
            <ContentCanvas
              editor={editor}
              recordId={recordId}
              isDraggingPanelRow={isDraggingPanelRow}
              isEditing
              selectedId={
                selection?.kind === "component"
                  ? selection.id
                  : selection?.kind === "row"
                    ? selection.id
                    : selection?.kind === "column"
                      ? selection.columnId
                      : undefined
              }
              onSelectComponent={onSelectComponent}
              onSelectRow={onSelectRow}
              onSelectColumn={onSelectColumn}
            />
          </main>

          <EditorRightPanel
            selection={selection}
            editor={editor}
            isOpen={rightOpen}
            onToggle={() => setRightOpen(!rightOpen)}
            onResetSelection={() => setSelection(null)}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
}
