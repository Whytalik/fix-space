"use client";

import { useTranslations } from "next-intl";
import { Type, Heading as HeadingIcon, ImageIcon, Minus, CheckSquare, Info, Table, List, Database, BarChart2 } from "lucide-react";
import { ContentComponentType } from "@fixspace/domain";
import { DraggableItem } from "./draggable-item";

export function LibraryTab() {
  const translationElements = useTranslations("RecordPage.elements");

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-1">
        <p className="px-2 py-1 type-nav-label font-bold">{translationElements("contentElements")}</p>
        {[
          { type: ContentComponentType.TEXT, icon: <Type size={14} />, label: translationElements("textBlock") },
          { type: ContentComponentType.HEADING, icon: <HeadingIcon size={14} />, label: translationElements("heading1") },
          { type: ContentComponentType.IMAGE, icon: <ImageIcon size={14} />, label: translationElements("imageMedia") },
          { type: ContentComponentType.DIVIDER, icon: <Minus size={14} />, label: translationElements("divider") },
          { type: ContentComponentType.CHECKLIST, icon: <CheckSquare size={14} />, label: translationElements("checklist") },
          { type: ContentComponentType.CALLOUT, icon: <Info size={14} />, label: translationElements("callout") },
          { type: ContentComponentType.TABLE, icon: <Table size={14} />, label: translationElements("table") },
          { type: ContentComponentType.LIST, icon: <List size={14} />, label: translationElements("list") },
          { type: ContentComponentType.LINKED_DATABASE, icon: <Database size={14} />, label: translationElements("linkedDatabase") },
          { type: ContentComponentType.CHART, icon: <BarChart2 size={14} />, label: translationElements("chart") },
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
