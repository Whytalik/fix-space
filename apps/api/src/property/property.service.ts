import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  CreatePropertyDto,
  PropertyResponseDto,
  PropertyType,
  UpdatePropertyDto,
} from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { PropertyTypeRegistry } from './types';

@Injectable()
export class PropertyService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(PropertyService.name);
  }

  async create(
    databaseId: string,
    createPropertyDto: CreatePropertyDto,
    userId: string,
  ): Promise<PropertyResponseDto> {
    this.logger.debug('Creating property', {
      databaseId,
      name: createPropertyDto.name,
    });

    const database = await prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });

    if (!database) {
      throw new NotFoundException(`Database not found`);
    }

    const isPropertyNameTaken = await prisma.property.findFirst({
      where: {
        name: createPropertyDto.name,
        databaseId,
      },
    });

    if (isPropertyNameTaken) {
      this.logger.warn('Duplicate property name', {
        databaseId,
        name: createPropertyDto.name,
      });
      throw new ConflictException(
        'Property name is already taken in this database.',
      );
    }

    const handler = this.typeRegistry.getHandler(createPropertyDto.type);
    const defaultConfig = handler.getDefaultConfig();
    const mergedConfig = createPropertyDto.config
      ? { ...defaultConfig, ...createPropertyDto.config }
      : defaultConfig;

    const configErrors = handler.validateConfig(mergedConfig);
    if (configErrors) {
      throw new BadRequestException(
        `Invalid config for ${createPropertyDto.type}: ${configErrors.join('; ')}`,
      );
    }

    const [property] = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          name: createPropertyDto.name,
          type: createPropertyDto.type,
          position: createPropertyDto.position,
          icon: createPropertyDto.icon,
          color: createPropertyDto.color,
          isRequired: createPropertyDto.isRequired ?? false,
          isPrimary: createPropertyDto.isPrimary ?? false,
          databaseId,
          config: mergedConfig as Prisma.JsonValue,
        },
      });

      const existingRecords = await tx.record.findMany({
        where: { databaseId },
        select: { id: true },
      });

      if (existingRecords.length > 0) {
        await tx.propertyValue.createMany({
          data: existingRecords.map((record) => ({
            recordId: record.id,
            propertyId: created.id,
            value: null,
            computed: false,
          })),
        });
      }

      return [created];
    });

    this.logger.log('Property created', {
      propertyId: property.id,
      databaseId,
    });
    return new PropertyResponseDto(property);
  }

  async findAll(databaseId: string, userId: string): Promise<PropertyResponseDto[]> {
    this.logger.debug('Finding all properties', { databaseId });
    const properties = await prisma.property.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      orderBy: { position: 'asc' },
    });
    return properties.map((property) => new PropertyResponseDto(property));
  }

  async findOne(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug('Finding property', { id });

    const property = await prisma.property.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return new PropertyResponseDto(property);
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
  ): Promise<PropertyResponseDto> {
    this.logger.debug('Updating property', { id });

    const existingProperty = await prisma.property.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    if (
      updatePropertyDto.name &&
      updatePropertyDto.name !== existingProperty.name
    ) {
      const isPropertyNameTaken = await prisma.property.findFirst({
        where: {
          name: updatePropertyDto.name,
          databaseId: existingProperty.databaseId,
          NOT: { id },
        },
      });

      if (isPropertyNameTaken) {
        this.logger.warn('Duplicate property name on update', {
          id,
          name: updatePropertyDto.name,
        });
        throw new ConflictException(
          'Property name is already taken in this database.',
        );
      }
    }

    let configToSave = existingProperty.config as
      | Record<string, unknown>
      | undefined;

    if (
      updatePropertyDto.type &&
      updatePropertyDto.type !== existingProperty.type
    ) {
      const handler = this.typeRegistry.getHandler(updatePropertyDto.type);
      configToSave = handler.getDefaultConfig();
    }

    if (updatePropertyDto.config) {
      const effectiveType =
        updatePropertyDto.type ?? (existingProperty.type as PropertyType);
      const handler = this.typeRegistry.getHandler(effectiveType);
      const merged = { ...configToSave, ...updatePropertyDto.config };
      const configErrors = handler.validateConfig(merged);
      if (configErrors) {
        throw new BadRequestException(
          `Invalid config for ${effectiveType}: ${configErrors.join('; ')}`,
        );
      }
      configToSave = merged;
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        name: updatePropertyDto.name,
        type: updatePropertyDto.type,
        position: updatePropertyDto.position,
        icon: updatePropertyDto.icon,
        color: updatePropertyDto.color,
        isRequired: updatePropertyDto.isRequired,
        isPrimary: updatePropertyDto.isPrimary,
        ...(configToSave !== undefined && {
          config: configToSave as Prisma.JsonValue,
        }),
      },
    });

    this.logger.log('Property updated', { id });
    return new PropertyResponseDto(property);
  }

  async remove(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug('Removing property', { id });

    const existingProperty = await prisma.property.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const property = await prisma.property.delete({
      where: { id },
    });

    this.logger.log('Property removed', { id });
    return new PropertyResponseDto(property);
  }
}
