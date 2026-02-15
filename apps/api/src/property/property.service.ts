import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreatePropertyDto, UpdatePropertyDto } from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { defaultPropertyConfig } from './property.config';

@Injectable()
export class PropertyService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(PropertyService.name);
  }

  async create(databaseId: string, createPropertyDto: CreatePropertyDto) {
    this.logger.debug('Creating property', {
      databaseId,
      name: createPropertyDto.name,
    });

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

    const property = await prisma.property.create({
      data: {
        name: createPropertyDto.name,
        type: createPropertyDto.type,
        position: createPropertyDto.position,
        icon: createPropertyDto.icon,
        color: createPropertyDto.color,
        isRequired: createPropertyDto.isRequired ?? false,
        isPrimary: createPropertyDto.isPrimary ?? false,
        databaseId,
        config: defaultPropertyConfig as Prisma.JsonValue,
      },
    });

    this.logger.log('Property created', {
      propertyId: property.id,
      databaseId,
    });
    return property;
  }

  async findAll(databaseId: string) {
    this.logger.debug('Finding all properties', { databaseId });
    return await prisma.property.findMany({
      where: { databaseId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    this.logger.debug('Finding property', { id });

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    this.logger.debug('Updating property', { id });

    const existingProperty = await prisma.property.findUnique({
      where: { id },
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
      },
    });

    this.logger.log('Property updated', { id });
    return property;
  }

  async remove(id: string) {
    this.logger.debug('Removing property', { id });

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const property = await prisma.property.delete({
      where: { id },
    });

    this.logger.log('Property removed', { id });
    return property;
  }
}
