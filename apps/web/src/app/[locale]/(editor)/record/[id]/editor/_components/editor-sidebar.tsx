"use client";

import { ContentComponentType } from "@fixspace/domain";
import {
  Type,
  Heading as HeadingIcon,
  ImageIcon,
  LayoutGrid,
  Component,
  History,
  Layers,
  X,
  Library,
  Minus,
  CheckSquare,
  Info,
  Table,
  List,
  BarChart2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import type { ActiveDragData } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/dnd-types";
import { RowPreviewIcon } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/nodes/row-preview-icon";

import { LayoutTab } from "./sidebar-tabs/layout-tab";
import { LibraryTab } from "./sidebar-tabs/library-tab";
import { StructureTab } from "./sidebar-tabs/structure-tab";
import { HistoryTab } from "./sidebar-tabs/history-tab";

export type PanelDragData =
  | { dragType: "panel-component"; componentType: ContentComponentType }
  | { dragType: "panel-row"; columnCount: 1 | 2 | 3 | 4 | 5 };

type SidebarTab = "library" | "layout" | "structure" | "history";

interface EditorSidebarProps {
  recordId?: string;
  templateId?: string;
  editor?: ContentEditorState;
  onSelectRow?: (id: string) => void;
  onSelectColumn?: (rowId: string, colId: string) => void;
  onSelectComponent?: (id: string, type: ContentComponentType) => void;
  selectedId?: string;
  isOpen: boolean;
  onToggle: (tab?: SidebarTab) => void;
  activeTab: SidebarTab;
}

export function EditorSidebar({
  recordId,
  editor,
  onSelectRow,
  onSelectColumn,
  onSelectComponent,
  selectedId,
  isOpen,
  onToggle,
  activeTab,
}: EditorSidebarProps) {
  const tabsTranslation = useTranslations("RecordPage.tabs");

  const tabsLocalized: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: "layout", icon: <LayoutGrid size={18} />, label: tabsTranslation("add") },
    { id: "library", icon: <Library size={18} />, label: tabsTranslation("elements") },
    { id: "structure", icon: <Layers size={18} />, label: tabsTranslation("structure") },
    { id: "history", icon: <History size={18} />, label: tabsTranslation("history") },
  ].filter((tab) => tab.id !== "history" || !!recordId) as { id: SidebarTab; icon: React.ReactNode; label: string }[];

  return (
    <div className="flex h-full bg-canvas">
      <div className="w-12 flex flex-col items-center py-4 gap-4 border-r border-stroke shrink-0">
        {tabsLocalized.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onToggle(tab.id)}
            title={tab.label}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
              ${isOpen && activeTab === tab.id ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-surface-hover"}`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="w-56 flex flex-col min-w-0 bg-canvas border-r border-stroke">
          <div className="px-4 py-3 border-b border-stroke flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              {tabsLocalized.find((tabItem) => tabItem.id === activeTab)?.label}
            </span>
            <button
              onClick={() => onToggle()}
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 p-2 no-scrollbar">
            {activeTab === "library" && <LibraryTab />}
            {activeTab === "layout" && <LayoutTab />}
            {activeTab === "structure" && editor && onSelectRow && onSelectColumn && onSelectComponent && (
              <StructureTab
                editor={editor}
                onSelectRow={onSelectRow}
                onSelectColumn={onSelectColumn}
                onSelectComponent={onSelectComponent}
                selectedId={selectedId}
              />
            )}
            {activeTab === "history" && recordId && editor && <HistoryTab recordId={recordId} editor={editor} />}
          </div>
        </div>
      )}
    </div>
  );
}

export function EditorDragOverlay({ data }: { data: PanelDragData | ActiveDragData | null }) {
  const elementsTranslation = useTranslations("RecordPage.elements");
  if (!data) return null;

  const COMPONENT_META: Record<string, { icon: React.ReactNode; label: string }> = {
    [ContentComponentType.TEXT]: { icon: <Type size={13} />, label: elementsTranslation("textBlock") },
    [ContentComponentType.HEADING]: { icon: <HeadingIcon size={13} />, label: elementsTranslation("heading1") },
    [ContentComponentType.IMAGE]: { icon: <ImageIcon size={13} />, label: elementsTranslation("imageMedia") },
    [ContentComponentType.DIVIDER]: { icon: <Minus size={13} />, label: elementsTranslation("divider") },
    [ContentComponentType.CHECKLIST]: { icon: <CheckSquare size={13} />, label: elementsTranslation("checklist") },
    [ContentComponentType.CALLOUT]: { icon: <Info size={13} />, label: elementsTranslation("callout") },
    [ContentComponentType.TABLE]: { icon: <Table size={13} />, label: elementsTranslation("table") },
    [ContentComponentType.LIST]: { icon: <List size={13} />, label: elementsTranslation("list") },
    [ContentComponentType.CHART]: { icon: <BarChart2 size={13} />, label: elementsTranslation("chart") },
  };

  if (data.dragType === "panel-component" && "componentType" in data) {
    const { icon, label } = COMPONENT_META[data.componentType as string] || { icon: <Component size={13} />, label: "Element" };
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        {icon}
        {label}
      </div>
    );
  }

  if (data.dragType === "component" && "componentType" in data) {
    const componentType = (data as ActiveDragData).componentType;
    const { icon, label } = (componentType && COMPONENT_META[componentType]) || { icon: <Component size={13} />, label: "Element" };
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium opacity-90 scale-95 ring-2 ring-accent">
        {icon}
        {label}
      </div>
    );
  }

  if (data.dragType === "panel-row" && "columnCount" in data) {
    const columnCount = (data as Extract<PanelDragData, { dragType: "panel-row" }>).columnCount;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-stroke shadow-lg text-ink text-xs font-medium">
        <RowPreviewIcon columns={columnCount} />
        {columnCount}-column row
      </div>
    );
  }

  return null;
}
