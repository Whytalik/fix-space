"use client";

import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ContentComponentType } from "@fixspace/domain";
import {
  Type,
  Heading as HeadingIcon,
  ImageIcon,
  LayoutGrid,
  Component,
  History,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  Library,
  Eye,
  Minus,
} from "lucide-react";
import { useRecordContentSnapshotsQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import dayjs from "dayjs";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import type { RecordContentSnapshotResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { SnapshotPreviewModal } from "./snapshot-preview-modal";
import type { ActiveDragData } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import { RowPreviewIcon } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/row-preview-icon";

export type PanelDragData =
  | { dragType: "panel-component"; componentType: ContentComponentType }
  | { dragType: "panel-row"; columnCount: 1 | 2 | 3 | 4 | 5 };

type SidebarTab = "library" | "layout" | "structure" | "history";

interface DraggableItemProps {
  id: string;
  data: PanelDragData;
  children: React.ReactNode;
}

function DraggableItem({ id, data, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing select-none
        hover:bg-surface-hover transition-colors duration-150 text-ink-secondary hover:text-ink
        ${isDragging ? "opacity-40 ring-1 ring-accent" : ""}`}
    >
      {children}
    </div>
  );
}

function LayoutTab() {
  const t = useTranslations("RecordPage.layout");
  return (
    <div className="space-y-1">
      <p className="px-2 py-2 text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("rowLayouts")}</p>
      {([1, 2, 3, 4, 5] as const).map((cols) => (
        <DraggableItem key={cols} id={`panel-row-${cols}`} data={{ dragType: "panel-row", columnCount: cols }}>
          <RowPreviewIcon columns={cols} />
          <span className="text-xs font-medium">{t("columns", { count: cols })}</span>
        </DraggableItem>
      ))}
    </div>
  );
}

function LibraryTab() {
  const tElements = useTranslations("RecordPage.elements");

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-1">
        <p className="px-2 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider">{tElements("contentElements")}</p>
        {[
          { type: ContentComponentType.TEXT, icon: <Type size={14} />, label: tElements("textBlock") },
          { type: ContentComponentType.HEADING, icon: <HeadingIcon size={14} />, label: tElements("heading1") },
          { type: ContentComponentType.IMAGE, icon: <ImageIcon size={14} />, label: tElements("imageMedia") },
          { type: ContentComponentType.DIVIDER, icon: <Minus size={14} />, label: "Divider" },
        ].map(({ type, icon, label }) => (
          <DraggableItem key={type} id={`panel-component-${type}`} data={{ dragType: "panel-component", componentType: type }}>
            <span className="shrink-0 text-ink-muted">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </DraggableItem>
        ))}
      </div>
    </div>
  );
}

function StructureTab({
  editor,
  onSelectRow,
  onSelectColumn,
  onSelectComponent,
  selectedId,
}: {
  editor: ContentEditorState;
  onSelectRow: (id: string) => void;
  onSelectColumn: (rowId: string, colId: string) => void;
  onSelectComponent: (id: string, type: ContentComponentType) => void;
  selectedId?: string;
}) {
  const t = useTranslations("RecordPage.structure");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedId) return;

    setExpandedIds((prev) => {
      const newExpanded = new Set(prev);
      let found = false;

      for (const row of editor.content.rows) {
        if (row.id === selectedId) {
          found = true;
          break;
        }
        for (const column of row.columns) {
          if (column.id === selectedId) {
            newExpanded.add(row.id);
            found = true;
            break;
          }
          const inColumn = column.children.some((c) => c.id === selectedId);
          if (inColumn) {
            newExpanded.add(row.id);
            newExpanded.add(column.id);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      return found ? newExpanded : prev;
    });
  }, [selectedId, editor.content.rows]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-0.5">
      {editor.content.rows.map((row, rIdx) => {
        const isRowExpanded = expandedIds.has(row.id);
        return (
          <div key={row.id} className="flex flex-col gap-0.5">
            <button
              onClick={() => onSelectRow(row.id)}
              className={`w-full group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 ${selectedId === row.id ? "bg-accent/10 text-accent font-semibold" : "text-ink hover:bg-surface-hover"}`}
            >
              <span onClick={(e) => toggleExpand(e, row.id)} className="p-0.5 hover:bg-canvas-subtle rounded text-ink-muted">
                {isRowExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
              <LayoutGrid size={12} className="shrink-0 opacity-50" />
              <span className="truncate">
                {t("row")} {rIdx + 1}
              </span>
            </button>

            {isRowExpanded && (
              <div className="ml-4 pl-2 border-l border-stroke flex flex-col gap-0.5 mt-0.5 mb-1">
                {row.columns.map((column, cIdx) => {
                  const isColumnExpanded = expandedIds.has(column.id);
                  const hasChildren = column.children.length > 0;

                  return (
                    <div key={column.id} className="flex flex-col gap-0.5">
                      <button
                        onClick={() => onSelectColumn(row.id, column.id)}
                        className={`w-full group flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors duration-150 ${selectedId === column.id ? "bg-accent/10 text-accent font-semibold" : "text-ink-secondary hover:text-ink hover:bg-surface-hover"}`}
                      >
                        {hasChildren ? (
                          <span onClick={(e) => toggleExpand(e, column.id)} className="p-0.5 hover:bg-canvas-subtle rounded text-ink-muted">
                            {isColumnExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          </span>
                        ) : (
                          <div className="w-4" />
                        )}
                        <div className="w-3 h-3 rounded-sm bg-current opacity-20 shrink-0" />
                        <span className="truncate">
                          {t("column")} {cIdx + 1}
                        </span>
                      </button>

                      {isColumnExpanded && (
                        <div className="ml-3 border-l border-stroke/50 flex flex-col gap-0.5">
                          {column.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onSelectComponent(child.id, child.type)}
                              className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] transition-colors duration-150 ${selectedId === child.id ? "bg-accent/10 text-accent font-semibold" : "text-ink-muted hover:text-ink-secondary hover:bg-surface-hover"}`}
                            >
                              <div className="w-4 shrink-0" />
                              <Component size={10} className="shrink-0 opacity-40" />
                              <span className="truncate">{child.type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {editor.content.rows.length === 0 && <p className="py-8 text-center text-xs text-ink-muted italic">{t("empty")}</p>}
    </div>
  );
}

function HistoryTab({ recordId, editor }: { recordId: string; editor: ContentEditorState }) {
  const t = useTranslations("RecordPage");
  const { data: snapshots, isLoading } = useRecordContentSnapshotsQuery(recordId);
  const { restoreMutation } = useRecordContentMutations(recordId);
  const [previewSnapshot, setPreviewSnapshot] = useState<RecordContentSnapshotResponseDto | null>(null);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!snapshots?.length) {
    return <p className="px-3 py-4 text-xs text-ink-muted italic text-center">{t("noHistory")}</p>;
  }

  return (
    <div className="space-y-1">
      {snapshots.map((snapshot) => (
        <div
          key={snapshot.id}
          className="group flex items-start justify-between gap-2 px-3 py-2 rounded-2xl hover:bg-surface-hover transition-colors duration-150"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink">{dayjs(snapshot.createdAt).format("DD MMM, HH:mm")}</p>
            <p className="text-[10px] text-ink-muted">
              {snapshot.content.rows.length} {t("rows")}
            </p>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setPreviewSnapshot(snapshot)}
              title={t("viewVersion")}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-canvas-subtle rounded-lg transition-all duration-150"
            >
              <Eye size={12} />
            </button>
            <button
              type="button"
              onClick={() => restoreMutation.mutate(snapshot.id)}
              disabled={restoreMutation.isPending}
              title={t("restore")}
              className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-all duration-150"
            >
              {restoreMutation.isPending ? <Spinner size="sm" /> : <RotateCcw size={12} />}
            </button>
          </div>
        </div>
      ))}

      {previewSnapshot && (
        <SnapshotPreviewModal
          isOpen={!!previewSnapshot}
          onClose={() => setPreviewSnapshot(null)}
          snapshot={previewSnapshot}
          currentContent={editor.content}
          isRestoring={restoreMutation.isPending}
          onRestore={() => {
            restoreMutation.mutate(previewSnapshot.id);
            setPreviewSnapshot(null);
          }}
        />
      )}
    </div>
  );
}

interface EditorSidebarProps {
  recordId?: string;
  templateId?: string;
  editor?: ContentEditorState;
  onSelectRow?: (id: string) => void;
  onSelectColumn?: (rowId: string, colId: string) => void;
  onSelectComponent?: (id: string, type: ContentComponentType) => void;
  selectedId?: string;
  isOpen: boolean;
  onToggle: (tab?: SidebarTab) => void;
  activeTab: SidebarTab;
}

export function EditorSidebar({
  recordId,
  editor,
  onSelectRow,
  onSelectColumn,
  onSelectComponent,
  selectedId,
  isOpen,
  onToggle,
  activeTab,
}: EditorSidebarProps) {
  const t = useTranslations("RecordPage.tabs");

  const TABS_LOCALIZED: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: "library", icon: <Library size={18} />, label: t("elements") },
    { id: "layout", icon: <LayoutGrid size={18} />, label: t("add") },
    { id: "structure", icon: <Layers size={18} />, label: t("structure") },
    { id: "history", icon: <History size={18} />, label: t("history") },
  ].filter((tab) => tab.id !== "history" || !!recordId) as { id: SidebarTab; icon: React.ReactNode; label: string }[];

  return (
    <div className="flex h-full bg-canvas">
      <div className="w-12 flex flex-col items-center py-4 gap-4 border-r border-stroke shrink-0">
        {TABS_LOCALIZED.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onToggle(tab.id)}
            title={tab.label}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
              ${isOpen && activeTab === tab.id ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-surface-hover"}`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="w-56 flex flex-col min-w-0 bg-canvas border-r border-stroke">
          <div className="px-4 py-3 border-b border-stroke flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              {TABS_LOCALIZED.find((t) => t.id === activeTab)?.label}
            </span>
            <button
              onClick={() => onToggle()}
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 p-2 no-scrollbar">
            {activeTab === "library" && <LibraryTab />}
            {activeTab === "layout" && <LayoutTab />}
            {activeTab === "structure" && editor && onSelectRow && onSelectColumn && onSelectComponent && (
              <StructureTab
                editor={editor}
                onSelectRow={onSelectRow}
                onSelectColumn={onSelectColumn}
                onSelectComponent={onSelectComponent}
                selectedId={selectedId}
              />
            )}
            {activeTab === "history" && recordId && editor && <HistoryTab recordId={recordId} editor={editor} />}
          </div>
        </div>
      )}
    </div>
  );
}

const COMPONENT_META: Record<string, { icon: React.ReactNode; label: string }> = {
  [ContentComponentType.TEXT]: { icon: <Type size={13} />, label: "Text" },
  [ContentComponentType.HEADING]: { icon: <HeadingIcon size={13} />, label: "Heading" },
  [ContentComponentType.IMAGE]: { icon: <ImageIcon size={13} />, label: "Image" },
  [ContentComponentType.DIVIDER]: { icon: <Minus size={13} />, label: "Divider" },
};

export function EditorDragOverlay({ data }: { data: PanelDragData | ActiveDragData | null }) {
  if (!data) return null;

  if (data.dragType === "panel-component" && "componentType" in data) {
    const { icon, label } = COMPONENT_META[data.componentType as string] || { icon: <Component size={13} />, label: "Element" };
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        {icon}
        {label}
      </div>
    );
  }

  if (data.dragType === "component" && "componentType" in data) {
    const componentType = (data as ActiveDragData).componentType;
    const { icon, label } = (componentType && COMPONENT_META[componentType]) || { icon: <Component size={13} />, label: "Element" };
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium opacity-90 scale-95 ring-2 ring-accent">
        {icon}
        {label}
      </div>
    );
  }

  if (data.dragType === "panel-row" && "columnCount" in data) {
    const columnCount = (data as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        <RowPreviewIcon columns={columnCount} />
        {columnCount}-column row
      </div>
    );
  }

  return null;
}
