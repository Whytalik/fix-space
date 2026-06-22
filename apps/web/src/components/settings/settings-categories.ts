import type { SettingsCategory } from "@/context/ui-context";
import { Box, Database, FileText, FolderOpen, LayoutTemplate, Palette, Puzzle, Table2, User, type LucideIcon } from "lucide-react";

export interface SettingsCategoryConfig {
  id: SettingsCategory;
  icon: LucideIcon;
  i18nKey: string;
}

export const SETTINGS_CATEGORIES: SettingsCategoryConfig[] = [
  { id: "profile", icon: User, i18nKey: "profile" },
  { id: "space", icon: Box, i18nKey: "space" },
  { id: "appearance", icon: Palette, i18nKey: "appearance" },
  { id: "database", icon: Database, i18nKey: "database" },
  { id: "template", icon: LayoutTemplate, i18nKey: "template" },
  { id: "record", icon: FileText, i18nKey: "record" },
  { id: "section", icon: FolderOpen, i18nKey: "section" },
  { id: "view", icon: Table2, i18nKey: "view" },
  { id: "integration", icon: Puzzle, i18nKey: "integration" },
];
