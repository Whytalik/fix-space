"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
import { FilterPanelContent } from "./filter-panel/filter-panel-content";

export { FilterPanelContent };

interface FilterPanelProps {
  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

export function FilterPanel({ anchorEl, onClose }: FilterPanelProps) {
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
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 w-[680px] max-w-[calc(100vw-2rem)] flex flex-col gap-2"
    >
      <FilterPanelContent />
    </div>,
    document.body,
  );
}
