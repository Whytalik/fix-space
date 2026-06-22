"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { ContentComponentType as CCT } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { getColumnMinPx } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/component-min-widths";
import { Section } from "./section";
import { hasColumnContent } from "./utils";

interface RowInspectorProps {
  rowId: string;
  editor: ContentEditorState;
  onConfirmAction: (config: { title: string; desc: string; onConfirm: () => void }) => void;
}

export function RowInspector({ rowId, editor, onConfirmAction }: RowInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const row = editor.content.rows.find((currentRow) => currentRow.id === rowId);
  if (!row) return null;

  const currentCount = row.columns.length;
  const hasLinkedDb = row.columns.some((column) => column.children.some((component) => component.type === CCT.LINKED_DATABASE));

  const handleChangeCount = (columnCount: number) => {
    if (columnCount === currentCount) return;

    if (columnCount < currentCount) {
      const columnsToRemove = row.columns.slice(columnCount);
      const hasContent = columnsToRemove.some(hasColumnContent);

      if (hasContent) {
        onConfirmAction({
          title: t("confirmDeleteTitle"),
          desc: t("confirmReduceColumns"),
          onConfirm: () => editor.onSetColumnCount(rowId, columnCount),
        });
        return;
      }
    }

    editor.onSetColumnCount(rowId, columnCount);
  };

  const PADDING_PRESETS = [0, 8, 16, 24, 32, 48];

  return (
    <div className="flex flex-col gap-6">
      <Section label={t("padding")}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-ink-secondary">
            <span>{t("top")}</span>
            <span className="text-accent font-bold">{row.paddingTop ?? 0}px</span>
          </div>
          <div className="flex gap-1">
            {PADDING_PRESETS.map((presetPadding) => (
              <button
                key={presetPadding}
                type="button"
                onClick={() => editor.onUpdateRow(rowId, { ...row, paddingTop: presetPadding })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                  (row.paddingTop ?? 0) === presetPadding
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-stroke text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {presetPadding}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-ink-secondary mt-1">
            <span>{t("bottom")}</span>
            <span className="text-accent font-bold">{row.paddingBottom ?? 0}px</span>
          </div>
          <div className="flex gap-1">
            {PADDING_PRESETS.map((presetPadding) => (
              <button
                key={presetPadding}
                type="button"
                onClick={() => editor.onUpdateRow(rowId, { ...row, paddingBottom: presetPadding })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                  (row.paddingBottom ?? 0) === presetPadding
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-stroke text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {presetPadding}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section label={t("layout")}>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-ink-secondary font-medium">{t("columnsCount")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const disabled = hasLinkedDb && n > 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => !disabled && handleChangeCount(n)}
                  title={disabled ? t("linkedDatabaseSettingsInfo") : undefined}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                    disabled
                      ? "border-stroke text-ink-muted opacity-30 cursor-not-allowed"
                      : currentCount === n
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-stroke text-ink-muted hover:text-ink-secondary"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section label={t("columnsLayout")}>
        <div className="flex flex-col gap-4">
          {row.columns.map((column, columnIndex) => (
            <div key={column.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary font-medium">
                  {t("column")} {columnIndex + 1}
                </span>
                <span className="text-accent font-bold">{Math.round(column.width)}%</span>
              </div>
              <input
                type="range"
                min={Math.min(10, Math.round((getColumnMinPx(column) / 700) * 100))}
                max="90"
                step="1"
                value={column.width}
                onChange={(event) => {
                  const newWidth = parseFloat(event.target.value);
                  const currentWidths = row.columns.map((col) => col.width);
                  const updated = [...currentWidths];
                  const ESTIMATED_CONTAINER = 700;

                  const delta = newWidth - column.width;
                  updated[columnIndex] = newWidth;

                  const otherIndices = currentWidths.map((_, index) => index).filter((index) => index !== columnIndex);
                  if (otherIndices.length > 0) {
                    const sumOthers = otherIndices.reduce((accumulator, index) => accumulator + (currentWidths[index] || 0), 0);
                    otherIndices.forEach((index) => {
                      const currentWidth = currentWidths[index];
                      const otherColumn = row.columns[index];
                      if (currentWidth !== undefined && otherColumn) {
                        const share = currentWidth / sumOthers;
                        const otherMinPercentage = Math.max(10, Math.round((getColumnMinPx(otherColumn) / ESTIMATED_CONTAINER) * 100));
                        updated[index] = Math.max(otherMinPercentage, currentWidth - delta * share);
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
          {row.columns.map((column, columnIndex) => (
            <div
              key={column.id}
              className="group flex items-center justify-between p-2 rounded-lg border border-stroke bg-surface/30 hover:border-accent/30 transition-colors duration-150"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 flex items-center justify-center rounded bg-canvas border border-stroke type-hint font-bold shrink-0">
                  {columnIndex + 1}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-ink truncate">
                    {t("column")} {columnIndex + 1}
                  </span>
                  <span className="type-hint truncate">
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
