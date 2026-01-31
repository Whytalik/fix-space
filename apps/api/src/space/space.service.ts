import { Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateSpaceDto, UpdateSpaceDto } from '@nucleus/domain';

@Injectable()
export class SpaceService {
  async create(createSpaceDto: CreateSpaceDto) {
    return await prisma.space.create({
      data: {
        name: createSpaceDto.name,
        ownerId: createSpaceDto.ownerId,
        config: createSpaceDto.config as Prisma.JsonValue,
      },
    });
  }

  async findAll(ownerId: string) {
    return await prisma.space.findMany({
      where: { ownerId },
    });
  }

  async findOne(id: string) {
    return await prisma.space.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateSpaceDto: UpdateSpaceDto) {
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      throw new Error('Space not found');
    }

    return await prisma.space.update({
      where: { id },
      data: {
        name: updateSpaceDto.name,
        ownerId: updateSpaceDto.ownerId,
        config: updateSpaceDto.config as Prisma.JsonValue,
      },
    });
  }

  async remove(id: string) {
    return await prisma.space.delete({
      where: { id },
    });
  }
}
