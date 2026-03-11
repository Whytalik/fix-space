"use client";

import { useUIContext } from "@/context/ui-context";
import { SettingsModal } from "./settings-modal";

export function SettingsShell() {
  const { isSettingsOpen, closeSettings } = useUIContext();
  if (!isSettingsOpen) return null;
  return <SettingsModal onClose={closeSettings} />;
}
