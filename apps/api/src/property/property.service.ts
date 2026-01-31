import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreatePropertyDto, UpdatePropertyDto } from '@nucleus/domain';

@Injectable()
export class PropertyService {
  async create(databaseId: string, createPropertyDto: CreatePropertyDto) {
    const isPropertyNameTaken = await prisma.property.findFirst({
      where: {
        name: createPropertyDto.name,
        databaseId,
      },
    });

    if (isPropertyNameTaken) {
      throw new ConflictException(
        'Property name is already taken in this database.',
      );
    }

    return await prisma.property.create({
      data: {
        name: createPropertyDto.name,
        type: createPropertyDto.type,
        position: createPropertyDto.position,
        isRequired: createPropertyDto.isRequired ?? false,
        config: createPropertyDto.config as Prisma.JsonValue,
        databaseId,
      },
    });
  }

  async findAll(databaseId: string) {
    return await prisma.property.findMany({
      where: { databaseId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
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
        throw new ConflictException(
          'Property name is already taken in this database.',
        );
      }
    }

    return await prisma.property.update({
      where: { id },
      data: {
        name: updatePropertyDto.name,
        type: updatePropertyDto.type,
        position: updatePropertyDto.position,
        isRequired: updatePropertyDto.isRequired,
        config: updatePropertyDto.config as Prisma.JsonValue,
      },
    });
  }

  async remove(id: string) {
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return await prisma.property.delete({
      where: { id },
    });
  }
}
