import type { TextComponentData } from "./text.types";
import type { HeadingComponentData } from "./heading.types";
import type { ImageComponentData } from "./image.types";
import type { DividerComponentData } from "./divider.types";

export enum ContentComponentType {
  TEXT = "TEXT",
  HEADING = "HEADING",
  IMAGE = "IMAGE",
  DIVIDER = "DIVIDER",
}

export type ContentComponentData = TextComponentData | HeadingComponentData | ImageComponentData | DividerComponentData;

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
}

export interface ContentSchema {
  rows: ContentRow[];
}
