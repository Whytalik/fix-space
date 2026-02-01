import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@nucleus/database';
import {
  CreatePropertyValueDto,
  UpdatePropertyValueDto,
} from '@nucleus/domain';

@Injectable()
export class PropertyValueService {
  async create(
    recordId: string,
    createPropertyValueDto: CreatePropertyValueDto,
  ) {
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
      throw new ConflictException(
        'A value for this property already exists on this record',
      );
    }

    return await prisma.propertyValue.create({
      data: {
        recordId,
        propertyId: createPropertyValueDto.propertyId,
        value: createPropertyValueDto.value,
        computed: createPropertyValueDto.computed ?? false,
      },
    });
  }

  async findAll(recordId: string) {
    return await prisma.propertyValue.findMany({
      where: { recordId },
      include: { property: true },
    });
  }

  async findOne(id: string) {
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
    const existingValue = await prisma.propertyValue.findUnique({
      where: { id },
    });

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    return await prisma.propertyValue.update({
      where: { id },
      data: {
        value: updatePropertyValueDto.value,
        computed: updatePropertyValueDto.computed,
      },
    });
  }

  async remove(id: string) {
    const existingValue = await prisma.propertyValue.findUnique({
      where: { id },
    });

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    return await prisma.propertyValue.delete({
      where: { id },
    });
  }
}
