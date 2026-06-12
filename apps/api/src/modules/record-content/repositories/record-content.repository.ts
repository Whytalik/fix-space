import { Injectable } from "@nestjs/common";

import { Prisma, prisma } from "@fixspace/database";

import { BaseRepository } from "../../../common/utils/base.repository";

@Injectable()
export class RecordContentRepository extends BaseRepository {
  async findByRecordId(recordId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContent.findUnique({
      where: { recordId },
    });
  }

  async create(data: Prisma.RecordContentUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContent.create({ data });
  }

  async update(recordId: string, data: Prisma.RecordContentUpdateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContent.update({
      where: { recordId },
      data,
    });
  }

  async createSnapshot(recordContentId: string, content: Prisma.InputJsonValue, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContentSnapshot.create({
      data: { recordContentId, content },
    });
  }

  async findSnapshotsByContentId(recordContentId: string) {
    return prisma.recordContentSnapshot.findMany({
      where: { recordContentId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async findSnapshotById(id: string) {
    return prisma.recordContentSnapshot.findUnique({
      where: { id },
    });
  }

  async deleteOldestSnapshot(recordContentId: string, tx?: Prisma.TransactionClient) {
    const oldest = await (tx ?? prisma).recordContentSnapshot.findFirst({
      where: { recordContentId },
      orderBy: { createdAt: "asc" },
    });

    if (oldest) {
      await (tx ?? prisma).recordContentSnapshot.delete({
        where: { id: oldest.id },
      });
    }
  }

  async findLastSnapshot(recordContentId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContentSnapshot.findFirst({
      where: { recordContentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async countSnapshots(recordContentId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).recordContentSnapshot.count({
      where: { recordContentId },
    });
  }
}
