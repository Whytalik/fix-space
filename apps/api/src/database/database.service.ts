import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { CreateDatabaseDto, DatabaseResponseDto, PropertyType, UpdateDatabaseDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { defaultInitializationConfig } from "../config/initialization.config";
import { PropertyTypeRegistry } from "../property/types";

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async create(spaceId: string, createDatabaseDto: CreateDatabaseDto, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Creating database", {
      spaceId,
      name: createDatabaseDto.name,
    });

    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        ownerId: userId,
      },
    });

    if (!space) {
      throw new NotFoundException(`Space not found`);
    }

    const isDatabaseNameTaken = await prisma.database.findFirst({
      where: {
        name: createDatabaseDto.name,
        spaceId,
      },
    });

    if (isDatabaseNameTaken) {
      this.logger.warn("Duplicate database name", {
        spaceId,
        name: createDatabaseDto.name,
      });
      throw new ConflictException("Database name is already taken in this space.");
    }

    return await prisma.$transaction(async (tx) => {
      const database = await tx.database.create({
        data: {
          name: createDatabaseDto.name,
          title: createDatabaseDto.title,
          icon: createDatabaseDto.icon,
          spaceId,
          sectionId: createDatabaseDto.sectionId,
          recordLimit: createDatabaseDto.recordLimit ?? 10,
        },
      });

      const propertiesToCreate =
        createDatabaseDto.properties !== undefined
          ? createDatabaseDto.properties
          : defaultInitializationConfig.defaultDatabaseProperties;

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

      return new DatabaseResponseDto(database);
    });
  }

  async findAll(spaceId: string, userId: string): Promise<DatabaseResponseDto[]> {
    this.logger.debug("Finding all databases", { spaceId });
    const databases = await prisma.database.findMany({
      where: {
        spaceId,
        space: {
          ownerId: userId,
        },
      },
    });
    return databases.map((database) => new DatabaseResponseDto(database));
  }

  async findOne(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Finding database", { id });

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      throw new NotFoundException(`Database with id ${id} not found`);
    }

    return new DatabaseResponseDto(database);
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto): Promise<DatabaseResponseDto> {
    this.logger.debug("Updating database", { id });

    const existingDatabase = await prisma.database.findUnique({
      where: { id },
    });

    if (!existingDatabase) {
      throw new NotFoundException(`Database with id ${id} not found`);
    }

    const database = await prisma.database.update({
      where: { id },
      data: {
        name: updateDatabaseDto.name,
        title: updateDatabaseDto.title,
        icon: updateDatabaseDto.icon,
        sectionId: updateDatabaseDto.sectionId,
        ...(updateDatabaseDto.recordLimit !== undefined && { recordLimit: updateDatabaseDto.recordLimit ?? null }),
        ...(updateDatabaseDto.useDefaultTemplate !== undefined && { useDefaultTemplate: updateDatabaseDto.useDefaultTemplate }),
      },
    });

    this.logger.log("Database updated", { id });
    return new DatabaseResponseDto(database);
  }

  async remove(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Removing database", { id });

    const existingDatabase = await prisma.database.findUnique({
      where: { id },
    });

    if (!existingDatabase) {
      throw new NotFoundException(`Database with id ${id} not found`);
    }

    const database = await prisma.database.delete({
      where: { id },
    });

    this.logger.log("Database removed", { id });
    return new DatabaseResponseDto(database);
  }
}
