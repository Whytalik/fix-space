import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";
import { sectionsInclude } from "../constants/space.constants";

@Injectable()
export class SpaceRepository extends BaseRepository {
  async findOne(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.findUnique({ where: { id } });
  }

  async findOneWithSections(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.findUnique({ where: { id }, include: sectionsInclude });
  }

  async findOneWithDatabases(id: string) {
    return prisma.space.findUnique({ where: { id }, include: { databases: true } });
  }

  async findAllWithSections(ownerId: string) {
    return prisma.space.findMany({ where: { ownerId }, include: sectionsInclude });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.space.findUnique({
      where: { id },
      include: {
        sections: true,
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

  async findUniqueSpaceName(baseName: string, ownerId: string, transaction?: Prisma.TransactionClient) {
    let name = `${baseName} (Copy)`;
    let exists = await (transaction ?? prisma).space.findFirst({ where: { name, ownerId } });
    let counter = 1;

    while (exists) {
      name = `${baseName} (Copy ${counter})`;
      exists = await (transaction ?? prisma).space.findFirst({ where: { name, ownerId } });
      counter++;
    }

    return name;
  }

  async findOwner(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.findUnique({
      where: { id },
      select: { ownerId: true, isDefault: true },
    });
  }

  async count(ownerId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.count({ where: { ownerId } });
  }

  async createWithSections(data: Prisma.SpaceUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.create({ data, include: sectionsInclude });
  }

  async updateWithSections(id: string, data: Prisma.SpaceUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.update({ where: { id }, data, include: sectionsInclude });
  }

  async updateMany(where: Prisma.SpaceWhereInput, data: Prisma.SpaceUpdateManyMutationInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.updateMany({ where, data });
  }

  async delete(id: string) {
    return prisma.space.delete({ where: { id } });
  }
}
