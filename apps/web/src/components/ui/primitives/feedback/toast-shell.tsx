"use client";

import { useUIContext } from "@/context/ui-context";
import { Toast } from "./toast";

export function ToastShell() {
  const { toast, clearToast } = useUIContext();

  if (!toast) return null;

  return <Toast message={toast.message} variant={toast.variant} onDismiss={clearToast} />;
}
