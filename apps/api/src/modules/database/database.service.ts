import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateDatabaseDto, DatabaseResponseDto, UpdateDatabaseDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { filterUndefined } from "../../common/utils/filter-undefined";
import { t } from "../../common/utils/i18n.helper";
import { defaultInitializationConfig } from "../../core/config/initialization/initialization.config";
import { PropertyTypeRegistry } from "../property/types";
import { DatabaseRepository } from "./repositories/database.repository";
import { toDatabaseResponseDto } from "./utils/to-database-response.util";

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

    return await this.databaseRepo.transaction(async (transaction) => {
      const database = await this.databaseRepo.create(
        {
          name: createDatabaseDto.name,
          title: createDatabaseDto.title,
          type: createDatabaseDto.type,
          icon: createDatabaseDto.icon,
          spaceId,
          sectionId: createDatabaseDto.sectionId,
          recordLimit: createDatabaseDto.recordLimit ?? 10,
          isPreset: createDatabaseDto.isPreset ?? false,
        },
        transaction,
      );

      const propertiesToCreate = createDatabaseDto.properties ?? defaultInitializationConfig.defaultDatabaseProperties;

      for (const propertyDef of propertiesToCreate) {
        const handler = this.typeRegistry.getConfigHandler(propertyDef.type);
        const defaultConfig = handler.getDefaultConfig();
        const mergedConfig = propertyDef.config ? { ...defaultConfig, ...propertyDef.config } : defaultConfig;

        await transaction.property.create({
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

      this.logger.log("Database created", {
        databaseId: database.id,
        spaceId,
      });

      return toDatabaseResponseDto(database);
    });
  }

  async findAll(spaceId: string, userId: string): Promise<DatabaseResponseDto[]> {
    this.logger.debug("Finding all databases", { spaceId });
    const databases = await this.databaseRepo.findAllBySpace(spaceId, userId);
    return databases.map(toDatabaseResponseDto);
  }

  async findOne(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Finding database", { id });

    const database = await this.databaseRepo.findById(id);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    return toDatabaseResponseDto(database);
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto): Promise<DatabaseResponseDto> {
    this.logger.debug("Updating database", { id });

    const existingDatabase = await this.databaseRepo.findById(id);

    if (!existingDatabase) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    if (updateDatabaseDto.sectionId) {
      const section = await this.databaseRepo.findSectionInSpace(updateDatabaseDto.sectionId, existingDatabase.spaceId);
      if (!section) {
        throw new NotFoundException(t("errors.SECTION_NOT_FOUND"));
      }
    }

    const updateData = filterUndefined({
      fields: {
        name: updateDatabaseDto.name,
        title: updateDatabaseDto.title,
        icon: updateDatabaseDto.icon,
        sectionId: updateDatabaseDto.sectionId,
        useDefaultTemplate: updateDatabaseDto.useDefaultTemplate,
      },
      nullableFields: { recordLimit: updateDatabaseDto.recordLimit },
    });

    const database = await this.databaseRepo.update(id, updateData);

    this.logger.log("Database updated", { id });
    return toDatabaseResponseDto(database);
  }

  async remove(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Removing database", { id });

    const existingDatabase = await this.databaseRepo.findById(id);

    if (!existingDatabase) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    if (existingDatabase.isPreset) {
      throw new BadRequestException(t("errors.CANNOT_DELETE_PRESET_DATABASE"));
    }

    const database = await this.databaseRepo.delete(id);

    this.logger.log("Database removed", { id });
    return toDatabaseResponseDto(database);
  }
}
