"use client";

import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type {
  ContentComponentData,
  ContentComponentNode,
  ImageComponentData,
  TextComponentData,
  HeadingComponentData,
  ChecklistComponentData,
  CalloutComponentData,
  TableComponentData,
  ListComponentData,
  LinkedDatabaseComponentData,
  ChartComponentData,
} from "@fixspace/domain";
import { ContentComponentType } from "@fixspace/domain";
import { COMPONENT_MIN_WIDTH_PX } from "../lib/component-min-widths";
import { TextProperty } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/fields/text-property";
import { ChartComponent } from "./chart-component";
import { ChecklistComponent } from "./checklist-block";
import { CalloutComponent } from "./callout-block";
import { TableComponent } from "./table-block";
import { ListComponent } from "./list-block";
import { ImageComponent } from "./image-block";
import { LinkedDatabaseComponent } from "./linked-database-block";

interface ContentComponentProps {
  component: ContentComponentNode;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, type: ContentComponentType) => void;
  onDelete: (id: string) => void;
  onUpdateData: (id: string, data: ContentComponentData) => void;
  rowId?: string;
  columnId?: string;
}

export function ContentComponent({
  component,
  recordId,
  templateId,
  isEditing,
  isSelected,
  onSelect,
  onUpdateData,
  rowId,
  columnId,
}: ContentComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: { dragType: "component", componentId: component.id, componentType: component.type, rowId, columnId },
    disabled: !isEditing,
  });

  const isFullWidth = component.type === ContentComponentType.LINKED_DATABASE;
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isFullWidth ? { width: "100%" } : { minWidth: COMPONENT_MIN_WIDTH_PX[component.type] }),
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`group/component relative rounded-lg transition-all duration-150 ${isDragging ? "z-50 opacity-30 pointer-events-none" : ""}
        ${isSelected ? "ring-2 ring-accent" : isEditing ? "hover:bg-surface-hover hover:ring-1 hover:ring-stroke" : ""}
        ${isEditing ? "cursor-pointer" : ""}`}
      onClick={(event) => {
        if (!isEditing) return;
        event.stopPropagation();
        onSelect?.(component.id, component.type);
      }}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-2 p-1 text-ink-muted hover:text-ink opacity-0 group-hover/component:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
        >
          <GripVertical size={14} />
        </div>
      )}

      <div>
        <ComponentRenderer
          component={component}
          recordId={recordId}
          templateId={templateId}
          isEditing={isEditing}
          onUpdateData={onUpdateData}
        />
      </div>
    </div>
  );
}

interface RendererProps {
  component: ContentComponentNode;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  onUpdateData: (id: string, data: ContentComponentData) => void;
}

export function ComponentDragOverlay({ component }: { component: ContentComponentNode }) {
  return (
    <div className="shadow-xl rounded-lg bg-canvas border border-stroke/50 p-3 min-w-[200px] max-w-[420px] opacity-95 pointer-events-none">
      <ComponentRenderer component={component} isEditing={false} onUpdateData={() => {}} />
    </div>
  );
}

const HEADING_STYLES: Record<number, string> = {
  1: "text-4xl font-bold leading-tight",
  2: "text-3xl font-bold leading-tight",
  3: "text-2xl font-semibold leading-snug",
  4: "text-xl font-semibold leading-snug",
  5: "text-lg font-semibold",
  6: "text-base font-bold uppercase tracking-wider",
};

function ComponentRenderer({ component, recordId, templateId, isEditing, onUpdateData }: RendererProps) {
  const t = useTranslations("RecordPage.canvas");
  const data = component.data as TextComponentData & HeadingComponentData & ImageComponentData & { style?: string };

  if (component.type === ContentComponentType.TEXT) {
    return (
      <div style={{ textAlign: data.align || "left" }}>
        <TextProperty
          ghost
          value={data.html ?? ""}
          readOnly={false}
          onChange={(html) => onUpdateData(component.id, { html })}
          placeholder={t("typeSomething")}
          textAlign={data.align}
        />
      </div>
    );
  }

  if (component.type === ContentComponentType.HEADING) {
    const level = data.level || 1;
    const align = data.align || "left";
    return (
      <div className={HEADING_STYLES[level]} style={{ textAlign: align }}>
        <TextProperty
          ghost
          value={data.html ?? ""}
          readOnly={false}
          onChange={(html) => onUpdateData(component.id, { html })}
          placeholder={t("heading", { level })}
          editorClass="text-inherit leading-inherit"
          textAlign={align}
        />
      </div>
    );
  }

  if (component.type === ContentComponentType.IMAGE) {
    return (
      <ImageComponent
        data={component.data as ImageComponentData}
        recordId={recordId}
        templateId={templateId}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.DIVIDER) {
    return (
      <div className="py-0.5">
        <div
          className={`w-full border-t border-stroke ${data.style === "dashed" ? "border-dashed" : data.style === "dotted" ? "border-dotted" : "border-solid"}`}
        />
      </div>
    );
  }

  if (component.type === ContentComponentType.CHECKLIST) {
    return (
      <ChecklistComponent
        data={component.data as ChecklistComponentData}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.CALLOUT) {
    return (
      <CalloutComponent
        data={component.data as CalloutComponentData}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.TABLE) {
    return (
      <TableComponent
        data={component.data as TableComponentData}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.LIST) {
    return (
      <ListComponent
        data={component.data as ListComponentData}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.LINKED_DATABASE) {
    return (
      <LinkedDatabaseComponent
        data={component.data as LinkedDatabaseComponentData}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.CHART) {
    return <ChartComponent data={component.data as ChartComponentData} recordId={recordId} />;
  }

  return null;
}
