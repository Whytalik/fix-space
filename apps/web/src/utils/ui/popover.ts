import type { CSSProperties } from "react";

export function getPopoverStyle(anchorEl: HTMLElement): CSSProperties {
  const rect = anchorEl.getBoundingClientRect();
  return { position: "fixed", top: rect.bottom + 4, left: rect.left, zIndex: 9999 };
}
