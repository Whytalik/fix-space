"use client";

import { parseApiErrors } from "@/lib/api/client";
import { createContext, useCallback, useContext, useState } from "react";

export type SettingsCategory = "profile" | "space" | "database" | "section" | "appearance";

interface UIContextValue {
  isSettingsOpen: boolean;
  settingsCategory: SettingsCategory;
  openSettings: (category?: SettingsCategory) => void;
  closeSettings: () => void;
  errorMessages: string[] | null;
  showError: (err: unknown) => void;
  clearError: () => void;
}

const UIContext = createContext<UIContextValue>({
  isSettingsOpen: false,
  settingsCategory: "profile",
  openSettings: () => {},
  closeSettings: () => {},
  errorMessages: null,
  showError: () => {},
  clearError: () => {},
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[] | null>(null);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>("profile");

  const openSettings = useCallback((category?: SettingsCategory) => {
    if (category) setSettingsCategory(category);
    setIsSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const showError = useCallback((err: unknown) => setErrorMessages(parseApiErrors(err)), []);
  const clearError = useCallback(() => setErrorMessages(null), []);

  return (
    <UIContext.Provider value={{ isSettingsOpen, settingsCategory, openSettings, closeSettings, errorMessages, showError, clearError }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  return useContext(UIContext);
}
