import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

const LOG_RETENTION = 50;

@Injectable()
export class AutomationRepository extends BaseRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
  }

  async findDatabaseName(databaseId: string): Promise<string | null> {
    const db = await prisma.database.findUnique({
      where: { id: databaseId },
      select: { name: true },
    });
    return db?.name ?? null;
  }

  async findDatabaseWithOwner(databaseId: string) {
    return prisma.database.findUnique({
      where: { id: databaseId },
      include: { space: { select: { ownerId: true } } },
    });
  }

  async findAllByDatabase(databaseId: string) {
    return prisma.automation.findMany({ where: { databaseId } });
  }

  async countByDatabase(databaseId: string) {
    return prisma.automation.count({ where: { databaseId } });
  }

  async findById(id: string) {
    return prisma.automation.findUnique({ where: { id } });
  }

  async findByOwner(id: string, userId: string) {
    return prisma.automation.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });
  }

  async findRecordWithValues(recordId: string) {
    return prisma.record.findUnique({
      where: { id: recordId },
      include: { values: true },
    });
  }

  async findAllRecordsWithValues(databaseId: string) {
    return prisma.record.findMany({
      where: { databaseId },
      include: { values: true },
    });
  }

  async findAllScheduled() {
    return prisma.automation.findMany({
      where: { active: true, trigger: "ON_SCHEDULE" },
    });
  }

  async create(data: Prisma.AutomationUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).automation.create({ data });
  }

  async update(id: string, data: Prisma.AutomationUpdateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).automation.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).automation.delete({ where: { id } });
  }

  async createLog(data: Prisma.AutomationLogUncheckedCreateInput) {
    const log = await prisma.automationLog.create({ data });
    await this.pruneOldLogs(data.automationId);
    return log;
  }

  async findLogsByAutomation(automationId: string) {
    return prisma.automationLog.findMany({
      where: { automationId },
      orderBy: { createdAt: "desc" },
      take: LOG_RETENTION,
    });
  }

  private async pruneOldLogs(automationId: string) {
    const logs = await prisma.automationLog.findMany({
      where: { automationId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (logs.length > LOG_RETENTION) {
      const idsToDelete = logs.slice(LOG_RETENTION).map((log) => log.id);
      await prisma.automationLog.deleteMany({ where: { id: { in: idsToDelete } } });
    }
  }
}
