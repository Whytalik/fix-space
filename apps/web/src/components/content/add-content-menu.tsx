"use client";

import { Button } from "@/components/ui/primitives/button";
import { BlockType } from "@nucleus/domain";
import type { ContentNode } from "@nucleus/domain";
import { AlignLeft, Heading, Image, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BLOCK_PRESETS } from "./block-presets";

type AddContentMenuProps = {
  onAdd: (node: ContentNode) => void;
};

interface LeafPreset {
  key: string;
  label: string;
  icon: React.ReactNode;
  generate: () => ContentNode;
}

const LEAF_PRESETS: LeafPreset[] = [
  {
    key: "TEXT",
    label: "Text",
    icon: <AlignLeft size={13} />,
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.TEXT,
      content: { text: "" },
    }),
  },
  {
    key: "HEADING",
    label: "Heading",
    icon: <Heading size={13} />,
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.HEADING,
      content: { level: 2, text: "" },
    }),
  },
  {
    key: "IMAGE",
    label: "Image",
    icon: <Image size={13} />,
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.IMAGE,
      content: { url: "" },
    }),
  },
  {
    key: "DIVIDER",
    label: "Divider",
    icon: <Minus size={13} />,
    generate: () => ({
      id: crypto.randomUUID(),
      type: BlockType.DIVIDER,
      content: {},
    }),
  },
];

export function AddContentMenu({ onAdd }: AddContentMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function getMenuPosition() {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: "fixed" as const,
      top: rect.bottom + 4,
      left: rect.left,
      zIndex: 9999,
    };
  }

  function handleSelect(node: ContentNode) {
    onAdd(node);
    setOpen(false);
  }

  const menuStyle = open ? getMenuPosition() : {};

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 text-ink-muted"
      >
        <Plus size={13} />
        Add
      </Button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="min-w-44 bg-elevated border border-stroke rounded-lg shadow-lg overflow-hidden py-1"
          >
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Components
            </p>
            {LEAF_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleSelect(preset.generate())}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-ink hover:bg-surface transition-colors"
              >
                <span className="shrink-0 flex items-center text-ink-muted">{preset.icon}</span>
                {preset.label}
              </button>
            ))}

            <div className="my-1 border-t border-stroke" />

            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Blocks
            </p>
            {BLOCK_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleSelect(preset.generate())}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-ink hover:bg-surface transition-colors"
              >
                <span className="shrink-0 text-sm">{preset.icon}</span>
                <span>
                  {preset.label}
                  <span className="ml-1.5 text-ink-muted">{preset.description}</span>
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
