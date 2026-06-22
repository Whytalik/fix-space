"use client";

import { useTranslations } from "next-intl";
import { RowPreviewIcon } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/row-preview-icon";
import { DraggableItem } from "./draggable-item";

export function LayoutTab() {
  const t = useTranslations("RecordPage.layout");
  return (
    <div className="space-y-1">
      <p className="px-2 py-2 type-nav-label font-bold">{t("rowLayouts")}</p>
      {([1, 2, 3, 4, 5] as const).map((columnsCount) => (
        <DraggableItem key={columnsCount} id={`panel-row-${columnsCount}`} data={{ dragType: "panel-row", columnCount: columnsCount }}>
          <RowPreviewIcon columns={columnsCount} />
          <span className="text-xs font-medium">{t("columns", { count: columnsCount })}</span>
        </DraggableItem>
      ))}
    </div>
  );
}
