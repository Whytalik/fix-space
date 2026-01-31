import { Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateSectionDto, UpdateSectionDto } from '@nucleus/domain';

@Injectable()
export class SectionService {
  async create(spaceId: string, createSectionDto: CreateSectionDto) {
    return await prisma.section.create({
      data: {
        name: createSectionDto.name,
        position: createSectionDto.position,
        config: createSectionDto.config as Prisma.JsonValue,
        spaceId,
      },
    });
  }

  async findAll(spaceId: string) {
    return await prisma.section.findMany({
      where: { spaceId },
    });
  }

  async findOne(id: string) {
    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new Error(`Section with id ${id} not found`);
    }

    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const isSectionExists = await prisma.section.findUnique({
      where: { id },
    });

    if (!isSectionExists) {
      throw new Error(`Section with id ${id} not found`);
    }

    return await prisma.section.update({
      where: { id },
      data: {
        name: updateSectionDto.name,
        position: updateSectionDto.position,
        config: updateSectionDto.config as Prisma.JsonValue,
      },
    });
  }

  async remove(id: string) {
    const isSectionExists = await prisma.section.findUnique({
      where: { id },
    });

    if (!isSectionExists) {
      throw new Error(`Section with id ${id} not found`);
    }

    return await prisma.section.delete({
      where: { id },
    });
  }
}
