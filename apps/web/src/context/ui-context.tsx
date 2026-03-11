"use client";

import { parseApiErrors } from "@/lib/api/client";
import { createContext, useCallback, useContext, useState } from "react";

interface UIContextValue {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  errorMessages: string[] | null;
  showError: (err: unknown) => void;
  clearError: () => void;
}

const UIContext = createContext<UIContextValue>({
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  errorMessages: null,
  showError: () => {},
  clearError: () => {},
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[] | null>(null);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const showError = useCallback((err: unknown) => setErrorMessages(parseApiErrors(err)), []);
  const clearError = useCallback(() => setErrorMessages(null), []);

  return (
    <UIContext.Provider value={{ isSettingsOpen, openSettings, closeSettings, errorMessages, showError, clearError }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  return useContext(UIContext);
}
