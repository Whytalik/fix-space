import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "../../../common/utils/base.repository";

@Injectable()
export class DatabaseRepository extends BaseRepository {
  async findSpaceByOwner(spaceId: string, userId: string) {
    return prisma.space.findFirst({ where: { id: spaceId, ownerId: userId } });
  }

  async findByNameInSpace(name: string, spaceId: string) {
    return prisma.database.findFirst({ where: { name, spaceId } });
  }

  async findById(id: string) {
    return prisma.database.findUnique({ where: { id } });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.database.findUnique({
      where: { id },
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

  async create(data: Prisma.DatabaseUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.create({ data });
  }

  async update(id: string, data: Prisma.DatabaseUncheckedUpdateInput) {
    return prisma.database.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.database.delete({ where: { id } });
  }
}
