import type { Database } from "../../database/entities/database.entity";
import type { ImportStatus } from "../dto/create-import-mapping.dto";

export class ImportMapping {
  id: string;
  databaseId: string;
  name: string;
  sourceType: string;
  mappingRules: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  database?: Database;
  imports?: ImportHistory[];

  constructor(partial: Partial<ImportMapping>) {
    Object.assign(this, partial);
  }
}

export class ImportHistory {
  id: string;
  importMappingId: string;
  status: ImportStatus;
  recordsCreated: number;
  recordsFailed: number;
  errorLog?: unknown;
  sourceFileInfo: unknown;
  createdAt: Date;
  completedAt?: Date;

  importMapping?: ImportMapping;

  constructor(partial: Partial<ImportHistory>) {
    Object.assign(this, partial);
  }
}
