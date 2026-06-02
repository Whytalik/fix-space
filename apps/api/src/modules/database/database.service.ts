import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import {
  CreateDatabaseDto,
  DatabaseConfigDto,
  DatabaseResponseDto,
  PropertyType,
  UpdateDatabaseDto,
} from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";
import { defaultInitializationConfig } from "../../core/config/initialization.config";
import { PropertyTypeRegistry } from "../property/types";
import { DatabaseRepository } from "./repositories/database.repository";

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async create(spaceId: string, createDatabaseDto: CreateDatabaseDto, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Creating database", {
      spaceId,
      name: createDatabaseDto.name,
    });

    const space = await this.databaseRepo.findSpaceByOwner(spaceId, userId);

    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND"));
    }

    const isDatabaseNameTaken = await this.databaseRepo.findByNameInSpace(createDatabaseDto.name, spaceId);

    if (isDatabaseNameTaken) {
      this.logger.warn("Duplicate database name", {
        spaceId,
        name: createDatabaseDto.name,
      });
      throw new ConflictException(t("errors.DATABASE_NAME_TAKEN"));
    }

    return await this.databaseRepo.transaction(async (tx) => {
      const database = await this.databaseRepo.create(
        {
          name: createDatabaseDto.name,
          title: createDatabaseDto.title,
          icon: createDatabaseDto.icon,
          spaceId,
          sectionId: createDatabaseDto.sectionId,
          recordLimit: createDatabaseDto.recordLimit ?? 10,
        },
        tx,
      );

      const propertiesToCreate = createDatabaseDto.properties ?? defaultInitializationConfig.defaultDatabaseProperties;

      for (const propertyDef of propertiesToCreate) {
        const handler = this.typeRegistry.getConfigHandler(propertyDef.type as PropertyType);
        const defaultConfig = handler.getDefaultConfig();
        const mergedConfig = propertyDef.config ? { ...defaultConfig, ...propertyDef.config } : defaultConfig;

        await tx.property.create({
          data: {
            name: propertyDef.name,
            type: propertyDef.type,
            position: propertyDef.position,
            icon: propertyDef.icon,
            isRequired: propertyDef.isRequired ?? false,
            isVisible: propertyDef.isVisible ?? true,
            databaseId: database.id,
            config: mergedConfig as Prisma.InputJsonValue,
          },
        });
      }

      this.logger.log("Database created with properties", {
        databaseId: database.id,
        spaceId,
        propertyCount: propertiesToCreate.length,
      });

      return new DatabaseResponseDto({ ...database, config: database.config as unknown as DatabaseConfigDto });
    });
  }

  async findAll(spaceId: string, userId: string): Promise<DatabaseResponseDto[]> {
    this.logger.debug("Finding all databases", { spaceId });
    const databases = await this.databaseRepo.findAllBySpace(spaceId, userId);
    return databases.map(
      (database) => new DatabaseResponseDto({ ...database, config: database.config as unknown as DatabaseConfigDto }),
    );
  }

  async findOne(id: string, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Finding database", { id });

    const database = await this.databaseRepo.findByIdWithOwner(id, userId);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    return new DatabaseResponseDto({ ...database, config: database.config as unknown as DatabaseConfigDto });
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Updating database", { id });

    const existingDatabase = await this.databaseRepo.findByIdWithOwner(id, userId);

    if (!existingDatabase) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    if (updateDatabaseDto.sectionId) {
      const section = await this.databaseRepo.findSectionInSpace(updateDatabaseDto.sectionId, existingDatabase.spaceId);
      if (!section) {
        throw new NotFoundException(t("errors.SECTION_NOT_FOUND"));
      }
    }

    const database = await this.databaseRepo.update(id, {
      name: updateDatabaseDto.name,
      title: updateDatabaseDto.title,
      icon: updateDatabaseDto.icon,
      sectionId: updateDatabaseDto.sectionId,
      ...(updateDatabaseDto.recordLimit !== undefined && { recordLimit: updateDatabaseDto.recordLimit ?? null }),
      ...(updateDatabaseDto.useDefaultTemplate !== undefined && {
        useDefaultTemplate: updateDatabaseDto.useDefaultTemplate,
      }),
    });

    this.logger.log("Database updated", { id });
    return new DatabaseResponseDto({ ...database, config: database.config as unknown as DatabaseConfigDto });
  }

  async remove(id: string, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Removing database", { id });

    const existingDatabase = await this.databaseRepo.findByIdWithOwner(id, userId);

    if (!existingDatabase) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    const database = await this.databaseRepo.delete(id);

    this.logger.log("Database removed", { id });
    return new DatabaseResponseDto({ ...database, config: database.config as unknown as DatabaseConfigDto });
  }
}
