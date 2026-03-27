"use client";

import type { LeafBlock } from "@nucleus/domain";
import { Trash2 } from "lucide-react";
import { useRef } from "react";

type TextBlockProps = {
  node: LeafBlock;
  onChange: (content: Record<string, unknown>) => void;
  onDelete: () => void;
};

export function TextBlock({ node, onChange, onDelete }: TextBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const text = typeof node.content?.text === "string" ? node.content.text : "";

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    onChange({ ...node.content, text: el.value });
  }

  return (
    <div className="group relative">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        placeholder="Start typing…"
        onInput={handleInput}
        onChange={(e) => onChange({ ...node.content, text: e.target.value })}
        className="w-full resize-none overflow-hidden bg-transparent text-sm text-ink placeholder:text-ink-muted leading-relaxed border border-transparent rounded-md px-2 py-1.5 focus:outline-none focus:border-stroke transition-colors duration-150"
        style={{ minHeight: "2rem" }}
      />
      <button
        type="button"
        onClick={onDelete}
        title="Delete block"
        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded text-ink-muted hover:text-error hover:bg-error/10"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
