"use client";

import { useDroppable } from "@dnd-kit/core";
import { ContentRow } from "./content-row";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ContentComponentType } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

interface ContentCanvasProps {
  editor: ContentEditorState;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  isDraggingPanelRow?: boolean;
  selectedId?: string;
  onSelectComponent?: (id: string, type: ContentComponentType) => void;
  onSelectRow?: (id: string) => void;
  onSelectColumn?: (rowId: string, columnId: string) => void;
}

function RowInsertZone({ index, isVisible, t }: { index: number; isVisible: boolean; t: (key: string) => string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${index}`,
    data: { dropType: "row-insert", insertIndex: index },
    disabled: !isVisible,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors duration-150 rounded-2xl ${
        isVisible
          ? isOver
            ? "h-14 my-2 border-2 border-dashed border-accent bg-accent/8 flex items-center justify-center"
            : "h-3 my-1 border border-dashed border-stroke/50"
          : "h-2 pointer-events-none"
      }`}
    >
      {isVisible && isOver && <span className="text-xs font-medium text-accent select-none">{t("dropRowHere")}</span>}
    </div>
  );
}

export function ContentCanvas({
  editor,
  recordId,
  templateId,
  isEditing,
  isDraggingPanelRow,
  selectedId,
  onSelectComponent,
  onSelectRow,
  onSelectColumn,
}: ContentCanvasProps) {
  const t = useTranslations("RecordPage.canvas");

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-end",
    data: { dropType: "canvas-end" },
  });

  return (
    <div className={`${isEditing ? "p-8 bg-surface" : "py-8 bg-canvas"} min-h-full flex flex-col`}>
      <div className="w-full flex-1">
        <SortableContext items={editor.content.rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {isEditing && <RowInsertZone index={0} isVisible={isDraggingPanelRow ?? false} t={t} />}
          {editor.content.rows.map((row, rowIdx) => (
            <Fragment key={row.id}>
              <ContentRow
                row={row}
                recordId={recordId}
                templateId={templateId}
                isEditing={isEditing}
                onDelete={editor.onDeleteRow}
                onDeleteColumn={editor.onDeleteColumn}
                onSetColumnWidths={editor.onSetColumnWidths}
                onDeleteComponent={editor.onDeleteComponent}
                onUpdateComponentData={editor.onUpdateComponentData}
                selectedId={selectedId}
                onSelectComponent={onSelectComponent}
                onSelectRow={onSelectRow}
                onSelectColumn={onSelectColumn}
              />
              {isEditing && <RowInsertZone index={rowIdx + 1} isVisible={isDraggingPanelRow ?? false} t={t} />}
            </Fragment>
          ))}
        </SortableContext>

        {isEditing && !isDraggingPanelRow && (
          <div
            ref={setNodeRef}
            className={`mt-4 h-24 rounded-2xl border-2 border-dashed transition-colors duration-150 flex items-center justify-center
              ${isOver ? "border-accent bg-accent/5" : "border-transparent opacity-0 hover:opacity-100 hover:border-stroke hover:bg-surface/30"}`}
          >
            <p className="text-xs font-medium text-ink-muted">{t("dropRowHere")}</p>
          </div>
        )}

        {editor.content.rows.length === 0 && !isEditing && (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-ink-muted">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-file-text"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
            </div>
            <p className="text-sm text-ink-muted italic">{t("emptyCanvas")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
