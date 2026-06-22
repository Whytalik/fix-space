"use client";

import { useDraggable } from "@dnd-kit/core";
import { ContentComponentType } from "@fixspace/domain";
import { Type, Heading, ImageIcon, Minus, CheckSquare, Info, Table, List, Database, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { RowPreviewIcon } from "./row-preview-icon";

export type PanelDragData =
  | { dragType: "panel-component"; componentType: ContentComponentType }
  | { dragType: "panel-row"; columnCount: 1 | 2 | 3 | 4 | 5 };

interface DraggablePanelItemProps {
  id: string;
  data: PanelDragData;
  children: React.ReactNode;
}

function DraggablePanelItem({ id, data, children }: DraggablePanelItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none
        hover:bg-surface-hover transition-colors duration-150 text-ink-secondary hover:text-ink
        ${isDragging ? "opacity-40 ring-1 ring-accent" : ""}`}
    >
      {children}
    </div>
  );
}

export function ContentPanel() {
  const [activeTab, setActiveTab] = useState<"components" | "layouts">("components");
  const tElements = useTranslations("RecordPage.elements");

  return (
    <aside className="w-44 shrink-0 border-r border-stroke flex flex-col overflow-y-auto">
      <div className="flex p-2 gap-1 border-b border-stroke">
        <button
          onClick={() => setActiveTab("components")}
          className={`flex-1 flex justify-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
            activeTab === "components" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setActiveTab("layouts")}
          className={`flex-1 flex justify-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
            activeTab === "layouts" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"
          }`}
        >
          Layouts
        </button>
      </div>

      {activeTab === "components" && (
        <div className="flex flex-col p-2 gap-1">
          {[
            { id: "text", type: ContentComponentType.TEXT, icon: <Type size={14} className="shrink-0" />, label: tElements("textBlock") },
            {
              id: "heading",
              type: ContentComponentType.HEADING,
              icon: <Heading size={14} className="shrink-0" />,
              label: tElements("heading1"),
            },
            {
              id: "image",
              type: ContentComponentType.IMAGE,
              icon: <ImageIcon size={14} className="shrink-0" />,
              label: tElements("imageMedia"),
            },
            {
              id: "divider",
              type: ContentComponentType.DIVIDER,
              icon: <Minus size={14} className="shrink-0" />,
              label: tElements("divider"),
            },
            {
              id: "checklist",
              type: ContentComponentType.CHECKLIST,
              icon: <CheckSquare size={14} className="shrink-0" />,
              label: tElements("checklist"),
            },
            {
              id: "callout",
              type: ContentComponentType.CALLOUT,
              icon: <Info size={14} className="shrink-0" />,
              label: tElements("callout"),
            },
            { id: "table", type: ContentComponentType.TABLE, icon: <Table size={14} className="shrink-0" />, label: tElements("table") },
            { id: "list", type: ContentComponentType.LIST, icon: <List size={14} className="shrink-0" />, label: tElements("list") },
            {
              id: "linked-database",
              type: ContentComponentType.LINKED_DATABASE,
              icon: <Database size={14} className="shrink-0" />,
              label: tElements("linkedDatabase"),
            },
            {
              id: "chart",
              type: ContentComponentType.CHART,
              icon: <BarChart3 size={14} className="shrink-0" />,
              label: tElements("chart"),
            },
          ].map(({ id, type, icon, label }) => (
            <DraggablePanelItem key={id} id={`panel-component-${id}`} data={{ dragType: "panel-component", componentType: type }}>
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </DraggablePanelItem>
          ))}
        </div>
      )}

      {activeTab === "layouts" && (
        <div className="flex flex-col p-2 gap-1">
          {[1, 2, 3, 4, 5].map((columnCount) => (
            <DraggablePanelItem
              key={`panel-row-${columnCount}`}
              id={`panel-row-${columnCount}`}
              data={{ dragType: "panel-row", columnCount: columnCount as 1 | 2 | 3 | 4 | 5 }}
            >
              <RowPreviewIcon columns={columnCount as 1 | 2 | 3 | 4 | 5} />
              <span className="text-xs font-medium">{columnCount} columns</span>
            </DraggablePanelItem>
          ))}
        </div>
      )}
    </aside>
  );
}

export function PanelDragOverlay({ data }: { data: PanelDragData | null }) {
  const tElements = useTranslations("RecordPage.elements");
  if (!data) return null;

  if (data.dragType === "panel-component") {
    const map: Record<string, { icon: React.ReactNode; label: string }> = {
      [ContentComponentType.TEXT]: { icon: <Type size={14} />, label: tElements("textBlock") },
      [ContentComponentType.HEADING]: { icon: <Heading size={14} />, label: tElements("heading1") },
      [ContentComponentType.IMAGE]: { icon: <ImageIcon size={14} />, label: tElements("imageMedia") },
      [ContentComponentType.DIVIDER]: { icon: <Minus size={14} />, label: tElements("divider") },
      [ContentComponentType.CHECKLIST]: { icon: <CheckSquare size={14} />, label: tElements("checklist") },
      [ContentComponentType.CALLOUT]: { icon: <Info size={14} />, label: tElements("callout") },
      [ContentComponentType.TABLE]: { icon: <Table size={14} />, label: tElements("table") },
      [ContentComponentType.LIST]: { icon: <List size={14} />, label: tElements("list") },
      [ContentComponentType.LINKED_DATABASE]: { icon: <Database size={14} />, label: tElements("linkedDatabase") },
      [ContentComponentType.CHART]: { icon: <BarChart3 size={14} />, label: tElements("chart") },
    };
    const { icon, label } = map[data.componentType] || { icon: null, label: "Element" };
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        {icon}
        {label}
      </div>
    );
  }

  if (data.dragType === "panel-row") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        <RowPreviewIcon columns={data.columnCount} />
        {data.columnCount}-column row
      </div>
    );
  }

  return null;
}
