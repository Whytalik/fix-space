import type { ContentSchema, ContentColumn } from "@fixspace/domain";

export function findComponent(schema: ContentSchema, componentId: string) {
  for (const row of schema.rows) {
    for (const column of row.columns) {
      const found = column.children.find((child) => child.id === componentId);
      if (found) return found;
    }
  }
  return null;
}

export function hasColumnContent(column: ContentColumn): boolean {
  return column.children.length > 0;
}
