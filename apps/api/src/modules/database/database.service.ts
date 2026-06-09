import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateDatabaseDto, DatabaseResponseDto, UpdateDatabaseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { defaultInitializationConfig } from "@/core/config/initialization/initialization.config";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { SettingsCategory } from "@/modules/settings/constants/settings.constants";
import { SettingsService } from "@/modules/settings/settings.service";
import { ViewRepository } from "@/modules/view/repositories/view.repository";
import { DatabaseRepository } from "./repositories/database.repository";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { toDatabaseResponseDto } from "./utils/to-database-response.util";

interface DatabaseOperationDto {
  id: string;
  update?: { position?: number };
}

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly settingsService: SettingsService,
    private readonly databaseRepo: DatabaseRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly viewRepo: ViewRepository,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async create(
    spaceId: string,
    createDatabaseDto: CreateDatabaseDto,
    userId: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<DatabaseResponseDto> {
    this.logger.debug("Creating database", {
      spaceId,
      name: createDatabaseDto.name,
    });

    this.logger.debug("Attempting to find space", { spaceId, transaction: !!transaction });
    const space = await this.spaceRepo.findOne(spaceId, undefined, transaction);
    this.logger.debug("Found space", { spaceId, found: !!space });

    if (!space || space.ownerId !== userId) {
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

    const effectiveIcon = createDatabaseDto.icon ?? (await this.settingsService.getDefaultIcon(userId, SettingsCategory.DATABASE));

    const lastPosition = await this.databaseRepo.findLastPosition(spaceId);
    const position = lastPosition !== null ? lastPosition.position + 1 : 0;

    const run = async (tx: Prisma.TransactionClient) => {
      const database = await this.databaseRepo.create(
        {
          name: createDatabaseDto.name,
          title: createDatabaseDto.title,
          type: createDatabaseDto.type,
          icon: effectiveIcon,
          spaceId,
          sectionId: createDatabaseDto.sectionId,
          position,
          isPreset: createDatabaseDto.isPreset ?? false,
        },
        tx,
      );

      const propertiesToCreate = createDatabaseDto.properties ?? defaultInitializationConfig.defaultDatabaseProperties;

      for (const propertyDef of propertiesToCreate) {
        const handler = this.typeRegistry.getConfigHandler(propertyDef.type);
        const defaultConfig = handler.getDefaultConfig();
        const mergedConfig = propertyDef.config ? { ...defaultConfig, ...propertyDef.config } : defaultConfig;

        await tx.property.create({
          data: {
            name: propertyDef.name,
            type: propertyDef.type,
            position: propertyDef.position,
            icon: propertyDef.icon,
            isVisible: propertyDef.isVisible ?? true,
            isProtected: propertyDef.name === "Name",
            group: propertyDef.name === "Name" ? "General" : propertyDef.group,
            databaseId: database.id,
            config: mergedConfig as Prisma.InputJsonValue,
          },
        });
      }

      await this.viewRepo.create(
        {
          databaseId: database.id,
          name: "Table View",
          isDefault: true,
          pageSize: 50,
          recordLimit: 10,
          useDefaultTemplate: true,
          filters: [],
          sort: [],
          hiddenColumns: [],
          columnWidths: {},
        },
        tx,
      );

      this.logger.log("Database created", {
        databaseId: database.id,
        spaceId,
      });

      return toDatabaseResponseDto(database);
    };

    if (transaction) {
      return run(transaction);
    }

    return this.databaseRepo.transaction(run);
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
        position: updateDatabaseDto.position,
        isLocked: updateDatabaseDto.isLocked,
        isPreset: updateDatabaseDto.isPreset,
      },
      nullableFields: {},
    });

    const database = await this.databaseRepo.update(id, updateData);

    this.logger.log("Database updated", { id });
    return toDatabaseResponseDto(database);
  }

  async processDatabaseOperations(transaction: Prisma.TransactionClient, spaceId: string, operations: DatabaseOperationDto[]) {
    for (const operation of operations) {
      const database = await this.databaseRepo.findById(operation.id, transaction);

      if (!database) {
        throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id: operation.id }));
      }

      if (database.spaceId !== spaceId) {
        throw new BadRequestException(t("errors.DATABASE_NOT_IN_SPACE"));
      }

      if (operation.update) {
        const updateData = filterUndefined({
          fields: { position: operation.update.position },
        });

        await this.databaseRepo.update(database.id, updateData, transaction);
      }
    }
  }

  async remove(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Removing database", { id });

    const existingDatabase = await this.databaseRepo.findById(id);

    if (!existingDatabase) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id }));
    }

    if (existingDatabase.isPreset) {
      throw new BadRequestException(t("errors.CANNOT_REMOVE_PRESET_DATABASE"));
    }

    const database = await this.databaseRepo.delete(id);

    this.logger.log("Database removed", { id });
    return toDatabaseResponseDto(database);
  }
}
