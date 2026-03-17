import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";

@Injectable()
export class DatabaseRepository {
  async findSpaceByOwner(spaceId: string, userId: string) {
    return prisma.space.findFirst({ where: { id: spaceId, ownerId: userId } });
  }

  async findByNameInSpace(name: string, spaceId: string) {
    return prisma.database.findFirst({ where: { name, spaceId } });
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.database.findFirst({ where: { id, space: { ownerId: userId } } });
  }

  async findByIdForDuplicate(id: string, userId: string) {
    return prisma.database.findFirst({
      where: { id, space: { ownerId: userId } },
      include: {
        properties: true,
        records: { include: { values: true } },
      },
    });
  }

  async findAllBySpace(spaceId: string, userId: string) {
    return prisma.database.findMany({ where: { spaceId, space: { ownerId: userId } } });
  }

  async findSectionInSpace(sectionId: string, spaceId: string) {
    return prisma.section.findFirst({ where: { id: sectionId, spaceId } });
  }

  async create(data: Prisma.DatabaseUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).database.create({ data });
  }

  async update(id: string, data: Prisma.DatabaseUncheckedUpdateInput) {
    return prisma.database.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.database.delete({ where: { id } });
  }

  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
