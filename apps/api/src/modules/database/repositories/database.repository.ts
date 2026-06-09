import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class DatabaseRepository extends BaseRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
  }

  async findByNameInSpace(name: string, spaceId: string) {
    return prisma.database.findFirst({ where: { name, spaceId } });
  }

  async findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.findUnique({ where: { id } });
  }

  async findLastPosition(spaceId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.findFirst({
      where: { spaceId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.database.findUnique({
      where: { id },
      include: {
        properties: true,
        records: { include: { values: true } },
        templates: { include: { values: true } },
        automations: true,
        views: true,
      },
    });
  }

  async findAllBySpace(spaceId: string, userId: string) {
    return prisma.database.findMany({ where: { spaceId, space: { ownerId: userId } } });
  }

  async findSectionInSpace(sectionId: string, spaceId: string) {
    return prisma.section.findFirst({ where: { id: sectionId, spaceId } });
  }

  async create(data: Prisma.DatabaseUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.create({ data });
  }

  async update(id: string, data: Prisma.DatabaseUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const database = await prisma.database.findUnique({ where: { id }, select: { id: true } });
    return !!database;
  }
}
