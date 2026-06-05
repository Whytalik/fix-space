import type { CreateDatabaseDto, CreatePropertyDto, CreateSectionDto, CreateTemplateDto, DatabaseType } from "@fixspace/domain";
import type { SeedRecord } from "./seeds";

export type InitPropertyDef = Omit<CreatePropertyDto, "databaseId" | "config"> & {
  config?: Record<string, unknown>;
  visibilityCondition?: Record<string, unknown>;
};

export type InitTemplateDef = Omit<CreateTemplateDto, "databaseId">;

export type DatabaseTemplate = Omit<CreateDatabaseDto, "spaceId" | "properties"> & {
  type?: DatabaseType;
  properties?: InitPropertyDef[];
  seeds?: SeedRecord[];
  templates?: InitTemplateDef[];
};

export interface InitializationConfig {
  spaceIcon: string;
  sections: CreateSectionDto[];
  databases: DatabaseTemplate[];
  defaultDatabaseProperties: InitPropertyDef[];
}
