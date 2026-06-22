import type {
  CreateAutomationDto,
  CreateDatabaseDto,
  CreatePropertyDto,
  CreateSectionDto,
  CreateTemplateDto,
  CreateViewDto,
  DatabaseType,
} from "@fixspace/domain";
import type { SeedRecord } from "./seeds";

export type InitPropertyDef = Omit<CreatePropertyDto, "databaseId" | "config"> & {
  config?: Record<string, unknown>;
  visibilityCondition?: Record<string, unknown>;
  integrationKey?: string;
};

export type InitTemplateDef = Omit<CreateTemplateDto, "databaseId">;

export type InitViewDef = Omit<CreateViewDto, "databaseId"> & {
  defaultTemplateName?: string;
};

export type InitAutomationDef = Omit<CreateAutomationDto, "databaseId"> & {
  config?: Record<string, unknown>;
};

export type DatabaseTemplate = Omit<CreateDatabaseDto, "spaceId" | "properties"> & {
  type?: DatabaseType;
  properties?: InitPropertyDef[];
  seeds?: SeedRecord[];
  templates?: InitTemplateDef[];
  views?: InitViewDef[];
  automations?: InitAutomationDef[];
  applyDefaultTemplateToSeeds?: boolean;
};

export interface InitializationConfig {
  spaceIcon: string;
  sections: CreateSectionDto[];
  databases: DatabaseTemplate[];
  defaultDatabaseProperties: InitPropertyDef[];
}
