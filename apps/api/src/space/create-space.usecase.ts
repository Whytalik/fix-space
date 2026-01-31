import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { CreateSpaceDto } from '@nucleus/domain';

@Injectable()
export class CreateSpaceUseCase {
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
        ownerId: ownerId,
      },
    });
  }
}
