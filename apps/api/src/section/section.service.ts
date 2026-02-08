import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { CreateSectionDto, UpdateSectionDto } from '@nucleus/domain';

@Injectable()
export class SectionService {
  async create(spaceId: string, createSectionDto: CreateSectionDto) {
    return await prisma.section.create({
      data: {
        name: createSectionDto.name,
        position: createSectionDto.position,
        icon: createSectionDto.icon,
        color: createSectionDto.color,
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
      throw new NotFoundException(`Section with id ${id} not found`);
    }

    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const isSectionExists = await prisma.section.findUnique({
      where: { id },
    });

    if (!isSectionExists) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }

    const isNameTaken = await prisma.section.findFirst({
      where: {
        name: updateSectionDto.name,
        id: { not: id },
      },
    });

    if (isNameTaken) {
      throw new NotFoundException(
        `Section with name ${updateSectionDto.name} already exists`,
      );
    }

    return await prisma.section.update({
      where: { id },
      data: {
        name: updateSectionDto.name,
        position: updateSectionDto.position,
        icon: updateSectionDto.icon,
        color: updateSectionDto.color,
      },
    });
  }

  async remove(id: string) {
    const isSectionExists = await prisma.section.findUnique({
      where: { id },
    });

    if (!isSectionExists) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }

    return await prisma.section.delete({
      where: { id },
    });
  }
}
