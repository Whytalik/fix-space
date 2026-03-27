import type { BlockType } from '@nucleus/domain';

export interface ContentNode {
  id: string;
  type: BlockType;
}

export interface LeafBlock extends ContentNode {
  type: BlockType.TEXT | BlockType.HEADING | BlockType.IMAGE | BlockType.DIVIDER;
  content: Record<string, unknown>;
}

export interface ContainerBlock extends ContentNode {
  type: BlockType.ROW | BlockType.COLUMN | BlockType.BLOCK;
  columns?: number;
  blockType?: string;
  children: ContentNode[];
}
