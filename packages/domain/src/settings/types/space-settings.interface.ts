export interface SpaceSettings {
  defaultSpaceIcon: string;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  sidebarDisplay: {
    showSections: boolean;
    showDatabases: boolean;
    showRecentlyVisited: boolean;
  };
  dateFormat: string;
  timeFormat: "12h" | "24h";
  startOfWeek: 0 | 1;
}

export const DEFAULT_SPACE_SETTINGS = {
  defaultSpaceIcon: "📊",
  sidebarCollapsed: false,
  sidebarWidth: 280,
  sidebarDisplay: {
    showSections: true,
    showDatabases: true,
    showRecentlyVisited: true,
  },
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  startOfWeek: 1,
} satisfies SpaceSettings;
