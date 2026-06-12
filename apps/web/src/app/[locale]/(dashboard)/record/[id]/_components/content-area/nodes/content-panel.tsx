"use client";

import { useDraggable } from "@dnd-kit/core";
import { ContentComponentType } from "@fixspace/domain";
import { Type, Heading, ImageIcon } from "lucide-react";
import { useState } from "react";
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

  return (
    <aside className="w-44 shrink-0 border-r border-stroke flex flex-col overflow-y-auto">
      <div className="flex p-2 gap-1 border-b border-stroke">
        <button
          onClick={() => setActiveTab("components")}
          className={`flex-1 flex justify-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
            activeTab === "components" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setActiveTab("layouts")}
          className={`flex-1 flex justify-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
            activeTab === "layouts" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"
          }`}
        >
          Layouts
        </button>
      </div>

      {activeTab === "components" && (
        <div className="flex flex-col p-2 gap-1">
          {[
            { id: "text", type: ContentComponentType.TEXT, icon: <Type size={14} className="shrink-0" />, label: "Text" },
            { id: "heading", type: ContentComponentType.HEADING, icon: <Heading size={14} className="shrink-0" />, label: "Heading" },
            { id: "image", type: ContentComponentType.IMAGE, icon: <ImageIcon size={14} className="shrink-0" />, label: "Image" },
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
  if (!data) return null;

  if (data.dragType === "panel-component") {
    const map: Record<string, { icon: React.ReactNode; label: string }> = {
      [ContentComponentType.TEXT]: { icon: <Type size={14} />, label: "Text" },
      [ContentComponentType.HEADING]: { icon: <Heading size={14} />, label: "Heading" },
      [ContentComponentType.IMAGE]: { icon: <ImageIcon size={14} />, label: "Image" },
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
