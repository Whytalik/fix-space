import type { Database } from "../../database/entities/database.entity";
import type { PropertyValue } from "../../property-value/entities/property-value.entity";

export class DatabaseRecord {
  id: string;
  databaseId: string;
  name: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, unknown>;

  database?: Database;
  values?: PropertyValue[];

  constructor(partial: Partial<DatabaseRecord>) {
    Object.assign(this, partial);
  }
}


