import { Injectable } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateSectionDto, CreateSpaceDto, PropertyConfig, PropertyType, SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../../core/config/initialization/initialization-config.service";
import type { DatabaseTemplate, InitPropertyDef } from "../../../core/config/initialization/types";
import type { SeedRecord, SeedRelation } from "../../../core/config/initialization/seeds";
import { DatabaseService } from "../../database/database.service";
import { PropertyRepository } from "../../property/repositories/property.repository";
import { PropertyService } from "../../property/property.service";
import { PropertyValueRepository } from "../../property-value/repositories/property-value.repository";
import { RecordRepository } from "../../record/repositories/record.repository";
import { TemplateService } from "../../template/template.service";
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
    private readonly spaceService: SpaceService,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly propertyService: PropertyService,
    private readonly templateService: TemplateService,
    private readonly initConfig: InitializationConfigService,
    private readonly logger: AppLogger,
    private readonly propertyRepo: PropertyRepository,
    private readonly propertyValueRepo: PropertyValueRepository,
    private readonly recordRepo: RecordRepository,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async seedContent(spaceId: string, userId: string): Promise<void> {
    const config = this.initConfig.getConfig();

    const sectionByKey = await this.seedSections(spaceId, config.sections);

    const databaseByType = await this.seedDatabases(spaceId, userId, config.databases, sectionByKey);

    await this.seedProperties(userId, config.databases, databaseByType);

    const { recordIdByType, propCacheByType } = await this.seedRecords(config.databases, databaseByType);

    await this.seedRelations(config.databases, recordIdByType, propCacheByType);

    await this.seedTemplates(userId, config.databases, databaseByType);

    this.logger.log("Space content seeded", {
      spaceId,
      sections: config.sections.length,
      databases: config.databases.length,
    });
  }

  private async seedSections(spaceId: string, sections: CreateSectionDto[]): Promise<Map<string, string>> {
    const sectionByKey = new Map<string, string>();
    const sortedSections = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    await Promise.all(
      sortedSections.map(async (sectionTemplate) => {
        const section = await this.sectionService.create(spaceId, {
          name: sectionTemplate.name,
          position: sectionTemplate.position,
          icon: sectionTemplate.icon,
          color: sectionTemplate.color,
        });
        if (sectionTemplate.key) {
          sectionByKey.set(sectionTemplate.key, section.id);
        }
      }),
    );

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
            title: databaseTemplate.title,
            type: databaseTemplate.type,
            icon: databaseTemplate.icon,
            sectionId: databaseTemplate.sectionKey ? sectionByKey.get(databaseTemplate.sectionKey) : undefined,
            isPreset: true,
            properties: [],
          },
          userId,
        );
        if (databaseTemplate.type) {
          databaseByType.set(databaseTemplate.type, database.id);
        }
      }),
    );

    return databaseByType;
  }

  private async seedProperties(userId: string, databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    await Promise.all(
      databases.map(async (databaseTemplate: DatabaseTemplate) => {
        const databaseId = databaseTemplate.type ? databaseByType.get(databaseTemplate.type) : undefined;
        if (!databaseId) {
          this.logger.error("Space initialization failed: database type not resolved", { type: databaseTemplate.type });
          throw new Error(`Space initialization failed: database type "${databaseTemplate.type as string}" was not created in Pass 2`);
        }

        await Promise.all(
          (databaseTemplate.properties ?? []).map(async (propertyDefinition: InitPropertyDef) => {
            let propertyConfiguration = (propertyDefinition.config ?? {}) as Record<string, unknown>;

            if (propertyDefinition.type === PropertyType.RELATION && propertyConfiguration.sourceDatabaseType) {
              const { sourceDatabaseType, ...rest } = propertyConfiguration;
              const relatedEntityId = databaseByType.get(sourceDatabaseType as string);
              if (!relatedEntityId) {
                this.logger.error("Space initialization failed: RELATION source database not found", {
                  databaseId,
                  propertyName: propertyDefinition.name,
                  sourceDatabaseType,
                });
                throw new Error(
                  `Space initialization failed: RELATION property "${propertyDefinition.name}" references unknown sourceDatabaseType "${sourceDatabaseType as string}"`,
                );
              }
              propertyConfiguration = { ...rest, relatedEntityId };
            }

            await this.propertyService.create(
              databaseId,
              {
                ...propertyDefinition,
                databaseId,
                config: propertyConfiguration as unknown as PropertyConfig,
              },
              userId,
            );
          }),
        );
      }),
    );
  }

  private async seedTemplates(userId: string, databases: DatabaseTemplate[], databaseByType: Map<string, string>): Promise<void> {
    await Promise.all(
      databases
        .filter((databaseTemplate) => databaseTemplate.templates?.length && databaseTemplate.type)
        .map(async (databaseTemplate) => {
          const databaseId = databaseByType.get(databaseTemplate.type!);
          if (!databaseId) return;

          for (const templateDef of databaseTemplate.templates!) {
            await this.templateService.create(databaseId, { ...templateDef, databaseId }, userId);
          }
        }),
    );
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
      this.logger.error("Seed failed, removing partially-initialized space", { spaceId: space.id, userId });
      await this.spaceRepo.delete(space.id).catch(() => undefined);
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

    try {
      await this.seedContent(space.id, userId);
    } catch (error) {
      this.logger.error("Seed failed, removing partially-initialized space", { spaceId: space.id, userId });
      await this.spaceRepo.delete(space.id).catch(() => undefined);
      throw error;
    }

    this.logger.log("User space initialized", { userId, spaceId: space.id });

    return this.spaceService.findOne(space.id);
  }
}
