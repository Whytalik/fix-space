export interface SpaceSettings {
  defaultSpaceIcon: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  startOfWeek: 0 | 1;
}

export const DEFAULT_SPACE_SETTINGS = {
  defaultSpaceIcon: "icon:LayoutDashboard",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  startOfWeek: 1,
} satisfies SpaceSettings;
