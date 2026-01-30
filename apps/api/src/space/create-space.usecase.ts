import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { CreateSpaceDto } from '@nucleus/domain';

@Injectable()
export class CreateSpaceUseCase {
  async create(createSpaceDTO: CreateSpaceDto) {
    const isSpaceExists = await prisma.space.findUnique({
      where: {
        ownerId_name: {
          name: createSpaceDTO.name,
          ownerId: createSpaceDTO.ownerId,
        },
      },
    });

    if (isSpaceExists) {
      throw new Error('Space with this name already exists for the owner');
    }

    return prisma.space.create({
      data: {
        name: createSpaceDTO.name,
        ownerId: createSpaceDTO.ownerId,
      },
    });
  }
}
