import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  CreatePropertyValueDto,
  UpdatePropertyValueDto,
} from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class PropertyValueService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(PropertyValueService.name);
  }

  async create(
    recordId: string,
    createPropertyValueDto: CreatePropertyValueDto,
  ) {
    this.logger.debug('Creating property value', {
      recordId,
      propertyId: createPropertyValueDto.propertyId,
    });

    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    const property = await prisma.property.findUnique({
      where: { id: createPropertyValueDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with id ${createPropertyValueDto.propertyId} not found`,
      );
    }

    if (property.databaseId !== record.databaseId) {
      this.logger.warn('Property-record database mismatch', {
        propertyDatabaseId: property.databaseId,
        recordDatabaseId: record.databaseId,
      });
      throw new ConflictException(
        'Property does not belong to the same database as the record',
      );
    }

    const existingValue = await prisma.propertyValue.findUnique({
      where: {
        recordId_propertyId: {
          recordId,
          propertyId: createPropertyValueDto.propertyId,
        },
      },
    });

    if (existingValue) {
      this.logger.warn('Duplicate property value', {
        recordId,
        propertyId: createPropertyValueDto.propertyId,
      });
      throw new ConflictException(
        'A value for this property already exists on this record',
      );
    }

    const propertyValue = await prisma.propertyValue.create({
      data: {
        recordId,
        propertyId: createPropertyValueDto.propertyId,
        value: createPropertyValueDto.value as Prisma.InputJsonValue,
        computed: createPropertyValueDto.computed ?? false,
      },
    });

    this.logger.log('Property value created', {
      propertyValueId: propertyValue.id,
      recordId,
    });
    return propertyValue;
  }

  async findAll(recordId: string) {
    this.logger.debug('Finding all property values', { recordId });
    return await prisma.propertyValue.findMany({
      where: { recordId },
      include: { property: true },
    });
  }

  async findOne(id: string) {
    this.logger.debug('Finding property value', { id });

    const propertyValue = await prisma.propertyValue.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!propertyValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    return propertyValue;
  }

  async update(id: string, updatePropertyValueDto: UpdatePropertyValueDto) {
    this.logger.debug('Updating property value', { id });

    const existingValue = await prisma.propertyValue.findUnique({
      where: { id },
    });

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    const propertyValue = await prisma.propertyValue.update({
      where: { id },
      data: {
        value: updatePropertyValueDto.value as Prisma.InputJsonValue,
        computed: updatePropertyValueDto.computed,
      },
    });

    this.logger.log('Property value updated', { id });
    return propertyValue;
  }

  async remove(id: string) {
    this.logger.debug('Removing property value', { id });

    const existingValue = await prisma.propertyValue.findUnique({
      where: { id },
    });

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    const propertyValue = await prisma.propertyValue.delete({
      where: { id },
    });

    this.logger.log('Property value removed', { id });
    return propertyValue;
  }
}
