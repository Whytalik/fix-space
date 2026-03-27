"use client";

import type { LeafBlock } from "@nucleus/domain";
import { Trash2 } from "lucide-react";

type DividerBlockProps = {
  node: LeafBlock;
  onDelete: () => void;
};

export function DividerBlock({ node: _node, onDelete }: DividerBlockProps) {
  return (
    <div className="group relative py-2 flex items-center gap-2">
      <hr className="flex-1 border-0 border-t border-stroke" />
      <button
        type="button"
        onClick={onDelete}
        title="Delete block"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded text-ink-muted hover:text-error hover:bg-error/10"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
