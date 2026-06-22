import { Injectable } from "@nestjs/common";
import { prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class StatisticsRepository extends BaseRepository {
  async findTradingJournalDb(userId: string) {
    return prisma.database.findFirst({
      where: { type: "trading-journal", space: { ownerId: userId } },
      include: { properties: true },
    });
  }

  async findAllDatabases(userId: string, spaceId?: string) {
    return prisma.database.findMany({
      where: { space: { ownerId: userId, ...(spaceId ? { id: spaceId } : {}) } },
      include: { properties: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findRecordsByDatabaseIds(databaseIds: string[]) {
    return prisma.record.findMany({
      where: { databaseId: { in: databaseIds } },
      include: { values: true },
    });
  }

  async findRecordsByDatabaseId(databaseId: string) {
    return prisma.record.findMany({
      where: { databaseId },
      include: { values: true },
    });
  }
}
