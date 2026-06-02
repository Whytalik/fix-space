import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "../../../common/utils/base.repository";

@Injectable()
export class SectionRepository extends BaseRepository {
  async create(data: Prisma.SectionUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.create({ data });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.findUnique({ where: { id } });
  }

  async findLastPosition(spaceId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.findFirst({
      where: { spaceId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
  }

  async findDuplicate(name: string, spaceId: string, excludeId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.findFirst({
      where: { name, spaceId, id: { not: excludeId } },
    });
  }

  async update(id: string, data: Prisma.SectionUpdateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).section.delete({ where: { id } });
  }
}
