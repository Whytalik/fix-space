import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { CreateSectionDto, UpdateSectionDto } from '@nucleus/domain';

@Injectable()
export class SectionService {
  async create(spaceId: string, createSectionDto: CreateSectionDto) {
    return prisma.section.create({
      data: {
        ...createSectionDto,
        spaceId,
      },
    });
  }

  async findAll(spaceId: string) {
    return prisma.section.findMany({
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
      where: { id: id },
    });

    if (!isSectionExists) {
      throw new Error(`Section with id ${id} not found`);
    }

    return prisma.section.update({
      where: { id: id },
      data: updateSectionDto,
    });
  }

  async remove(id: string) {
    const isSectionExists = await prisma.section.findUnique({
      where: { id },
    });

    if (!isSectionExists) {
      throw new Error(`Section with id ${id} not found`);
    }

    await prisma.section.delete({
      where: { id },
    });
  }
}
