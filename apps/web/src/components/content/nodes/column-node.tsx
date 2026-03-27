"use client";

import { AddContentMenu } from "@/components/content/add-content-menu";
import { ContentRenderer } from "@/components/content/content-renderer";
import type { ContainerBlock, ContentNode } from "@nucleus/domain";

type ColumnNodeProps = {
  node: ContainerBlock;
  onChange: (updated: ContainerBlock) => void;
};

export function ColumnNode({ node, onChange }: ColumnNodeProps) {
  function handleChildChange(index: number, updated: ContentNode) {
    const children = [...node.children];
    children[index] = updated;
    onChange({ ...node, children });
  }

  function handleChildDelete(index: number) {
    const children = node.children.filter((_, i) => i !== index);
    onChange({ ...node, children });
  }

  function handleAdd(newNode: ContentNode) {
    onChange({ ...node, children: [...node.children, newNode] });
  }

  return (
    <div className="flex flex-col gap-1 min-h-8 flex-1">
      {node.children.map((child, index) => (
        <ContentRenderer
          key={child.id}
          node={child}
          onChange={(updated) => handleChildChange(index, updated)}
          onDelete={() => handleChildDelete(index)}
        />
      ))}
      <div className="flex justify-start pt-1">
        <AddContentMenu onAdd={handleAdd} />
      </div>
    </div>
  );
}
