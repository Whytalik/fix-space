import { Injectable } from "@nestjs/common";
import { CreateSpaceDto, PropertyType, SpaceResponseDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../config/initialization-config.service";
import { DatabaseService } from "../../database/database.service";
import { PropertyService } from "../../property/property.service";
import { SpaceService } from "../space.service";
import { SectionService } from "./section.service";

@Injectable()
export class InitializeUserSpaceUseCase {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly propertyService: PropertyService,
    private readonly configService: InitializationConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async seedContent(spaceId: string, userId: string): Promise<void> {
    const config = this.configService.getConfig();

    // Pass 1 - Create sections, track key → sectionId
    const sectionByKey = new Map<string, string>();
    const sortedSections = [...config.sections].sort((a, b) => a.position - b.position);

    for (const sectionDef of sortedSections) {
      const section = await this.sectionService.create(spaceId, {
        name: sectionDef.name,
        position: sectionDef.position,
      });
      if (sectionDef.key) {
        sectionByKey.set(sectionDef.key, section.id);
      }
    }

    // Pass 2 - Create databases without properties, track type → databaseId
    const databaseByType = new Map<string, string>();

    for (const dbDef of config.databases) {
      const db = await this.databaseService.create(
        spaceId,
        {
          spaceId,
          name: dbDef.name,
          title: dbDef.title,
          type: dbDef.type,
          sectionId: dbDef.sectionKey ? sectionByKey.get(dbDef.sectionKey) : undefined,
          properties: [],
        },
        userId,
      );
      if (dbDef.type) {
        databaseByType.set(dbDef.type, db.id);
      }
    }

    // Pass 3 — Create properties for each database, resolving RELATION symbolic refs
    for (const dbDef of config.databases) {
      const databaseId = dbDef.type ? databaseByType.get(dbDef.type) : undefined;
      if (!databaseId) {
        this.logger.error("Space initialization failed: database type not resolved", { type: dbDef.type });
        throw new Error(
          `Space initialization failed: database type "${dbDef.type as string}" was not created in Pass 2`,
        );
      }

      for (const propDef of dbDef.properties ?? []) {
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

    const spaceName = this.configService.interpolateSpaceName(username);
    const space = await this.spaceService.create(userId, { name: spaceName, isDefault: true });

    await this.seedContent(space.id, userId);

    this.logger.log("User space initialized", { userId, spaceId: space.id });

    return this.spaceService.findOne(space.id);
  }
}
