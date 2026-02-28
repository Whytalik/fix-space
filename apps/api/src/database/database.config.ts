export type DatabaseType =
  | "trading-journal"
  | "daily-routine"
  | "notes"
  | "mistakes"
  | "accounts"
  | "trading-system"
  | "custom";

export interface DatabaseConfig {
  version: number;
  type: DatabaseType;
  [key: string]: unknown;
}

export const defaultDatabaseConfig: DatabaseConfig = {
  version: 1,
  type: "custom",
};
