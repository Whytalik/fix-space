import { Injectable } from "@nestjs/common";
import { PropertyType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../config/initialization-config.service";
import { DatabaseService } from "../../database/database.service";
import { PropertyService } from "../../property/property.service";
import { SectionService } from "./section.service";
import { SpaceService } from "../space.service";

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

  async initialize(userId: string, username: string) {
    this.logger.log("Initializing user space", { userId, username });

    const config = this.configService.getConfig();
    const spaceName = this.configService.interpolateSpaceName(username);

    const space = await this.spaceService.create(userId, {
      name: spaceName,
    });

    // Pass 1 — Create sections, track key → sectionId
    const sectionByKey = new Map<string, string>();
    const sortedSections = [...config.sections].sort((a, b) => a.position - b.position);

    for (const sectionDef of sortedSections) {
      const section = await this.sectionService.create(space.id, {
        name: sectionDef.name,
        position: sectionDef.position,
      });
      if (sectionDef.key) {
        sectionByKey.set(sectionDef.key, section.id);
      }
    }

    // Pass 2 — Create databases without properties, track type → databaseId
    const databaseByType = new Map<string, string>();

    for (const dbDef of config.databases) {
      const db = await this.databaseService.create(
        space.id,
        {
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
      if (!databaseId) continue;

      for (const propDef of dbDef.properties ?? []) {
        let propConfig = (propDef.config ?? {}) as Record<string, unknown>;

        if (propDef.type === PropertyType.RELATION && propConfig.sourceDatabaseType) {
          const { sourceDatabaseType, ...rest } = propConfig;
          propConfig = {
            ...rest,
            relatedEntityId: databaseByType.get(sourceDatabaseType as string) ?? "",
          };
        }

        await this.propertyService.create(databaseId, { ...propDef, config: propConfig }, userId);
      }
    }

    this.logger.log("User space initialized", {
      userId,
      spaceId: space.id,
      sections: sortedSections.length,
      databases: config.databases.length,
    });

    return space;
  }
}
