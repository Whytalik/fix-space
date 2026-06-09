import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class PropertyGroupRepository extends BaseRepository {
  async findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyGroup.findUnique({ where: { id } });
  }

  async findAllByDatabase(databaseId: string) {
    return prisma.propertyGroup.findMany({
      where: { databaseId },
      orderBy: { position: "asc" },
    });
  }

  async create(data: Prisma.PropertyGroupUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyGroup.create({ data });
  }

  async update(id: string, data: Prisma.PropertyGroupUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyGroup.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyGroup.delete({ where: { id } });
  }
}
