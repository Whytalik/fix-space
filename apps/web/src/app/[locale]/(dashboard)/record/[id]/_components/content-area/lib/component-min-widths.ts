import { ContentComponentType } from "@fixspace/domain";

export const COMPONENT_MIN_WIDTH_PX: Record<ContentComponentType, number> = {
  [ContentComponentType.TEXT]: 100,
  [ContentComponentType.HEADING]: 100,
  [ContentComponentType.IMAGE]: 200,
  [ContentComponentType.CHECKLIST]: 160,
  [ContentComponentType.CALLOUT]: 200,
  [ContentComponentType.TABLE]: 200,
  [ContentComponentType.LIST]: 100,
  [ContentComponentType.DIVIDER]: 20,
  [ContentComponentType.LINKED_DATABASE]: 400,
  [ContentComponentType.CHART]: 280,
};

export const COLUMN_INNER_PADDING_PX = 24;

export const EMPTY_COLUMN_MIN_PX = 60;

export function getColumnMinPx(column: { children: { type: ContentComponentType }[] }): number {
  if (column.children.length === 0) return EMPTY_COLUMN_MIN_PX;
  const contentMin = Math.max(...column.children.map((c) => COMPONENT_MIN_WIDTH_PX[c.type]));
  return contentMin + COLUMN_INNER_PADDING_PX;
}
