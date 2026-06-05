import type { DatabaseType } from "@fixspace/domain";

export interface SeedRelation {
  type: DatabaseType;
  name: string;
}

export interface SeedRecord {
  name: string;
  icon?: string;
  values?: Record<string, unknown>;
  relations?: Record<string, SeedRelation | SeedRelation[]>;
}
