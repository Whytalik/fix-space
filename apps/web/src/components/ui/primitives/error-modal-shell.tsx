"use client";

import { useUIContext } from "@/context/ui-context";
import { ErrorModal } from "./error-modal";

export function ErrorModalShell() {
  const { errorMessages, clearError } = useUIContext();
  if (!errorMessages) return null;
  return <ErrorModal messages={errorMessages} onClose={clearError} />;
}
