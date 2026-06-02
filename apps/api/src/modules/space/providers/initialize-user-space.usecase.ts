import { Injectable } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreatePropertyDto, CreateSpaceDto, PropertyType, SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../../core/config/initialization-config.service";
import { DatabaseService } from "../../database/database.service";
import { PropertyRepository } from "../../property/repositories/property.repository";
import { PropertyService } from "../../property/property.service";
import { PropertyValueRepository } from "../../property-value/repositories/property-value.repository";
import { RecordRepository } from "../../record/repositories/record.repository";
import { TemplateService } from "../../template/template.service";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceService } from "../space.service";
import { SectionService } from "./section.service";

@Injectable()
export class InitializeUserSpaceUseCase {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly propertyService: PropertyService,
    private readonly templateService: TemplateService,
    private readonly configService: InitializationConfigService,
    private readonly logger: AppLogger,
    private readonly propertyRepo: PropertyRepository,
    private readonly propertyValueRepo: PropertyValueRepository,
    private readonly recordRepo: RecordRepository,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async seedContent(spaceId: string, userId: string): Promise<void> {
    const config = this.configService.getConfig();

    const sectionByKey = new Map<string, string>();
    const sortedSections = [...config.sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    await Promise.all(
      sortedSections.map(async (sectionDef) => {
        const section = await this.sectionService.create(spaceId, {
          name: sectionDef.name,
          position: sectionDef.position,
          icon: sectionDef.icon,
          color: sectionDef.color,
        });
        if (sectionDef.key) {
          sectionByKey.set(sectionDef.key, section.id);
        }
      }),
    );

    const databaseByType = new Map<string, string>();

    await Promise.all(
      config.databases.map(async (dbDef) => {
        const db = await this.databaseService.create(
          spaceId,
          {
            spaceId,
            name: dbDef.name,
            title: dbDef.title,
            type: dbDef.type,
            icon: dbDef.icon,
            sectionId: dbDef.sectionKey ? sectionByKey.get(dbDef.sectionKey) : undefined,
            properties: [],
          },
          userId,
        );
        if (dbDef.type) {
          databaseByType.set(dbDef.type, db.id);
        }
      }),
    );

    await Promise.all(
      config.databases.map(async (dbDef) => {
        const databaseId = dbDef.type ? databaseByType.get(dbDef.type) : undefined;
        if (!databaseId) {
          this.logger.error("Space initialization failed: database type not resolved", { type: dbDef.type });
          throw new Error(
            `Space initialization failed: database type "${dbDef.type as string}" was not created in Pass 2`,
          );
        }

        await Promise.all(
          (dbDef.properties ?? []).map(async (propDef) => {
            let propConfig = (propDef.config ?? {}) as Record<string, unknown>;

            if (propDef.type === PropertyType.RELATION && propConfig.sourceDatabaseType) {
              const { sourceDatabaseType, ...rest } = propConfig;
              const relatedEntityId = databaseByType.get(sourceDatabaseType as string);
              if (!relatedEntityId) {
                this.logger.error("Space initialization failed: RELATION source database not found", {
                  databaseId,
                  propertyName: propDef.name,
                  sourceDatabaseType,
                });
                throw new Error(
                  `Space initialization failed: RELATION property "${propDef.name}" references unknown sourceDatabaseType "${sourceDatabaseType as string}"`,
                );
              }
              propConfig = { ...rest, relatedEntityId };
            }

            await this.propertyService.create(
              databaseId,
              { ...propDef, databaseId, config: propConfig as unknown as CreatePropertyDto["config"] },
              userId,
            );
          }),
        );
      }),
    );

    type PropCache = {
      properties: { id: string; name: string }[];
      propByName: Map<string, { id: string; name: string }>;
    };
    const recordIdByType = new Map<string, Map<string, string>>();
    const propCacheByType = new Map<string, PropCache>();

    await Promise.all(
      config.databases
        .filter((dbDef) => dbDef.seeds?.length && dbDef.type)
        .map(async (dbDef) => {
          const databaseId = databaseByType.get(dbDef.type!);
          if (!databaseId) return;

          const properties = await this.propertyRepo.findManyByDatabase(databaseId);
          const propByName = new Map(properties.map((p) => [p.name, p]));
          propCacheByType.set(dbDef.type!, { properties, propByName });

          const nameToId = new Map<string, string>();
          recordIdByType.set(dbDef.type!, nameToId);

          await Promise.all(
            dbDef.seeds!.map(async (seed) => {
              const record = await this.recordRepo.create({
                databaseId,
                name: seed.name,
                icon: seed.icon,
              });
              nameToId.set(seed.name, record.id);

              await this.propertyValueRepo.createMany(
                properties.map((p) => ({
                  recordId: record.id,
                  propertyId: p.id,
                  value: (seed.values?.[p.name] !== undefined
                    ? seed.values[p.name]
                    : Prisma.DbNull) as Prisma.InputJsonValue,
                  computed: false,
                })),
              );
            }),
          );
        }),
    );

    for (const dbDef of config.databases) {
      if (!dbDef.seeds?.length || !dbDef.type) continue;

      const nameToId = recordIdByType.get(dbDef.type);
      const cache = propCacheByType.get(dbDef.type);
      if (!nameToId || !cache) continue;

      for (const seed of dbDef.seeds) {
        if (!seed.relations) continue;

        const recordId = nameToId.get(seed.name);
        if (!recordId) continue;

        for (const [propName, relRef] of Object.entries(seed.relations)) {
          const prop = cache.propByName.get(propName);
          if (!prop) continue;

          let value: Prisma.InputJsonValue;
          if (Array.isArray(relRef)) {
            const ids = relRef.map((r) => recordIdByType.get(r.type)?.get(r.name)).filter((id): id is string => !!id);
            if (ids.length === 0) continue;
            value = ids;
          } else {
            const id = recordIdByType.get(relRef.type)?.get(relRef.name);
            if (!id) continue;
            value = id;
          }

          await this.propertyValueRepo.updateByCompositeKey(recordId, prop.id, { value });
        }
      }
    }

    for (const dbDef of config.databases) {
      const databaseId = dbDef.type ? databaseByType.get(dbDef.type) : undefined;
      if (!databaseId || !dbDef.templates?.length) continue;

      for (const templateDef of dbDef.templates) {
        await this.templateService.create(databaseId, { databaseId, ...templateDef }, userId);
      }
    }

    this.logger.log("Space content seeded", {
      spaceId,
      sections: sortedSections.length,
      databases: config.databases.length,
    });
  }

  async createAndSeed(userId: string, dto: CreateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Creating and seeding space from DTO", { userId, name: dto.name });
    const space = await this.spaceService.create(userId, dto);
    try {
      await this.seedContent(space.id, userId);
    } catch (err) {
      this.logger.error("Seed failed, removing partially-initialized space", { spaceId: space.id, userId });
      await this.spaceRepo.delete(space.id).catch(() => undefined);
      throw err;
    }
    this.logger.log("Space created and seeded", { userId, spaceId: space.id });
    return this.spaceService.findOne(space.id);
  }

  async initialize(userId: string, username: string) {
    this.logger.log("Initializing user space", { userId, username });

    const config = this.configService.getConfig();
    const spaceName = this.configService.interpolateSpaceName(username);
    const space = await this.spaceService.create(userId, { name: spaceName, isDefault: true, icon: config.spaceIcon });

    try {
      await this.seedContent(space.id, userId);
    } catch (err) {
      this.logger.error("Seed failed, removing partially-initialized space", { spaceId: space.id, userId });
      await this.spaceRepo.delete(space.id).catch(() => undefined);
      throw err;
    }

    this.logger.log("User space initialized", { userId, spaceId: space.id });

    return this.spaceService.findOne(space.id);
  }
}
