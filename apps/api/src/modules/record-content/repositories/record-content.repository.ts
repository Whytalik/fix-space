import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class RecordContentRepository extends BaseRepository {
  async findByRecordId(recordId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContent.findUnique({
      where: { recordId },
    });
  }

  async create(data: Prisma.RecordContentUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContent.create({ data });
  }

  async update(recordId: string, data: Prisma.RecordContentUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContent.update({
      where: { recordId },
      data,
    });
  }

  async createSnapshot(recordContentId: string, content: Prisma.InputJsonValue, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContentSnapshot.create({
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

  async findSnapshotById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContentSnapshot.findUnique({
      where: { id },
    });
  }

  async deleteOldestSnapshot(recordContentId: string, transaction?: Prisma.TransactionClient) {
    const oldest = await (transaction ?? prisma).recordContentSnapshot.findFirst({
      where: { recordContentId },
      orderBy: { createdAt: "asc" },
    });

    if (oldest) {
      await (transaction ?? prisma).recordContentSnapshot.delete({
        where: { id: oldest.id },
      });
    }
  }

  async findLastSnapshot(recordContentId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContentSnapshot.findFirst({
      where: { recordContentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async countSnapshots(recordContentId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).recordContentSnapshot.count({
      where: { recordContentId },
    });
  }
}
