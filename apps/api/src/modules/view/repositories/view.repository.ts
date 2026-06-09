import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class ViewRepository extends BaseRepository {
  async findAllByDatabase(databaseId: string) {
    return prisma.view.findMany({
      where: { databaseId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.view.findUnique({ where: { id } });
  }

  async countByDatabase(databaseId: string) {
    return prisma.view.count({ where: { databaseId } });
  }

  async create(data: Prisma.ViewUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).view.create({ data });
  }

  async update(id: string, data: Prisma.ViewUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).view.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).view.delete({ where: { id } });
  }
}
