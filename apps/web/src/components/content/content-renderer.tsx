"use client";

import { BlockType } from "@nucleus/domain";
import type { ContentNode } from "@nucleus/domain";
import { DividerBlock } from "./nodes/divider-block";
import { HeadingBlock } from "./nodes/heading-block";
import { ImageBlock } from "./nodes/image-block";
import { TextBlock } from "./nodes/text-block";
import { BlockNode } from "./nodes/block-node";
import { ColumnNode } from "./nodes/column-node";
import { RowNode } from "./nodes/row-node";

type ContentRendererProps = {
  node: ContentNode;
  onChange: (updated: ContentNode) => void;
  onDelete?: () => void;
};

export function ContentRenderer({ node, onChange, onDelete }: ContentRendererProps) {
  function handleLeafChange(content: Record<string, unknown>) {
    onChange({ ...node, content } as ContentNode);
  }

  switch (node.type) {
    case BlockType.TEXT:
      return (
        <TextBlock
          node={node as import("@nucleus/domain").LeafBlock}
          onChange={handleLeafChange}
          onDelete={onDelete ?? (() => {})}
        />
      );
    case BlockType.HEADING:
      return (
        <HeadingBlock
          node={node as import("@nucleus/domain").LeafBlock}
          onChange={handleLeafChange}
          onDelete={onDelete ?? (() => {})}
        />
      );
    case BlockType.IMAGE:
      return (
        <ImageBlock
          node={node as import("@nucleus/domain").LeafBlock}
          onChange={handleLeafChange}
          onDelete={onDelete ?? (() => {})}
        />
      );
    case BlockType.DIVIDER:
      return (
        <DividerBlock
          node={node as import("@nucleus/domain").LeafBlock}
          onDelete={onDelete ?? (() => {})}
        />
      );
    case BlockType.ROW:
      return (
        <RowNode
          node={node as import("@nucleus/domain").ContainerBlock}
          onChange={(updated) => onChange(updated)}
          onDelete={onDelete}
        />
      );
    case BlockType.COLUMN:
      return (
        <ColumnNode
          node={node as import("@nucleus/domain").ContainerBlock}
          onChange={(updated) => onChange(updated)}
        />
      );
    case BlockType.BLOCK:
      return (
        <BlockNode
          node={node as import("@nucleus/domain").ContainerBlock}
          onChange={(updated) => onChange(updated)}
          onDelete={onDelete}
        />
      );
    default:
      return null;
  }
}
