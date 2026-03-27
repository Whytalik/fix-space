"use client";

import type { LeafBlock } from "@nucleus/domain";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type HeadingBlockProps = {
  node: LeafBlock;
  onChange: (content: Record<string, unknown>) => void;
  onDelete: () => void;
};

const LEVEL_STYLES: Record<number, string> = {
  1: "text-2xl font-bold",
  2: "text-xl font-semibold",
  3: "text-lg font-medium",
};

export function HeadingBlock({ node, onChange, onDelete }: HeadingBlockProps) {
  const [focused, setFocused] = useState(false);

  const text = typeof node.content?.text === "string" ? node.content.text : "";
  const level = typeof node.content?.level === "number" ? node.content.level : 2;
  const levelStyle = LEVEL_STYLES[level] ?? LEVEL_STYLES[2];

  function cycleLevel() {
    const next = level >= 3 ? 1 : level + 1;
    onChange({ ...node.content, level: next });
  }

  return (
    <div className="group relative flex items-center gap-1">
      {(focused || true) && (
        <button
          type="button"
          onClick={cycleLevel}
          title={`Heading level ${level} — click to change`}
          className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 text-[10px] font-bold text-ink-muted hover:text-ink border border-stroke rounded px-1 py-0.5 leading-none select-none"
          tabIndex={-1}
        >
          H{level}
        </button>
      )}
      <input
        type="text"
        value={text}
        placeholder={`Heading ${level}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange({ ...node.content, text: e.target.value })}
        className={`flex-1 min-w-0 bg-transparent text-ink placeholder:text-ink-muted border border-transparent rounded-md px-2 py-1 focus:outline-none focus:border-stroke transition-colors duration-150 ${levelStyle}`}
      />
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
