import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateDatabaseDto, DatabaseResponseDto, UpdateDatabaseDto } from '@nucleus/domain';
import { PropertyType } from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { defaultInitializationConfig } from '../config/initialization.config';
import { PropertyTypeRegistry } from '../property/types';
import { defaultDatabaseConfig } from './database.config';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async create(spaceId: string, createDatabaseDto: CreateDatabaseDto, userId: string): Promise<DatabaseResponseDto> {
    this.logger.debug('Creating database', {
      spaceId,
      name: createDatabaseDto.name,
    });

    const space = await prisma.space.findFirst({
      where: { id: spaceId, ownerId: userId },
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
      this.logger.warn('Duplicate database name', {
        spaceId,
        name: createDatabaseDto.name,
      });
      throw new ConflictException('Database name is already taken in this space.');
    }

    return await prisma.$transaction(async (tx) => {
      const database = await tx.database.create({
        data: {
          name: createDatabaseDto.name,
          title: createDatabaseDto.title,
          icon: createDatabaseDto.icon,
          spaceId,
          sectionId: createDatabaseDto.sectionId,
          config: {
            ...defaultDatabaseConfig,
            type: createDatabaseDto.type ?? 'custom',
          },
        },
      });

      for (const propertyDef of defaultInitializationConfig.defaultDatabaseProperties) {
        const handler = this.typeRegistry.getHandler(propertyDef.type as PropertyType);
        const config = handler.getDefaultConfig();

        await tx.property.create({
          data: {
            name: propertyDef.name,
            type: propertyDef.type,
            position: propertyDef.position,
            isRequired: propertyDef.isRequired ?? false,
            databaseId: database.id,
            config: config as Prisma.JsonValue,
          },
        });
      }

      this.logger.log('Database created with default properties', {
        databaseId: database.id,
        spaceId,
        propertyCount: defaultInitializationConfig.defaultDatabaseProperties.length,
      });

      return new DatabaseResponseDto(database);
    });
  }

  async findAll(spaceId: string, userId: string): Promise<DatabaseResponseDto[]> {
    this.logger.debug('Finding all databases', { spaceId });
    const databases = await prisma.database.findMany({
      where: { spaceId, space: { ownerId: userId } },
    });
    return databases.map((database) => new DatabaseResponseDto(database));
  }

  async findOne(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug('Finding database', { id });

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      throw new NotFoundException(`Database with id ${id} not found`);
    }

    return new DatabaseResponseDto(database);
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto): Promise<DatabaseResponseDto> {
    this.logger.debug('Updating database', { id });

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
      },
    });

    this.logger.log('Database updated', { id });
    return new DatabaseResponseDto(database);
  }

  async remove(id: string): Promise<DatabaseResponseDto> {
    this.logger.debug('Removing database', { id });

    const existingDatabase = await prisma.database.findUnique({
      where: { id },
    });

    if (!existingDatabase) {
      throw new NotFoundException(`Database with id ${id} not found`);
    }

    const database = await prisma.database.delete({
      where: { id },
    });

    this.logger.log('Database removed', { id });
    return new DatabaseResponseDto(database);
  }
}
