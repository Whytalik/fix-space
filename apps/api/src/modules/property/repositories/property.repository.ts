import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class PropertyRepository extends BaseRepository {
  async findById(id: string) {
    return prisma.property.findUnique({ where: { id } });
  }

  async findByNameInDatabase(name: string, databaseId: string) {
    return prisma.property.findFirst({ where: { name, databaseId } });
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.property.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
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
    });
  }

  async findManyByDatabase(databaseId: string) {
    return prisma.property.findMany({ where: { databaseId } });
  }

  async create(data: Prisma.PropertyUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).property.create({ data });
  }

  async update(id: string, data: Prisma.PropertyUpdateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).property.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.property.delete({ where: { id } });
  }
}
