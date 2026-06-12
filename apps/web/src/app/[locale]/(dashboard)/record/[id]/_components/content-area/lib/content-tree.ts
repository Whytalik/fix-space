import type { ContentColumn, ContentComponentData, ContentComponentNode, ContentSchema, ContentRow } from "@fixspace/domain";
import { ContentComponentType } from "@fixspace/domain";

export function createRow(): ContentRow {
  return {
    id: crypto.randomUUID(),
    columns: [createColumn(100)],
  };
}

export function createColumn(width: number): ContentColumn {
  return { id: crypto.randomUUID(), width, children: [] };
}

export function createComponent(type: ContentComponentType): ContentComponentNode {
  let data: ContentComponentData;

  if (type === ContentComponentType.IMAGE) {
    data = { url: "", align: "center" };
  } else if (type === ContentComponentType.HEADING) {
    data = { html: "", level: 1, align: "left" };
  } else if (type === ContentComponentType.DIVIDER) {
    data = { style: "solid" };
  } else {
    data = { html: "", align: "left" };
  }

  return { id: crypto.randomUUID(), type, data };
}

export function addRow(schema: ContentSchema): ContentSchema {
  return { rows: [...schema.rows, createRow()] };
}

export function addRowWithColumns(schema: ContentSchema, columnCount: 1 | 2 | 3 | 4 | 5, insertIndex?: number): ContentSchema {
  const base = Math.floor(100 / columnCount);
  const remainder = 100 - base * columnCount;
  const columns: ContentColumn[] = Array.from({ length: columnCount }, (_, i) =>
    createColumn(i === columnCount - 1 ? base + remainder : base),
  );
  const newRow: ContentRow = { id: crypto.randomUUID(), columns };
  const rows = [...schema.rows];
  if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= rows.length) {
    rows.splice(insertIndex, 0, newRow);
  } else {
    rows.push(newRow);
  }
  return { rows };
}

export function deleteColumn(schema: ContentSchema, rowId: string, columnId: string): ContentSchema {
  return {
    rows: schema.rows.map((row) => {
      if (row.id !== rowId || row.columns.length <= 1) return row;
      const newColumns = row.columns.filter((c) => c.id !== columnId);
      const count = newColumns.length;
      const base = Math.floor(100 / count);
      const remainder = 100 - base * count;
      const rebalancedColumns = newColumns.map((column, columnIndex) => ({
        ...column,
        width: columnIndex === count - 1 ? base + remainder : base,
      }));
      return { ...row, columns: rebalancedColumns };
    }),
  };
}

export function deleteRow(schema: ContentSchema, rowId: string): ContentSchema {
  return { rows: schema.rows.filter((row) => row.id !== rowId) };
}

export function moveRow(schema: ContentSchema, fromIndex: number, toIndex: number): ContentSchema {
  const rows = [...schema.rows];
  const removed = rows.splice(fromIndex, 1)[0];
  if (!removed) return schema;
  rows.splice(toIndex, 0, removed);
  return { rows };
}

export function addColumn(schema: ContentSchema, rowId: string): ContentSchema {
  return {
    rows: schema.rows.map((row) => {
      if (row.id !== rowId || row.columns.length >= 5) return row;
      const count = row.columns.length + 1;
      const base = Math.floor(100 / count);
      const remainder = 100 - base * count;
      const newCols = [...row.columns, createColumn(0)].map((column, columnIndex) => ({
        ...column,
        width: columnIndex === count - 1 ? base + remainder : base,
      }));
      return { ...row, columns: newCols };
    }),
  };
}

export function setColumnWidths(schema: ContentSchema, rowId: string, widths: number[]): ContentSchema {
  return {
    rows: schema.rows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        columns: row.columns.map((column, columnIndex) => ({ ...column, width: widths[columnIndex] ?? column.width })),
      };
    }),
  };
}

export function addComponent(
  schema: ContentSchema,
  rowId: string,
  columnId: string,
  type: ContentComponentType,
  overId?: string,
): ContentSchema {
  return {
    rows: schema.rows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        columns: row.columns.map((column) => {
          if (column.id !== columnId) return column;

          const newComp = createComponent(type);
          if (overId) {
            const idx = column.children.findIndex((c) => c.id === overId);
            if (idx !== -1) {
              const next = [...column.children];
              next.splice(idx, 0, newComp);
              return { ...column, children: next };
            }
          }

          return { ...column, children: [...column.children, newComp] };
        }),
      };
    }),
  };
}

function patchColumn(
  column: ContentColumn,
  componentId: string,
  patch: (c: ContentComponentNode[]) => ContentComponentNode[],
): ContentColumn {
  return {
    ...column,
    children: patch(column.children),
  };
}

export function changeComponentType(schema: ContentSchema, componentId: string, newType: ContentComponentType): ContentSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) =>
        patchColumn(column, componentId, (children) => children.map((c) => (c.id === componentId ? { ...c, type: newType } : c))),
      ),
    })),
  };
}

export function deleteComponent(schema: ContentSchema, componentId: string): ContentSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) => patchColumn(column, componentId, (children) => children.filter((c) => c.id !== componentId))),
    })),
  };
}

export function updateComponentData(schema: ContentSchema, componentId: string, data: ContentComponentData): ContentSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) =>
        patchColumn(column, componentId, (children) =>
          children.map((c) => (c.id === componentId ? { ...c, data: { ...c.data, ...data } } : c)),
        ),
      ),
    })),
  };
}

export function moveContentItem(
  schema: ContentSchema,
  activeId: string,
  overId: string,
  sourceRowId?: string,
  sourceColId?: string,
  targetRowId?: string,
  targetColId?: string,
): ContentSchema {
  if (activeId === overId) return schema;

  const removeFn = (rows: ContentRow[]): { rows: ContentRow[]; movedItem: ContentComponentNode | null } => {
    let moved: ContentComponentNode | null = null;
    const nextRows = rows.map((row) => {
      return {
        ...row,
        columns: row.columns.map((column) => {
          const childIdx = column.children.findIndex((c) => c.id === activeId);
          if (childIdx !== -1) {
            moved = column.children[childIdx]!;
            return { ...column, children: column.children.filter((c) => c.id !== activeId) };
          }
          return column;
        }),
      };
    });
    return { rows: nextRows, movedItem: moved };
  };

  const { rows: rowsAfterRemoval, movedItem } = removeFn(schema.rows);
  if (!movedItem) return schema;

  const insertFn = (rows: ContentRow[]): ContentRow[] => {
    return rows.map((row) => {
      return {
        ...row,
        columns: row.columns.map((column) => {
          if (column.id === targetColId) {
            const childIdx = column.children.findIndex((c) => c.id === overId);
            if (childIdx !== -1) {
              const next = [...column.children];
              next.splice(childIdx, 0, movedItem);
              return { ...column, children: next };
            }
            if (column.children.length === 0) {
              return { ...column, children: [movedItem as ContentComponentNode] };
            }
            return { ...column, children: [...column.children, movedItem] };
          }
          return column;
        }),
      };
    });
  };

  return { rows: insertFn(rowsAfterRemoval) };
}
