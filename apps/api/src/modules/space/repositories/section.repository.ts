import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "../../../common/utils/base.repository";

@Injectable()
export class SectionRepository extends BaseRepository {
  async create(data: Prisma.SectionUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.create({ data });
  }

  async findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findUnique({ where: { id } });
  }

  async findLastPosition(spaceId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findFirst({
      where: { spaceId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
  }

  async findDuplicate(name: string, spaceId: string, excludeId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.findFirst({
      where: { name, spaceId, id: { not: excludeId } },
    });
  }

  async update(id: string, data: Prisma.SectionUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).section.delete({ where: { id } });
  }
}
