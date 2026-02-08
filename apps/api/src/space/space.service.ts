import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateSpaceDto, UpdateSpaceDto } from '@nucleus/domain';
import { defaultSpaceConfig } from '../config/schemas';

@Injectable()
export class SpaceService {
  async create(ownerId: string, createSpaceDTO: CreateSpaceDto) {
    const isSpaceExists = await prisma.space.findUnique({
      where: {
        ownerId_name: {
          ownerId: ownerId,
          name: createSpaceDTO.name,
        },
      },
    });

    if (isSpaceExists) {
      throw new Error('Space with this name already exists for the owner');
    }

    return prisma.space.create({
      data: {
        name: createSpaceDTO.name,
        icon: createSpaceDTO.icon,
        ownerId: ownerId,
        config: defaultSpaceConfig as Prisma.JsonValue,
      },
    });
  }

  async findAll(ownerId: string) {
    const spaces = await prisma.space.findMany({
      where: { ownerId },
    });

    if (spaces.length === 0) {
      throw new NotFoundException('No spaces found for this owner');
    }

    return spaces;
  }

  async findOne(id: string) {
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  async update(id: string, updateSpaceDto: UpdateSpaceDto) {
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (updateSpaceDto.name) {
      const isNameTaken = await prisma.space.findUnique({
        where: {
          ownerId_name: {
            ownerId: space.ownerId,
            name: updateSpaceDto.name,
          },
        },
      });
      if (isNameTaken) {
        throw new Error('Space with this name already exists for the owner');
      }
    }

    return await prisma.space.update({
      where: { id },
      data: {
        name: updateSpaceDto.name,
        icon: updateSpaceDto.icon,
      },
    });
  }

  async remove(id: string) {
    const isSpaceExists = await prisma.space.findUnique({
      where: { id },
    });

    if (!isSpaceExists) {
      throw new NotFoundException('Space not found');
    }

    return await prisma.space.delete({
      where: { id },
    });
  }
}
