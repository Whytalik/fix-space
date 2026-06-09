"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
};

const DURATION = 3500;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-success/30 bg-success-bg text-success",
  error: "border-error/30 bg-error-bg text-error",
  info: "border-stroke bg-elevated text-ink",
};

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setVisible(false), DURATION);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
  }, [visible]);

  function handleTransitionEnd() {
    if (!visible) onDismiss();
  }

  function handleDismiss() {
    setVisible(false);
  }

  return createPortal(
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${VARIANT_STYLES[variant]}`}
    >
      <span>{message}</span>
      <button type="button" onClick={handleDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>,
    document.body,
  );
}
