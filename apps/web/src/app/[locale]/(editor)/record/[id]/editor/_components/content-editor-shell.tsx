"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { contentEditorCollision } from "@/lib/dnd";
import { isDrop } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import type { ActiveDragData } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { ContentCanvas } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/content-canvas";
import { ContentComponent } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/content-component";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { EditorSidebar, EditorDragOverlay, type PanelDragData } from "./editor-sidebar";
import { EditorRightPanel, type SelectedElement } from "./editor-right-panel";

interface ContentEditorShellProps {
  editor: ContentEditorState;
  hasChanges: boolean;
  backHref: string;
  backAriaLabel: string;
  entityIcon: React.ReactNode;
  entityName: string;
  badgeLabel: string;
  onDone: () => Promise<void>;
  isDonePending: boolean;
  recordId?: string;
  templateId?: string;
  autoSwitchToStructure?: boolean;
}

export function ContentEditorShell({
  editor,
  hasChanges,
  backHref,
  backAriaLabel,
  entityIcon,
  entityName,
  badgeLabel,
  onDone,
  isDonePending,
  recordId,
  templateId,
  autoSwitchToStructure,
}: ContentEditorShellProps) {
  const router = useRouter();
  const t = useTranslations("RecordPage");

  const [showExitModal, setShowExitModal] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;

  useEffect(() => {
    history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (hasChangesRef.current) {
        history.pushState(null, "", window.location.href);
        setShowExitModal(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [activeDragData, setActiveDragData] = useState<PanelDragData | ActiveDragData | null>(null);
  const isDraggingPanelRow = activeDragData?.dragType === "panel-row";

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"library" | "layout" | "structure" | "history">("layout");
  const [selection, setSelection] = useState<SelectedElement>(null);

  function handleBackClick() {
    if (hasChanges) {
      setShowExitModal(true);
    } else {
      router.push(backHref);
    }
  }

  function handleDiscard() {
    setIsDiscarding(true);
    router.push(backHref);
  }

  async function handleSaveAndExit() {
    setShowExitModal(false);
    await onDone();
  }

  const onSelectComponent = useCallback(
    (id: string, type: ContentComponentType) => {
      setSelection({ kind: "component", id, componentType: type });
      setRightOpen(true);
      if (autoSwitchToStructure) {
        setLeftOpen(true);
        setActiveTab("structure");
      }
    },
    [autoSwitchToStructure],
  );

  const onSelectRow = useCallback(
    (id: string) => {
      setSelection({ kind: "row", id });
      setRightOpen(true);
      if (autoSwitchToStructure) {
        setLeftOpen(true);
        setActiveTab("structure");
      }
    },
    [autoSwitchToStructure],
  );

  const onSelectColumn = useCallback(
    (rowId: string, columnId: string) => {
      setSelection({ kind: "column", rowId, columnId });
      setRightOpen(true);
      if (autoSwitchToStructure) {
        setLeftOpen(true);
        setActiveTab("structure");
      }
    },
    [autoSwitchToStructure],
  );

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

    if (activeData?.dragType === "panel-row") {
      if (isDrop(overData, "row-insert")) {
        editor.onAddRowWithColumns((activeData as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount, overData.insertIndex);
        return;
      }
      if (isDrop(overData, "canvas-end")) {
        editor.onAddRowWithColumns((activeData as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount);
        return;
      }
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

  const selectedId =
    selection?.kind === "component"
      ? selection.id
      : selection?.kind === "row"
        ? selection.id
        : selection?.kind === "column"
          ? selection.columnId
          : undefined;

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={contentEditorCollision} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-full bg-canvas">
          <header className="flex items-center justify-between px-5 h-12 border-b border-stroke shrink-0 bg-canvas">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackClick}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
                aria-label={backAriaLabel}
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-ink-muted">{entityIcon}</span>
                <span className="text-sm font-semibold text-ink truncate max-w-[320px]">{entityName}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-ink-muted px-1.5 py-0.5 bg-surface border border-stroke rounded">
                  {badgeLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onDone}
              disabled={isDonePending}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-stroke text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50"
            >
              {isDonePending ? "..." : t("done")}
            </button>
          </header>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            <EditorSidebar
              recordId={recordId}
              editor={editor}
              onSelectRow={onSelectRow}
              onSelectColumn={onSelectColumn}
              onSelectComponent={onSelectComponent}
              selectedId={selectedId}
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
                templateId={templateId}
                isDraggingPanelRow={isDraggingPanelRow}
                isEditing
                selectedId={selectedId}
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

      <ModalShell
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={t("exitConfirmTitle")}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border border-stroke text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors duration-150"
            >
              {t("exitStay")}
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isDiscarding}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border border-stroke text-error hover:bg-error-bg transition-colors duration-150 disabled:opacity-50"
            >
              {t("exitDiscard")}
            </button>
            <button
              type="button"
              onClick={handleSaveAndExit}
              disabled={isDonePending}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
            >
              {isDonePending ? "..." : t("exitSaveAndLeave")}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-secondary">{t("exitConfirmDesc")}</p>
      </ModalShell>
    </>
  );
}
