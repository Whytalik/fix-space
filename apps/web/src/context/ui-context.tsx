"use client";

import { parseApiErrors } from "@/lib/api/client";
import { createContext, useCallback, useContext, useState } from "react";

export type SettingsCategory = "profile" | "space" | "database" | "section" | "appearance" | "integration" | "view";
export type ToastVariant = "success" | "error" | "info";

export interface ToastState {
  message: string;
  variant?: ToastVariant;
}

export interface ConfirmState {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface UIContextValue {
  isSettingsOpen: boolean;
  settingsCategory: SettingsCategory;
  openSettings: (category?: SettingsCategory) => void;
  closeSettings: () => void;
  errorMessages: string[] | null;
  showError: (error: unknown) => void;
  clearError: () => void;
  toast: ToastState | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  clearToast: () => void;
  confirmState: ConfirmState | null;
  showConfirm: (state: ConfirmState) => void;
  clearConfirm: () => void;
}

const UIContext = createContext<UIContextValue>({
  isSettingsOpen: false,
  settingsCategory: "profile",
  openSettings: () => {},
  closeSettings: () => {},
  errorMessages: null,
  showError: () => {},
  clearError: () => {},
  toast: null,
  showToast: () => {},
  clearToast: () => {},
  confirmState: null,
  showConfirm: () => {},
  clearConfirm: () => {},
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[] | null>(null);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>("profile");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const openSettings = useCallback((category?: SettingsCategory) => {
    if (category) setSettingsCategory(category);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const showError = useCallback((error: unknown) => {
    setErrorMessages(parseApiErrors(error));
  }, []);

  const clearError = useCallback(() => setErrorMessages(null), []);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ message, variant });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const showConfirm = useCallback((state: ConfirmState) => {
    setConfirmState(state);
  }, []);

  const clearConfirm = useCallback(() => setConfirmState(null), []);

  return (
    <UIContext.Provider
      value={{
        isSettingsOpen,
        settingsCategory,
        openSettings,
        closeSettings,
        errorMessages,
        showError,
        clearError,
        toast,
        showToast,
        clearToast,
        confirmState,
        showConfirm,
        clearConfirm,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  return useContext(UIContext);
}
