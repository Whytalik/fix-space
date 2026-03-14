import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { CreateSpaceDto, PropertyType, SpaceResponseDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../config/initialization-config.service";
import { DatabaseService } from "../../database/database.service";
import { PropertyService } from "../../property/property.service";
import { TemplateService } from "../../template/template.service";
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
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async seedContent(spaceId: string, userId: string): Promise<void> {
    const config = this.configService.getConfig();

    // Pass 1 - Create sections in parallel, track key → sectionId
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

    // Pass 2 - Create databases in parallel without properties, track type → databaseId
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

    // Pass 3 — Create all properties in parallel, resolving RELATION symbolic refs
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

            await this.propertyService.create(databaseId, { ...propDef, databaseId, config: propConfig }, userId);
          }),
        );
      }),
    );

    // Pass 4 — Seed sample records
    // Sub-pass 4a: create all records + scalar values in parallel per database, track name → id per database type
    type PropCache = { properties: { id: string; name: string }[]; propByName: Map<string, { id: string; name: string }> };
    const recordIdByType = new Map<string, Map<string, string>>();
    const propCacheByType = new Map<string, PropCache>();

    await Promise.all(
      config.databases
        .filter((dbDef) => dbDef.seeds?.length && dbDef.type)
        .map(async (dbDef) => {
          const databaseId = databaseByType.get(dbDef.type!);
          if (!databaseId) return;

          const properties = await prisma.property.findMany({ where: { databaseId } });
          const propByName = new Map(properties.map((p) => [p.name, p]));
          propCacheByType.set(dbDef.type!, { properties, propByName });

          const nameToId = new Map<string, string>();
          recordIdByType.set(dbDef.type!, nameToId);

          await Promise.all(
            dbDef.seeds!.map(async (seed) => {
              const record = await prisma.record.create({
                data: {
                  databaseId,
                  name: seed.name,
                  icon: seed.icon,
                },
              });
              nameToId.set(seed.name, record.id);

              await prisma.propertyValue.createMany({
                data: properties.map((p) => ({
                  recordId: record.id,
                  propertyId: p.id,
                  value: (seed.values?.[p.name] !== undefined ? seed.values[p.name] : Prisma.DbNull) as Prisma.InputJsonValue,
                  computed: false,
                })),
              });
            }),
          );
        }),
    );

    // Sub-pass 4b: resolve and set RELATION values
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
            const ids = relRef
              .map((r) => recordIdByType.get(r.type)?.get(r.name))
              .filter((id): id is string => !!id);
            if (ids.length === 0) continue;
            value = ids;
          } else {
            const id = recordIdByType.get(relRef.type)?.get(relRef.name);
            if (!id) continue;
            value = id;
          }

          await prisma.propertyValue.update({
            where: { recordId_propertyId: { recordId, propertyId: prop.id } },
            data: { value },
          });
        }
      }
    }

    // Pass 4 — Create templates for each database
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
    await this.seedContent(space.id, userId);
    this.logger.log("Space created and seeded", { userId, spaceId: space.id });
    return this.spaceService.findOne(space.id);
  }

  async initialize(userId: string, username: string) {
    this.logger.log("Initializing user space", { userId, username });

    const config = this.configService.getConfig();
    const spaceName = this.configService.interpolateSpaceName(username);
    const space = await this.spaceService.create(userId, { name: spaceName, isDefault: true, icon: config.spaceIcon });

    await this.seedContent(space.id, userId);

    this.logger.log("User space initialized", { userId, spaceId: space.id });

    return this.spaceService.findOne(space.id);
  }
}
