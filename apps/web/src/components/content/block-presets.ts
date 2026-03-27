import { BlockType } from "@nucleus/domain";
import type { ContainerBlock } from "@nucleus/domain";

export interface BlockPreset {
  key: string;
  label: string;
  icon: string;
  description: string;
  generate: () => ContainerBlock;
}

export const BLOCK_PRESETS: BlockPreset[] = [
  {
    key: "NOTE",
    label: "Note",
    icon: "📝",
    description: "Heading + text paragraph",
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.BLOCK,
      blockType: "NOTE",
      children: [
        { id: crypto.randomUUID(), type: BlockType.HEADING, content: { level: 2, text: "" } },
        { id: crypto.randomUUID(), type: BlockType.TEXT, content: { text: "" } },
      ],
    }),
  },
  {
    key: "SUMMARY",
    label: "Summary",
    icon: "📋",
    description: "Heading + text + divider",
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.BLOCK,
      blockType: "SUMMARY",
      children: [
        { id: crypto.randomUUID(), type: BlockType.HEADING, content: { level: 2, text: "" } },
        { id: crypto.randomUUID(), type: BlockType.TEXT, content: { text: "" } },
        { id: crypto.randomUUID(), type: BlockType.DIVIDER, content: {} },
      ],
    }),
  },
];
