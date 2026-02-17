export interface SpaceSettings {
  defaultDatabaseIcon: string;
  defaultSectionIcon: string;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  sidebarDisplay: {
    showSections: boolean;
    showDatabases: boolean;
    showRecentlyVisited: boolean;
  };
  defaultViewType: 'table';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  startOfWeek: 0 | 1;
}

export const DEFAULT_SPACE_SETTINGS: SpaceSettings = {
  defaultDatabaseIcon: '📊',
  defaultSectionIcon: '📁',
  sidebarCollapsed: false,
  sidebarWidth: 280,
  sidebarDisplay: {
    showSections: true,
    showDatabases: true,
    showRecentlyVisited: true,
  },
  defaultViewType: 'table',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  startOfWeek: 1,
};
