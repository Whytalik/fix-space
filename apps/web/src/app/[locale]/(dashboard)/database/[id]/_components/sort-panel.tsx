"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
import { SortPanelContent } from "./sort-panel/sort-panel-content";

export { SortPanelContent };

interface SortPanelProps {
  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

export function SortPanel({ anchorEl, onClose }: SortPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFloatingPanel(containerRef, onClose, anchorEl);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
    zIndex: 9999,
  };

  return createPortal(
    <div
      ref={containerRef}
      style={panelStyle}
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 min-w-72 flex flex-col gap-2"
    >
      <SortPanelContent />
    </div>,
    document.body,
  );
}
