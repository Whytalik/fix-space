"use client";

import { ColumnLayoutPicker } from "@/components/content/column-layout-picker";
import { ColumnNode } from "@/components/content/nodes/column-node";
import { BlockType } from "@nucleus/domain";
import type { ContainerBlock, ContentNode } from "@nucleus/domain";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type RowNodeProps = {
  node: ContainerBlock;
  onChange: (updated: ContainerBlock) => void;
  onDelete?: () => void;
};

function buildColumns(count: number, existing: ContentNode[]): ContainerBlock[] {
  const columns: ContainerBlock[] = [];
  for (let i = 0; i < count; i++) {
    const existingCol = existing[i] as ContainerBlock | undefined;
    if (existingCol && existingCol.type === BlockType.COLUMN) {
      columns.push(existingCol);
    } else {
      columns.push({
        id: crypto.randomUUID(),
        type: BlockType.COLUMN,
        children: [],
      });
    }
  }
  return columns;
}

export function RowNode({ node, onChange, onDelete }: RowNodeProps) {
  const [hovered, setHovered] = useState(false);
  const columnCount = node.columns ?? 1;

  const columns = buildColumns(columnCount, node.children);

  function handleColumnChange(index: number, updated: ContainerBlock) {
    const newColumns = [...columns];
    newColumns[index] = updated;
    onChange({ ...node, children: newColumns });
  }

  function handleLayoutChange(newColumns: number) {
    const updatedColumns = buildColumns(newColumns, node.children);
    onChange({ ...node, columns: newColumns, children: updatedColumns });
  }

  return (
    <div
      className="group relative border border-transparent hover:border-stroke rounded-lg transition-colors duration-150"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="absolute -top-8 left-0 flex items-center gap-2 z-10">
          <ColumnLayoutPicker current={columnCount} onChange={handleLayoutChange} />
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete row"
              className="p-1 rounded bg-elevated border border-stroke text-ink-muted hover:text-error hover:bg-error/10 transition-colors duration-150"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}

      <div
        className="flex gap-3 p-2"
        style={{ display: "flex", gap: "0.75rem" }}
      >
        {columns.map((col, index) => (
          <ColumnNode
            key={col.id}
            node={col}
            onChange={(updated) => handleColumnChange(index, updated)}
          />
        ))}
      </div>
    </div>
  );
}
