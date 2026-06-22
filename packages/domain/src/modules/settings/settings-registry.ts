import {
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_RECORD_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DEFAULT_TEMPLATE_SETTINGS,
  DEFAULT_USER_SETTINGS,
  DEFAULT_VIEW_SETTINGS,
} from "./types";

export enum SettingsCategory {
  USER = "user",
  SPACE = "space",
  DATABASE = "database",
  SECTION = "section",
  RECORD = "record",
  TEMPLATE = "template",
  VIEW = "view",
}

export type IconCategory =
  | SettingsCategory.DATABASE
  | SettingsCategory.RECORD
  | SettingsCategory.SECTION
  | SettingsCategory.SPACE
  | SettingsCategory.TEMPLATE
  | SettingsCategory.VIEW;

export interface IconCategoryMap {
  [SettingsCategory.DATABASE]: "defaultDatabaseIcon";
  [SettingsCategory.RECORD]: "defaultRecordIcon";
  [SettingsCategory.SECTION]: "defaultSectionIcon";
  [SettingsCategory.SPACE]: "defaultSpaceIcon";
  [SettingsCategory.TEMPLATE]: "defaultTemplateIcon";
  [SettingsCategory.VIEW]: "defaultViewIcon";
}

export const ICON_KEY_MAP: IconCategoryMap = {
  [SettingsCategory.DATABASE]: "defaultDatabaseIcon",
  [SettingsCategory.RECORD]: "defaultRecordIcon",
  [SettingsCategory.SECTION]: "defaultSectionIcon",
  [SettingsCategory.SPACE]: "defaultSpaceIcon",
  [SettingsCategory.TEMPLATE]: "defaultTemplateIcon",
  [SettingsCategory.VIEW]: "defaultViewIcon",
};

export const DEFAULT_SETTINGS_MAP: Record<SettingsCategory, object> = {
  [SettingsCategory.USER]: DEFAULT_USER_SETTINGS,
  [SettingsCategory.SPACE]: DEFAULT_SPACE_SETTINGS,
  [SettingsCategory.DATABASE]: DEFAULT_DATABASE_SETTINGS,
  [SettingsCategory.SECTION]: DEFAULT_SECTION_SETTINGS,
  [SettingsCategory.RECORD]: DEFAULT_RECORD_SETTINGS,
  [SettingsCategory.TEMPLATE]: DEFAULT_TEMPLATE_SETTINGS,
  [SettingsCategory.VIEW]: DEFAULT_VIEW_SETTINGS,
};
