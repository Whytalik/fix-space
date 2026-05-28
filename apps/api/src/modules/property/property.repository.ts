import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";

@Injectable()
export class PropertyRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
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

  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
