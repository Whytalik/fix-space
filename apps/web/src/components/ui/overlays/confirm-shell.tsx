"use client";

import { useUIContext } from "@/context/ui-context";
import { ConfirmDialog } from "./confirm-dialog";

export function ConfirmShell() {
  const { confirmState, clearConfirm } = useUIContext();

  if (!confirmState) return null;

  return (
    <ConfirmDialog
      title={confirmState.title}
      description={confirmState.message}
      confirmLabel={confirmState.confirmLabel}
      cancelLabel={confirmState.cancelLabel}
      variant={confirmState.variant || "danger"}
      onConfirm={() => {
        confirmState.onConfirm();
        clearConfirm();
      }}
      onCancel={() => {
        confirmState.onCancel?.();
        clearConfirm();
      }}
    />
  );
}
