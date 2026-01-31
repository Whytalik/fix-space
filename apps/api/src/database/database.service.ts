import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateDatabaseDto, UpdateDatabaseDto } from '@nucleus/domain';

@Injectable()
export class DatabaseService {
  async create(spaceId: string, createDatabaseDto: CreateDatabaseDto) {
    const isDatabaseNameTaken = await prisma.database.findFirst({
      where: {
        name: createDatabaseDto.name,
        spaceId,
      },
    });

    if (isDatabaseNameTaken) {
      throw new ConflictException('Database name is already taken in this space.');
    }

    return await prisma.database.create({
      data: {
        name: createDatabaseDto.name,
        title: createDatabaseDto.title,
        spaceId,
        sectionId: createDatabaseDto.sectionId,
        config: createDatabaseDto.config as Prisma.JsonValue,
      },
    });
  }

  async findAll(spaceId: string) {
    return await prisma.database.findMany({
      where: { spaceId },
    });
  }

  async findOne(id: string) {
    return await prisma.database.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto) {
    return await prisma.database.update({
      where: { id },
      data: {
        name: updateDatabaseDto.name,
        title: updateDatabaseDto.title,
        sectionId: updateDatabaseDto.sectionId,
        config: updateDatabaseDto.config as Prisma.JsonValue,
      },
    });
  }

  async remove(id: string) {
    return await prisma.database.delete({
      where: { id },
    });
  }
}
