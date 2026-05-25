import type { Database } from "../../database/entities/database.entity";
import type { PropertyType } from "../dto/create-property.dto";

export class Property {
  id: string;
  databaseId: string;
  groupId?: string;
  name: string;
  type: PropertyType;
  position: number;
  icon?: string;
  hint?: string;
  group?: string;
  isRequired: boolean;
  isVisible: boolean;
  isProtected: boolean;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, unknown>;

  database?: Database;

  constructor(partial: Partial<Property>) {
    Object.assign(this, partial);
  }
}
