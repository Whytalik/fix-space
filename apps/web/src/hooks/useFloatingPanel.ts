"use client";

import { useEscape } from "@/hooks/useEscape";
import { type RefObject, useEffect } from "react";

export function useFloatingPanel(containerRef: RefObject<HTMLElement | null>, onClose: () => void, anchorEl?: HTMLElement | null) {
  useEffect(() => {
    function handler(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      if (anchorEl?.contains(event.target as Node)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [containerRef, onClose, anchorEl]);

  useEscape(onClose);
}
