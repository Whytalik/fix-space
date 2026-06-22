import type { ContentComponentType } from "@fixspace/domain";

export type DropType = "column" | "nested-column" | "row-insert" | "canvas-end";

export interface ActiveDragData {
  dragType: "row" | "component" | "panel-row" | "panel-component";
  id: string;
  componentType?: ContentComponentType;
  rowId?: string;
  columnId?: string;
}

export type OverDropData =
  | { dropType: "column"; rowId: string; columnId: string }
  | { dropType: "nested-column"; parentRowId: string; parentColumnId: string; nestedRowId: string; nestedColumnId: string }
  | { dropType: "row-insert"; insertIndex: number }
  | { dropType: "canvas-end" };

export function isDrop<T extends DropType>(data: unknown, type: T): data is Extract<OverDropData, { dropType: T }> {
  return typeof data === "object" && data !== null && (data as Record<string, unknown>).dropType === type;
}
