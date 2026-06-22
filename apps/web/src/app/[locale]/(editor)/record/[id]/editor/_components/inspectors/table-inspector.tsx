"use client";

import { useTranslations } from "next-intl";
import type { TableComponentData } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { Section } from "./section";
import { findComponent } from "./utils";

interface TableInspectorProps {
  componentId: string;
  editor: ContentEditorState;
}

export function TableInspector({ componentId, editor }: TableInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { headers: [], rows: [] }) as TableComponentData;

  return (
    <Section label={t("options")}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-secondary">{t("highlightFirstRow")}</span>
          <CheckboxInput
            checked={!!data.highlightFirstRow}
            onChange={(checked) => editor.onUpdateComponentData(componentId, { ...data, highlightFirstRow: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-secondary">{t("highlightFirstCol")}</span>
          <CheckboxInput
            checked={!!data.highlightFirstCol}
            onChange={(checked) => editor.onUpdateComponentData(componentId, { ...data, highlightFirstCol: checked })}
          />
        </div>
      </div>
    </Section>
  );
}
