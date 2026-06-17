"use client";

import { useTranslations } from "next-intl";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { Section } from "./section";

interface ColumnInspectorProps {
  rowId: string;
  columnId: string;
  editor: ContentEditorState;
}

export function ColumnInspector({ rowId, columnId, editor }: ColumnInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const row = editor.content.rows.find((currentRow) => currentRow.id === rowId);
  const column = row?.columns.find((currentColumn) => currentColumn.id === columnId);
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

      <p className="type-hint leading-relaxed italic p-2 bg-canvas/50 rounded-lg border border-stroke/50">{t("widthHint")}</p>
    </div>
  );
}
