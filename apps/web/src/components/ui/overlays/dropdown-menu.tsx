"use client";

import { useEscape } from "@/hooks/ui/use-escape";
import { getPopoverStyle } from "@/utils/ui/popover";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function DropdownMenu({ items, onClose, anchorEl }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEscape(onClose);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node) || anchorEl?.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [onClose, anchorEl]);

  if (!anchorEl) return null;

  const style = getPopoverStyle(anchorEl);

  return createPortal(
    <div ref={menuRef} style={style} className="min-w-36 bg-elevated border border-stroke rounded-lg shadow-lg overflow-hidden py-1">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors duration-150 hover:bg-surface ${
            item.variant === "danger" ? "text-error hover:text-error" : "text-ink"
          }`}
        >
          {item.icon && <span className="shrink-0 flex items-center">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
