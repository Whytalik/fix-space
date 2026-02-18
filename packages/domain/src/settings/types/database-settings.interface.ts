
export interface DatabaseSettings {
  defaultDatabaseIcon: string;
  defaultViewType: 'table';
}

export const DEFAULT_DATABASE_SETTINGS = {
  defaultDatabaseIcon: '📊',
  defaultViewType: 'table',
} satisfies DatabaseSettings;
