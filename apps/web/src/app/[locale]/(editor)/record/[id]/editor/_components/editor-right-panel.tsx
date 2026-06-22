"use client";

import { useState, useMemo } from "react";
import { MousePointer2, Trash2, X, Palette, MinusCircle } from "lucide-react";
import type { ContentComponentType } from "@fixspace/domain";
import { ContentComponentType as CCT } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";

import { hasColumnContent } from "./inspectors/utils";
import { ChartInspector } from "./inspectors/chart-inspector";
import { CalloutInspector } from "./inspectors/callout-inspector";
import { TableInspector } from "./inspectors/table-inspector";
import { ListInspector } from "./inspectors/list-inspector";
import { RowInspector } from "./inspectors/row-inspector";
import { ColumnInspector } from "./inspectors/column-inspector";
import { HeadingInspector, TextInspector, ImageInspector, DividerInspector, ChecklistInspector } from "./inspectors/simple-inspectors";

export type SelectedElement =
  | { kind: "component"; id: string; componentType: ContentComponentType }
  | { kind: "row"; id: string }
  | { kind: "column"; rowId: string; columnId: string }
  | null;

interface EditorRightPanelProps {
  selection: SelectedElement;
  editor: ContentEditorState;
  isOpen: boolean;
  onToggle: () => void;
  onResetSelection: () => void;
}

export function EditorRightPanel({ selection, editor, isOpen, onToggle, onResetSelection }: EditorRightPanelProps) {
  const t = useTranslations("RecordPage.inspector");
  const translationElements = useTranslations("RecordPage.elements");
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);

  const title = useMemo(() => {
    if (!selection) return t("style");
    if (selection.kind === "row") return t("row");
    if (selection.kind === "column") return t("column");

    const map: Record<string, string> = {
      [CCT.HEADING]: t("heading"),
      [CCT.IMAGE]: t("image"),
      [CCT.DIVIDER]: t("divider"),
      [CCT.TEXT]: t("text"),
      [CCT.CALLOUT]: t("callout"),
      [CCT.CHECKLIST]: t("checklist"),
      [CCT.TABLE]: t("table"),
      [CCT.LIST]: t("list"),
      [CCT.CHART]: t("chart"),
      [CCT.LINKED_DATABASE]: translationElements("linkedDatabase"),
    };
    return map[selection.componentType] || t("text");
  }, [selection, t, translationElements]);

  let content: React.ReactNode;
  let onDelete: (() => void) | undefined;
  let hasSelectionContent = false;

  if (selection) {
    if (selection.kind === "component") {
      if (selection.componentType === CCT.HEADING) {
        content = <HeadingInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.IMAGE) {
        content = <ImageInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.DIVIDER) {
        content = <DividerInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.CALLOUT) {
        content = <CalloutInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.CHECKLIST) {
        content = <ChecklistInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.TABLE) {
        content = <TableInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.LIST) {
        content = <ListInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.CHART) {
        content = <ChartInspector componentId={selection.id} editor={editor} />;
      } else if (selection.componentType === CCT.LINKED_DATABASE) {
        content = <div className="text-sm text-ink-muted px-2 py-4 text-center">{t("linkedDatabaseSettingsInfo")}</div>;
      } else {
        content = <TextInspector componentId={selection.id} editor={editor} />;
      }
      onDelete = () => {
        editor.onDeleteComponent(selection.id);
        onResetSelection();
      };
      hasSelectionContent = false;
    } else if (selection.kind === "row") {
      const row = editor.content.rows.find((currentRow) => currentRow.id === selection.id);
      hasSelectionContent = row?.columns.some(hasColumnContent) ?? false;
      content = <RowInspector rowId={selection.id} editor={editor} onConfirmAction={(config) => setConfirmConfig(config)} />;
      onDelete = () => {
        editor.onDeleteRow(selection.id);
        onResetSelection();
      };
    } else if (selection.kind === "column") {
      const row = editor.content.rows.find((currentRow) => currentRow.id === selection.rowId);
      const column = row?.columns.find((currentColumn) => currentColumn.id === selection.columnId);
      hasSelectionContent = column ? hasColumnContent(column) : false;
      content = <ColumnInspector rowId={selection.rowId} columnId={selection.columnId} editor={editor} />;
      onDelete = () => {
        editor.onDeleteColumn(selection.rowId, selection.columnId);
        onResetSelection();
      };
    }
  }

  const handleDeleteClick = () => {
    if (hasSelectionContent && onDelete) {
      setConfirmConfig({
        title: t("confirmDeleteTitle"),
        desc: t("confirmDeleteDesc", { type: title.toLowerCase() }),
        onConfirm: onDelete,
      });
    } else if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="flex h-full bg-canvas border-l border-stroke">
      {isOpen && (
        <div className="w-56 flex flex-col min-w-0 bg-canvas border-r border-stroke">
          <div className="px-4 py-3 border-b border-stroke flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">{title}</span>
            <div className="flex items-center gap-1">
              {selection && (
                <button
                  onClick={onResetSelection}
                  title={t("deselect")}
                  className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
                >
                  <MinusCircle size={14} />
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 no-scrollbar">
            {selection ? (
              <>
                <div className="flex-1">{content}</div>
                {onDelete && (
                  <div className="pt-4 border-t border-stroke">
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-error hover:bg-error-bg rounded-lg transition-colors duration-150"
                    >
                      <Trash2 size={14} />
                      {t("delete")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center opacity-50">
                <MousePointer2 size={24} className="text-ink-muted" />
                <p className="type-hint px-4">{t("selectElement")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-12 flex flex-col items-center py-4 shrink-0 bg-canvas">
        <button
          onClick={onToggle}
          title="Styles & Inspector"
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 ${isOpen ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-surface-hover"}`}
        >
          <Palette size={18} />
        </button>
      </div>

      {confirmConfig && (
        <ConfirmDialog
          title={confirmConfig.title}
          description={confirmConfig.desc}
          confirmLabel={t("confirm")}
          cancelLabel={t("cancel")}
          variant="danger"
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
