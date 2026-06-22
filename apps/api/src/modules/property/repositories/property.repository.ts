import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class PropertyRepository extends BaseRepository {
  async findById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: { propertyGroup: { select: { name: true } } },
    });
  }

  async findByNameInDatabase(name: string, databaseId: string) {
    return prisma.property.findFirst({ where: { name, databaseId } });
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.property.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
      include: { propertyGroup: { select: { name: true } } },
    });
  }

  async findByNameExcluding(name: string, databaseId: string, excludeId: string) {
    return prisma.property.findFirst({
      where: { name, databaseId, NOT: { id: excludeId } },
    });
  }

  async findAllByDatabase(databaseId: string, userId: string) {
    return prisma.property.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      orderBy: { position: "asc" },
      include: { propertyGroup: { select: { name: true } } },
    });
  }

  async findManyByDatabase(databaseId: string) {
    return prisma.property.findMany({ where: { databaseId } });
  }

  async create(data: Prisma.PropertyUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).property.create({ data });
  }

  async update(id: string, data: Prisma.PropertyUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).property.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).property.delete({ where: { id } });
  }
}
