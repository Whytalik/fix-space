import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class SectionRepository extends BaseRepository {
  async create(data: Prisma.SectionUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.create({ data });
  }

  async findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findUnique({ where: { id } });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.section.findUnique({
      where: { id },
      include: {
        databases: {
          include: {
            properties: true,
            templates: { include: { values: true } },
            automations: true,
          },
        },
      },
    });
  }

  async findLastPosition(spaceId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findFirst({
      where: { spaceId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
  }

  async findInSpace(sectionId: string, spaceId: string) {
    return prisma.section.findFirst({ where: { id: sectionId, spaceId } });
  }

  async findDuplicate(name: string, spaceId: string, excludeId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findFirst({
      where: { name, spaceId, id: { not: excludeId } },
    });
  }

  async findUniqueSectionName(baseName: string, spaceId: string, transaction?: Prisma.TransactionClient) {
    let name = `${baseName} (Copy)`;
    let exists = await (transaction ?? prisma).section.findFirst({ where: { name, spaceId } });
    let counter = 1;

    while (exists) {
      name = `${baseName} (Copy ${counter})`;
      exists = await (transaction ?? prisma).section.findFirst({ where: { name, spaceId } });
      counter++;
    }

    return name;
  }

  async update(id: string, data: Prisma.SectionUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.delete({ where: { id } });
  }
}
