"use client";

import { useState, useMemo } from "react";
import { MousePointer2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, X, Palette, MinusCircle } from "lucide-react";
import type {
  ContentComponentType,
  ContentSchema,
  ImageComponentData,
  TextComponentData,
  HeadingComponentData,
  DividerComponentData,
  ContentColumn,
} from "@fixspace/domain";
import { ContentComponentType as CCT } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";

export type SelectedElement =
  | { kind: "component"; id: string; componentType: ContentComponentType }
  | { kind: "row"; id: string }
  | { kind: "column"; rowId: string; columnId: string }
  | null;

function findComponent(schema: ContentSchema, componentId: string) {
  for (const row of schema.rows) {
    for (const column of row.columns) {
      const found = column.children.find((c) => c.id === componentId);
      if (found) return found;
    }
  }
  return null;
}

function hasColumnContent(column: ContentColumn): boolean {
  return column.children.length > 0;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}

function AlignmentControls({ value, onChange }: { value?: string; onChange: (patch: Record<string, unknown>) => void }) {
  const t = useTranslations("RecordPage.inspector");
  return (
    <Section label={t("alignment")}>
      <div className="flex gap-1">
        {[
          { id: "left", icon: <AlignLeft size={14} /> },
          { id: "center", icon: <AlignCenter size={14} /> },
          { id: "right", icon: <AlignRight size={14} /> },
          { id: "justify", icon: <AlignJustify size={14} /> },
        ].map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ align: id })}
            className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-colors duration-150 ${
              (value || "left") === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </Section>
  );
}

function HeadingInspector({ componentId, editor }: { componentId: string; editor: ContentEditorState }) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { html: "", level: 1 }) as HeadingComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("headingLevel")}>
        <div className="grid grid-cols-3 gap-1">
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { ...data, level })}
              className={`py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                (data.level || 1) === level
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stroke text-ink-muted hover:text-ink-secondary"
              }`}
            >
              H{level}
            </button>
          ))}
        </div>
      </Section>
      <AlignmentControls value={data.align} onChange={(patch) => editor.onUpdateComponentData(componentId, { ...data, ...patch })} />
    </div>
  );
}

function TextInspector({ componentId, editor }: { componentId: string; editor: ContentEditorState }) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { html: "" }) as TextComponentData;

  return (
    <div className="flex flex-col gap-3">
      <AlignmentControls value={data.align} onChange={(patch) => editor.onUpdateComponentData(componentId, { ...data, ...patch })} />
      <p className="text-[10px] text-ink-muted text-center">{t("textFormatHint")}</p>
    </div>
  );
}

function ImageInspector({ componentId, editor }: { componentId: string; editor: ContentEditorState }) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data ?? { url: "", align: "center" }) as ImageComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("imageUrl")}>
        <input
          value={data.url}
          onChange={(e) => editor.onUpdateComponentData(componentId, { ...data, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stroke bg-transparent text-ink focus:outline-none focus:border-accent transition-colors duration-150"
        />
      </Section>
      <Section label={t("alignment")}>
        <div className="flex gap-1">
          {[
            { id: "left", icon: <AlignLeft size={14} /> },
            { id: "center", icon: <AlignCenter size={14} /> },
            { id: "right", icon: <AlignRight size={14} /> },
          ].map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { ...data, align: id as ImageComponentData["align"] })}
              className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-colors duration-150 ${
                (data.align || "center") === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function DividerInspector({ componentId, editor }: { componentId: string; editor: ContentEditorState }) {
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || {}) as DividerComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label="Style">
        <div className="flex gap-1">
          {[
            { id: "solid", label: "—" },
            { id: "dashed", label: "╌" },
            { id: "dotted", label: "···" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { style: id as DividerComponentData["style"] })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                (data.style || "solid") === id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stroke text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function RowInspector({
  rowId,
  editor,
  onConfirmAction,
}: {
  rowId: string;
  editor: ContentEditorState;
  onConfirmAction: (config: { title: string; desc: string; onConfirm: () => void }) => void;
}) {
  const t = useTranslations("RecordPage.inspector");
  const row = editor.content.rows.find((r) => r.id === rowId);
  if (!row) return null;

  const currentCount = row.columns.length;

  const handleChangeCount = (n: number) => {
    if (n === currentCount) return;

    if (n > currentCount) {
      for (let i = 0; i < n - currentCount; i++) editor.onAddColumn(rowId);
    } else {
      const columnsToRemove = row.columns.slice(n);
      const hasContent = columnsToRemove.some(hasColumnContent);

      const performAction = () => {
        for (let i = 0; i < currentCount - n; i++) {
          const lastCol = row.columns[row.columns.length - 1 - i];
          if (lastCol) editor.onDeleteColumn(rowId, lastCol.id);
        }
      };

      if (hasContent) {
        onConfirmAction({
          title: t("confirmDeleteTitle"),
          desc: t("confirmReduceColumns"),
          onConfirm: performAction,
        });
      } else {
        performAction();
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Section label={t("layout")}>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-ink-secondary font-medium">{t("columnsCount")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleChangeCount(n)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                  currentCount === n ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section label={t("columnsLayout")}>
        <div className="flex flex-col gap-4">
          {row.columns.map((column, idx) => (
            <div key={column.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-secondary font-medium">
                  {t("column")} {idx + 1}
                </span>
                <span className="text-accent font-bold">{Math.round(column.width)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={col.width}
                onChange={(e) => {
                  const newWidth = parseFloat(e.target.value);
                  const currentWidths = row.columns.map((c) => c.width);
                  const updated = [...currentWidths];

                  const delta = newWidth - col.width;
                  updated[idx] = newWidth;

                  const otherIndices = currentWidths.map((_, i) => i).filter((i) => i !== idx);
                  if (otherIndices.length > 0) {
                    const sumOthers = otherIndices.reduce((acc, i) => acc + (currentWidths[i] || 0), 0);
                    otherIndices.forEach((i) => {
                      const currentW = currentWidths[i];
                      if (currentW !== undefined) {
                        const share = currentW / sumOthers;
                        updated[i] = Math.max(10, currentW - delta * share);
                      }
                    });
                  }

                  editor.onSetColumnWidths(rowId, updated);
                }}
                className="w-full h-1.5 bg-stroke rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section label={t("columnsHierarchy")}>
        <div className="flex flex-col gap-1">
          {row.columns.map((column, idx) => (
            <div
              key={column.id}
              className="group flex items-center justify-between p-2 rounded-lg border border-stroke bg-surface/30 hover:border-accent/30 transition-colors duration-150"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 flex items-center justify-center rounded bg-canvas border border-stroke text-[10px] font-bold text-ink-muted shrink-0">
                  {idx + 1}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-semibold text-ink truncate">
                    {t("column")} {idx + 1}
                  </span>
                  <span className="text-[9px] text-ink-muted truncate">
                    {Math.round(column.width)}% {t("width").toLowerCase()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hasColumnContent(column)) {
                    onConfirmAction({
                      title: t("confirmDeleteTitle"),
                      desc: t("confirmDeleteDesc", { type: t("column").toLowerCase() }),
                      onConfirm: () => editor.onDeleteColumn(rowId, column.id),
                    });
                  } else {
                    editor.onDeleteColumn(rowId, column.id);
                  }
                }}
                disabled={row.columns.length <= 1}
                className="p-1 text-ink-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:hidden"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ColumnInspector({ rowId, columnId, editor }: { rowId: string; columnId: string; editor: ContentEditorState }) {
  const t = useTranslations("RecordPage.inspector");
  const row = editor.content.rows.find((r) => r.id === rowId);
  const column = row?.columns.find((c) => c.id === columnId);
  if (!row || !column) return null;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("column")}>
        <div className="p-3 rounded-lg border border-stroke bg-surface/30 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink-muted">{t("width")}</span>
            <span className="text-ink font-semibold">{Math.round(column.width)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ink-muted">{t("content")}</span>
            <span className="text-ink font-semibold">{t("elementsCount", { count: column.children.length })}</span>
          </div>
        </div>
      </Section>

      <p className="text-[10px] text-ink-muted leading-relaxed italic p-2 bg-canvas/50 rounded-lg border border-stroke/50">
        {t("widthHint")}
      </p>
    </div>
  );
}

interface EditorRightPanelProps {
  selection: SelectedElement;
  editor: ContentEditorState;
  isOpen: boolean;
  onToggle: () => void;
  onResetSelection: () => void;
}

export function EditorRightPanel({ selection, editor, isOpen, onToggle, onResetSelection }: EditorRightPanelProps) {
  const t = useTranslations("RecordPage.inspector");
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);

  const title = useMemo(() => {
    if (!selection) return "Styles";
    if (selection.kind === "row") return t("row");
    if (selection.kind === "column") return t("column");

    const map: Record<string, string> = {
      [CCT.HEADING]: t("heading"),
      [CCT.IMAGE]: t("image"),
      [CCT.DIVIDER]: "Divider",
      [CCT.TEXT]: t("text"),
    };
    return map[selection.componentType] || t("text");
  }, [selection, t]);

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
      } else {
        content = <TextInspector componentId={selection.id} editor={editor} />;
      }
      onDelete = () => {
        editor.onDeleteComponent(selection.id);
        onResetSelection();
      };
      hasSelectionContent = false;
    } else if (selection.kind === "row") {
      const row = editor.content.rows.find((r) => r.id === selection.id);
      hasSelectionContent = row?.columns.some(hasColumnContent) ?? false;
      content = <RowInspector rowId={selection.id} editor={editor} onConfirmAction={(config) => setConfirmConfig(config)} />;
      onDelete = () => {
        editor.onDeleteRow(selection.id);
        onResetSelection();
      };
    } else if (selection.kind === "column") {
      const row = editor.content.rows.find((r) => r.id === selection.rowId);
      const column = row?.columns.find((c) => c.id === selection.columnId);
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
    <div className="flex h-full bg-canvas">
      <div className="w-12 flex flex-col items-center py-4 border-r border-stroke shrink-0 bg-canvas">
        <button
          onClick={onToggle}
          title="Styles & Inspector"
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 ${isOpen ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-surface-hover"}`}
        >
          <Palette size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="w-56 flex flex-col min-w-0 bg-canvas border-r border-stroke">
          <div className="px-4 py-3 border-b border-stroke flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">{title}</span>
            <div className="flex items-center gap-1">
              {selection && (
                <button
                  onClick={onResetSelection}
                  title="Deselect"
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
                      {t("delete", { type: title })}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center opacity-50">
                <MousePointer2 size={24} className="text-ink-muted" />
                <p className="text-[10px] text-ink-muted px-4">{t("selectElement")}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
