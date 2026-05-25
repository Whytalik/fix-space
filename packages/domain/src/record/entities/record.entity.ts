import type { Database } from "../../database/entities/database.entity";
import type { PropertyValue } from "../../property-value/entities/property-value.entity";

export class DatabaseRecord {
  id: string;
  databaseId: string;
  templateId?: string;
  sourceIntegrationId?: string;
  sourceLabel?: string;
  sourcePositionId?: string;
  sourceCurrency?: string;
  name: string;
  icon?: string;
  config?: Record<string, unknown>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  database?: Database;
  values?: PropertyValue[];

  constructor(partial: Partial<DatabaseRecord>) {
    Object.assign(this, partial);
  }
}
