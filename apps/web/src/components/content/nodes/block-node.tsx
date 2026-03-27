"use client";

import { ContentRenderer } from "@/components/content/content-renderer";
import type { ContainerBlock, ContentNode } from "@nucleus/domain";
import { Trash2 } from "lucide-react";
import { BLOCK_PRESETS } from "../block-presets";

type BlockNodeProps = {
  node: ContainerBlock;
  onChange: (updated: ContainerBlock) => void;
  onDelete?: () => void;
};

function getPresetMeta(blockType: string | undefined) {
  if (!blockType) return null;
  return BLOCK_PRESETS.find((p) => p.key === blockType) ?? null;
}

export function BlockNode({ node, onChange, onDelete }: BlockNodeProps) {
  const preset = getPresetMeta(node.blockType);
  const label = preset ? `${preset.icon} ${preset.label}` : (node.blockType ?? "Block");

  function handleChildChange(index: number, updated: ContentNode) {
    const children = [...node.children];
    children[index] = updated;
    onChange({ ...node, children });
  }

  function handleChildDelete(index: number) {
    const children = node.children.filter((_, i) => i !== index);
    onChange({ ...node, children });
  }

  return (
    <div className="group relative border border-stroke rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-elevated border-b border-stroke">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted select-none">
          {label}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete block"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded text-ink-muted hover:text-error hover:bg-error/10"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        {node.children.map((child, index) => (
          <ContentRenderer
            key={child.id}
            node={child}
            onChange={(updated) => handleChildChange(index, updated)}
            onDelete={() => handleChildDelete(index)}
          />
        ))}
      </div>
    </div>
  );
}
