import type { Database } from "../../database/entities/database.entity";

export class View {
  id: string;
  databaseId: string;
  name: string;
  isDefault: boolean;
  isLocked: boolean;
  pageSize: number;
  filters?: unknown;
  sort?: unknown;
  groupBy?: string;
  hiddenColumns: string[];
  columnWidths?: Record<string, number>;
  textWrap: boolean;
  searchQuery?: string;
  createdAt: Date;
  updatedAt: Date;

  database?: Database;

  constructor(partial: Partial<View>) {
    Object.assign(this, partial);
  }
}
