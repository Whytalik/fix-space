"use client";

import type { LeafBlock } from "@nucleus/domain";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type ImageBlockProps = {
  node: LeafBlock;
  onChange: (content: Record<string, unknown>) => void;
  onDelete: () => void;
};

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function ImageBlock({ node, onChange, onDelete }: ImageBlockProps) {
  const url = typeof node.content?.url === "string" ? node.content.url : "";
  const [imgError, setImgError] = useState(false);

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImgError(false);
    onChange({ ...node.content, url: e.target.value });
  }

  const showPreview = url && isValidUrl(url) && !imgError;

  return (
    <div className="group relative flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={url}
          placeholder="Paste image URL…"
          onChange={handleUrlChange}
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-muted border border-stroke rounded-md px-2 py-1.5 focus:outline-none focus:border-accent transition-colors duration-150"
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
      {showPreview && (
        <div className="rounded-md overflow-hidden border border-stroke">
          <img
            src={url}
            alt="Image preview"
            onError={() => setImgError(true)}
            className="max-w-full h-auto block"
          />
        </div>
      )}
      {url && !showPreview && !imgError && (
        <p className="text-xs text-ink-muted px-1">Enter a valid URL to preview the image.</p>
      )}
      {imgError && (
        <p className="text-xs text-error px-1">Could not load image from this URL.</p>
      )}
    </div>
  );
}
