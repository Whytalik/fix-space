"use client";

import { useEscape } from "./use-escape";
import { type RefObject, useEffect } from "react";

export function useFloatingPanel(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  anchorEl?: HTMLElement | null,
  excludeSelector?: string,
) {
  useEffect(() => {
    function handler(event: MouseEvent) {
      if (excludeSelector && (event.target as Element)?.closest(excludeSelector)) return;
      if (containerRef.current?.contains(event.target as Node)) return;
      if (anchorEl?.contains(event.target as Node)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [containerRef, onClose, anchorEl, excludeSelector]);

  useEscape(onClose);
}
