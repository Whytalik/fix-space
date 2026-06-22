import type { TextComponentData } from "./text.types";
import type { HeadingComponentData } from "./heading.types";
import type { ImageComponentData } from "./image.types";
import type { DividerComponentData } from "./divider.types";
import type { ChecklistComponentData } from "./checklist.types";
import type { CalloutComponentData } from "./callout.types";
import type { TableComponentData } from "./table.types";
import type { ListComponentData } from "./list.types";
import type { LinkedDatabaseComponentData } from "./linked-database.types";
import type { ChartComponentData } from "./chart.types";

export enum ContentComponentType {
  TEXT = "TEXT",
  HEADING = "HEADING",
  IMAGE = "IMAGE",
  DIVIDER = "DIVIDER",
  CHECKLIST = "CHECKLIST",
  CALLOUT = "CALLOUT",
  TABLE = "TABLE",
  LIST = "LIST",
  LINKED_DATABASE = "LINKED_DATABASE",
  CHART = "CHART",
}

export type ContentComponentData =
  | TextComponentData
  | HeadingComponentData
  | ImageComponentData
  | DividerComponentData
  | ChecklistComponentData
  | CalloutComponentData
  | TableComponentData
  | ListComponentData
  | LinkedDatabaseComponentData
  | ChartComponentData;

export interface ContentComponentNode {
  id: string;
  type: ContentComponentType;
  data: ContentComponentData;
}

export interface ContentColumn {
  id: string;
  width: number;
  children: ContentComponentNode[];
}

export interface ContentRow {
  id: string;
  columns: ContentColumn[];
  paddingTop?: number;
  paddingBottom?: number;
}

export interface ContentSchema {
  rows: ContentRow[];
}
