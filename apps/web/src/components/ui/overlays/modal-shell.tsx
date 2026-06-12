"use client";

import { useEscape } from "@/hooks/ui/use-escape";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

const maxWidths = {
  sm: "max-w-[480px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
  xl: "max-w-[860px]",
};

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
  headerPrefix?: ReactNode;
  headerSuffix?: ReactNode;
}

export function ModalShell({ isOpen, onClose, title, size = "md", children, footer, headerPrefix, headerSuffix }: ModalShellProps) {
  useEscape(onClose);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full ${maxWidths[size]} mx-4 max-h-[85vh] flex flex-col bg-surface border border-stroke rounded-2xl shadow-lg overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke shrink-0">
          <div className="flex items-center gap-2">
            {headerPrefix}
            <h2 className="type-modal-title">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {headerSuffix}
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas rounded p-0.5"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto scrollbar flex-1">{children}</div>

        {footer && <div className="px-6 py-4 border-t border-stroke shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
