import { Injectable } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateSectionDto, CreateSpaceDto, CreateViewDto, PropertyConfig, PropertyType, SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { InitializationConfigService } from "@/core/config/initialization/initialization-config.service";
import type { DatabaseTemplate } from "@/core/config/initialization/types";
import type { SeedRecord, SeedRelation } from "@/core/config/initialization/seeds";
import { AutomationRepository } from "@/modules/automation/repositories/automation.repository";
import { DatabaseService } from "@/modules/database/database.service";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { PropertyService } from "@/modules/property/property.service";
import { PropertyValueRepository } from "@/modules/property-value/repositories/property-value.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { RecordService } from "@/modules/record/record.service";
import { TemplateRepository } from "@/modules/template/repositories/template.repository";
import { TemplateService } from "@/modules/template/template.service";
import { ViewService } from "@/modules/view/view.service";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceService } from "../space.service";
import { SectionService } from "./section.service";

type PropCache = {
  properties: { id: string; name: string }[];
  propByName: Map<string, { id: string; name: string }>;
};

@Injectable()
export class InitializeUserSpaceUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly spaceService: SpaceService,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly propertyService: PropertyService,
    private readonly templateService: TemplateService,
    private readonly viewService: ViewService,
    private readonly initConfig: InitializationConfigService,
    private readonly propertyRepo: PropertyRepository,
    private readonly propertyValueRepo: PropertyValueRepository,
    private readonly recordRepo: RecordRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly automationRepo: AutomationRepository,
    private readonly templateRepo: TemplateRepository,
    private readonly recordService: RecordService,
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async seedContent(spaceId: string, userId: string): Promise<void> {
    const config = this.initConfig.getConfig();

    this.logger.debug("Seed content start", { spaceId });
    const sectionByKey = await this.seedSections(spaceId, config.sections);

    const databaseByType = await this.seedDatabases(spaceId, userId, config.databases, sectionByKey);

    await this.seedProperties(userId, config.databases, databaseByType);

    const { recordIdByType, propCacheByType } = await this.seedRecords(config.databases, databaseByType);

    await this.seedRelations(config.databases, recordIdByType, propCacheByType);

    await this.seedTemplates(userId, config.databases, databaseByType);

    const templateByType = await this.fetchDefaultTemplateIds(config.databases, databaseByType);

    await this.seedViews(userId, config.databases, databaseByType, templateByType);

    await this.seedAutomations(userId, config.databases, databaseByType);

    await this.seedTemplateContent(config.databases, databaseByType);

    this.logger.log("Space content seeded", {
      spaceId,
      sections: config.sections.length,
      databases: config.databases.length,
    });
  }

  private async seedSections(spaceId: string, sections: CreateSectionDto[]): Promise<Map<string, string>> {
    const sectionByKey = new Map<string, string>();
    const sortedSections = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    for (const sectionTemplate of sortedSections) {
      const section = await this.sectionService.create(spaceId, {
        name: sectionTemplate.name,
        position: sectionTemplate.position,
        icon: sectionTemplate.icon,
        color: sectionTemplate.color,
      });
      if (sectionTemplate.key) {
        sectionByKey.set(sectionTemplate.key, section.id);
      }
    }

    return sectionByKey;
  }

  private async seedDatabases(
    spaceId: string,
    userId: string,
    databases: DatabaseTemplate[],
    sectionByKey: Map<string, string>,
  ): Promise<Map<string, string>> {
    const databaseByType = new Map<string, string>();

    await Promise.all(
      databases.map(async (databaseTemplate: DatabaseTemplate) => {
        const database = await this.databaseService.create(
          spaceId,
          {
            spaceId,
            name: databaseTemplate.name,
            type: databaseTemplate.type,
            icon: databaseTemplate.icon,
            sectionId: databaseTemplate.sectionKey ? sectionByKey.get(databaseTemplate.sectionKey) : undefined,
            isKey: databaseTemplate.isKey ?? false,
            properties: [],
          },
          userId,
          true,
        );
        if (databaseTemplate.type) {
          databaseByType.set(databaseTemplate.type, database.id);
        }
      }),
    );

    return databaseByType;
  }

  private async seedProperties(userId: string, databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    const createdProps = new Map<string, Map<string, string>>();
    const allPropsByName = new Map<string, string>();

    for (const databaseTemplate of databases) {
      const databaseId = databaseTemplate.type ? databaseByType.get(databaseTemplate.type) : undefined;
      if (!databaseId) continue;

      const dbProps = new Map<string, string>();
      createdProps.set(databaseTemplate.type!, dbProps);

      const nonFormulaProps = (databaseTemplate.properties ?? []).filter((p) => p.type !== PropertyType.FORMULA);

      for (const propertyDefinition of nonFormulaProps) {
        let propertyConfiguration = (propertyDefinition.config ?? {}) as Record<string, unknown>;

        if (propertyDefinition.type === PropertyType.RELATION && propertyConfiguration.sourceDatabaseType) {
          const { sourceDatabaseType, ...rest } = propertyConfiguration;
          const relatedEntityId = databaseByType.get(sourceDatabaseType as string);
          if (!relatedEntityId) continue;
          propertyConfiguration = { ...rest, relatedEntityId };
        }

        const property = await this.propertyService.create(
          databaseId,
          {
            ...propertyDefinition,
            databaseId,
            config: propertyConfiguration as unknown as PropertyConfig,
          },
          userId,
        );
        dbProps.set(property.name, property.id);
        allPropsByName.set(`${databaseTemplate.type}.${property.name}`, property.id);
      }
    }

    for (const databaseTemplate of databases) {
      const databaseId = databaseByType.get(databaseTemplate.type!);
      if (!databaseId) continue;

      const dbProps = createdProps.get(databaseTemplate.type!)!;
      const formulaProps = (databaseTemplate.properties ?? []).filter((p) => p.type === PropertyType.FORMULA);

      for (const propertyDefinition of formulaProps) {
        const config = { ...propertyDefinition.config } as any;

        if (config.expression) {
          config.expression = config.expression.replace(/\{\{(.+?)\}\}/g, (match: string, name: string) => {
            const key = name.trim();
            const propId = key.includes(".") ? allPropsByName.get(key) : dbProps.get(key);
            return propId ? `field_${propId.replace(/-/g, "_")}` : match;
          });
        }

        const property = await this.propertyService.create(
          databaseId,
          {
            ...propertyDefinition,
            databaseId,
            config: config as unknown as PropertyConfig,
          },
          userId,
        );
        dbProps.set(property.name, property.id);
        allPropsByName.set(`${databaseTemplate.type}.${property.name}`, property.id);
      }
    }
  }

  private async seedTemplates(userId: string, databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    await Promise.all(
      databases
        .filter((databaseTemplate) => databaseTemplate.templates?.length && databaseTemplate.type)
        .map(async (databaseTemplate) => {
          const databaseId = databaseByType.get(databaseTemplate.type!);
          if (!databaseId) return;

          for (const templateDef of databaseTemplate.templates!) {
            const resolvedContent = this.resolveTemplateContent(templateDef.content, databaseId);
            await this.templateService.create(databaseId, { ...templateDef, databaseId, content: resolvedContent }, userId);
          }
        }),
    );
  }

  private resolveTemplateContent(content: unknown, databaseId: string): unknown {
    if (!content || typeof content !== "object") return content;

    if (Array.isArray(content)) {
      return content.map((item) => this.resolveTemplateContent(item, databaseId));
    }

    const contentObject = content as Record<string, unknown>;

    if (contentObject.type === "LINKED_DATABASE" && contentObject.data && typeof contentObject.data === "object") {
      const data = contentObject.data as Record<string, unknown>;
      if (data.databaseId === "$current") {
        return { ...contentObject, data: { ...data, databaseId } };
      }
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(contentObject)) {
      resolved[key] = this.resolveTemplateContent(value, databaseId);
    }
    return resolved;
  }

  private async fetchDefaultTemplateIds(databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    for (const db of databases) {
      if (!db.type) continue;
      const databaseId = databaseByType.get(db.type);
      if (!databaseId) continue;
      const template = await this.templateRepo.findDefaultInDatabase(databaseId);
      if (template) map.set(db.type, template.id);
    }
    return map;
  }

  private async seedTemplateContent(databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    for (const db of databases) {
      if (!db.type || !db.seeds?.length) continue;

      const hasNamePattern = db.templates?.some((t) => t.namePattern) ?? false;
      const applyDefault = db.applyDefaultTemplateToSeeds ?? false;
      if (!hasNamePattern && !applyDefault) continue;

      const databaseId = databaseByType.get(db.type);
      if (!databaseId) continue;

      const template = await this.templateRepo.findDefaultInDatabase(databaseId);
      if (!template) continue;

      const records = await this.recordRepo.findManyByDatabase(databaseId);
      for (const record of records) {
        if (hasNamePattern) {
          await this.recordRepo.update(record.id, { name: "Untitled" });
        }
        await this.recordService.applyTemplate(record.id, template.id);
      }
    }
  }

  private async seedViews(
    userId: string,
    databases: DatabaseTemplate[],
    databaseByType: Map<string, string>,
    templateByType?: Map<string, string>,
  ): Promise<void> {
    await Promise.all(
      databases
        .filter((databaseTemplate) => databaseTemplate.views?.length && databaseTemplate.type)
        .map(async (databaseTemplate) => {
          const databaseId = databaseByType.get(databaseTemplate.type!);
          if (!databaseId) return;

          const properties = await this.propertyRepo.findManyByDatabase(databaseId);
          const propByName = new Map(properties.map((property) => [property.name, property]));

          for (const viewDef of databaseTemplate.views!) {
            const filters = (viewDef.filters ?? []).map((filter) => {
              const propName = (filter as unknown as { propertyName?: string }).propertyName;
              if (propName && propByName.has(propName)) {
                return { ...filter, propertyId: propByName.get(propName)!.id };
              }
              return filter;
            });

            const sort = (viewDef.sort ?? []).map((s) => {
              const propName = (s as unknown as { propertyName?: string }).propertyName;
              if (propName && propByName.has(propName)) {
                return { ...s, propertyId: propByName.get(propName)!.id };
              }
              return s;
            });

            const groupBy = viewDef.groupBy && propByName.has(viewDef.groupBy) ? propByName.get(viewDef.groupBy)!.id : viewDef.groupBy;

            const hiddenColumns = (viewDef.hiddenColumns ?? []).map((colName: string) => {
              if (propByName.has(colName)) {
                return propByName.get(colName)!.id;
              }
              return colName;
            });

            const columnSummaries: Record<string, string> = {};
            const rawSummaries = (viewDef as unknown as Record<string, Record<string, string>>).columnSummaries;
            if (rawSummaries) {
              for (const [key, value] of Object.entries(rawSummaries)) {
                const prop = propByName.get(key);
                columnSummaries[prop ? prop.id : key] = value;
              }
            }

            let defaultTemplateId = templateByType?.get(databaseTemplate.type!);
            if (viewDef.defaultTemplateName) {
              const namedTemplate = await this.templateRepo.findByNameInDatabase(databaseId, viewDef.defaultTemplateName);
              if (namedTemplate) defaultTemplateId = namedTemplate.id;
            }

            await this.viewService.create(
              databaseId,
              {
                ...viewDef,
                databaseId,
                filters,
                sort,
                groupBy,
                hiddenColumns,
                columnSummaries,
                defaultTemplateId,
              } as unknown as CreateViewDto,
              userId,
            );
          }
        }),
    );
  }

  private async seedAutomations(userId: string, databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    for (const databaseTemplate of databases) {
      if (!databaseTemplate.automations?.length || !databaseTemplate.type) continue;

      const databaseId = databaseByType.get(databaseTemplate.type);
      if (!databaseId) continue;

      const properties = await this.propertyRepo.findManyByDatabase(databaseId);
      const propByName = new Map(properties.map((p) => [p.name, p]));

      for (const automationDef of databaseTemplate.automations) {
        const config = this.resolveAutomationConfig(automationDef, propByName);
        const actions = await this.resolveAutomationActions(automationDef.actions, propByName, databaseByType);

        const filteredActions = actions.filter(Boolean);
        if (filteredActions.length === 0) continue;

        await this.automationRepo.create({
          databaseId,
          name: automationDef.name,
          trigger: automationDef.trigger,
          actions: filteredActions as unknown as Prisma.InputJsonValue,
          active: automationDef.active ?? true,
          config: (config ?? Prisma.DbNull) as Prisma.InputJsonValue,
        });
      }
    }
  }

  private resolveAutomationConfig(
    automationDef: Record<string, unknown>,
    propByName: Map<string, { id: string }>,
  ): Record<string, unknown> | null {
    const config = automationDef.config as Record<string, unknown> | undefined;
    if (!config) return null;

    const propName = config.propertyName as string | undefined;
    if (propName && propByName.has(propName)) {
      const { propertyName: _propertyName, ...rest } = config;
      return { ...rest, propertyId: propByName.get(propName)!.id };
    }
    return config;
  }

  private async resolveAutomationActions(
    actions: unknown[],
    propByName: Map<string, { id: string }>,
    databaseByType: Map<string, string>,
  ): Promise<unknown[]> {
    const result: unknown[] = [];

    for (const action of actions) {
      const a = action as Record<string, unknown>;

      switch (a.type) {
        case "SET_FIELD_VALUE": {
          const propName = a.propertyName as string | undefined;
          if (propName && propByName.has(propName)) {
            const { propertyName: _propertyName, ...rest } = a;
            result.push({ ...rest, propertyId: propByName.get(propName)!.id });
          } else {
            result.push(a);
          }
          break;
        }

        case "CREATE_RECORD": {
          const sourceType = a.sourceDatabaseType as string | undefined;
          const dbId = sourceType ? databaseByType.get(sourceType) : (a.databaseId as string);
          if (!dbId) break;

          const rawFieldMappings = (a.fieldMappings as Record<string, unknown>[] | undefined) ?? [];
          const dbProps = await this.propertyRepo.findManyByDatabase(dbId);
          const targetPropByName = new Map(dbProps.map((p) => [p.name, p]));

          const fieldMappings = rawFieldMappings.map((fieldMapping: Record<string, unknown>) => {
            const { targetPropertyName, ...fieldMappingRest } = fieldMapping;
            const targetProp = targetPropByName.get(targetPropertyName as string);
            return targetProp ? { ...fieldMappingRest, targetPropertyId: targetProp.id } : fieldMapping;
          });

          const { sourceDatabaseType: _srcDbType, ...rest } = a;
          result.push({ ...rest, databaseId: dbId, fieldMappings });
          break;
        }

        case "LINK_RECORDS": {
          const srcDb = a.sourceDatabaseType as string | undefined;
          if (srcDb) {
            const srcDbId = databaseByType.get(srcDb);
            if (!srcDbId) break;

            const srcProps = await this.propertyRepo.findManyByDatabase(srcDbId);
            const srcPropByName = new Map(srcProps.map((p) => [p.name, p]));
            const srcPropName = a.sourcePropertyName as string | undefined;
            const sourcePropertyId = srcPropName && srcPropByName.has(srcPropName) ? srcPropByName.get(srcPropName)!.id : undefined;

            const { sourceDatabaseType: _srcDbType, sourcePropertyName: _srcPropName, ...rest } = a;
            result.push({ ...rest, sourceDatabaseId: srcDbId, sourcePropertyId });
          } else {
            result.push(a);
          }
          break;
        }

        default:
          result.push(a);
      }
    }

    return result;
  }

  private async seedRecords(
    databases: DatabaseTemplate[],
    databaseByType: Map<string, string>,
  ): Promise<{
    recordIdByType: Map<string, Map<string, string>>;
    propCacheByType: Map<string, PropCache>;
  }> {
    const recordIdByType = new Map<string, Map<string, string>>();
    const propCacheByType = new Map<string, PropCache>();

    await Promise.all(
      databases
        .filter((databaseTemplate: DatabaseTemplate) => databaseTemplate.seeds?.length && databaseTemplate.type)
        .map(async (databaseTemplate: DatabaseTemplate) => {
          const databaseId = databaseByType.get(databaseTemplate.type!);
          if (!databaseId) return;

          const properties = await this.propertyRepo.findManyByDatabase(databaseId);
          const propByName = new Map(properties.map((property) => [property.name, property]));
          propCacheByType.set(databaseTemplate.type!, { properties, propByName });

          const nameToId = new Map<string, string>();
          recordIdByType.set(databaseTemplate.type!, nameToId);

          await Promise.all(
            databaseTemplate.seeds!.map(async (seed: SeedRecord) => {
              const record = await this.recordRepo.create({
                databaseId,
                name: seed.name,
                icon: seed.icon,
              });
              nameToId.set(seed.name, record.id);

              await this.propertyValueRepo.createMany(
                properties.map((property) => ({
                  recordId: record.id,
                  propertyId: property.id,
                  value: (seed.values?.[property.name] !== undefined ? seed.values[property.name] : Prisma.DbNull) as Prisma.InputJsonValue,
                  computed: false,
                })),
              );
            }),
          );
        }),
    );

    return { recordIdByType, propCacheByType };
  }

  private async seedRelations(
    databases: DatabaseTemplate[],
    recordIdByType: Map<string, Map<string, string>>,
    propCacheByType: Map<string, PropCache>,
  ): Promise<void> {
    for (const databaseTemplate of databases) {
      if (!databaseTemplate.seeds?.length || !databaseTemplate.type) continue;

      const nameToId = recordIdByType.get(databaseTemplate.type);
      const cache = propCacheByType.get(databaseTemplate.type);
      if (!nameToId || !cache) continue;

      for (const seed of databaseTemplate.seeds) {
        if (!seed.relations) continue;

        const recordId = nameToId.get(seed.name);
        if (!recordId) continue;

        for (const [propName, relRef] of Object.entries(seed.relations) as [string, SeedRelation | SeedRelation[]][]) {
          const property = cache.propByName.get(propName);
          if (!property) continue;

          let value: Prisma.InputJsonValue;
          if (Array.isArray(relRef)) {
            const ids = relRef
              .map((relation: SeedRelation) => recordIdByType.get(relation.type)?.get(relation.name))
              .filter((id): id is string => !!id);
            if (ids.length === 0) continue;
            value = ids;
          } else {
            const id = recordIdByType.get(relRef.type)?.get(relRef.name);
            if (!id) continue;
            value = id;
          }

          await this.propertyValueRepo.updateByCompositeKey(recordId, property.id, { value });
        }
      }
    }
  }

  async createAndSeed(userId: string, dto: CreateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Creating and seeding space from DTO", { userId, name: dto.name });
    const space = await this.spaceService.create(userId, dto);

    try {
      await this.seedContent(space.id, userId);
    } catch (error) {
      this.logger.error("Seed failed", { error: (error as Error).message, stack: (error as Error).stack, spaceId: space.id, userId });
      throw error;
    }
    this.logger.log("Space created and seeded", { userId, spaceId: space.id });
    return this.spaceService.findOne(space.id);
  }

  async initialize(userId: string, username: string) {
    this.logger.log("Initializing user space", { userId, username });

    const config = this.initConfig.getConfig();

    const space = await this.spaceService.create(userId, {
      name: `${username}'s Space`,
      isDefault: true,
      icon: config.spaceIcon,
    });

    this.logger.debug("Space created", { spaceId: space.id });

    try {
      await this.seedContent(space.id, userId);
    } catch (error) {
      this.logger.error("Seed failed", { error: (error as Error).message, stack: (error as Error).stack, spaceId: space.id, userId });
      await this.spaceRepo.delete(space.id);
      throw error;
    }

    this.logger.log("User space initialized", { userId, spaceId: space.id });
    return this.spaceService.findOne(space.id);
  }
}
