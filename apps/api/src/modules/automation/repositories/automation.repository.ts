import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

const LOG_RETENTION = 50;

@Injectable()
export class AutomationRepository extends BaseRepository {
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

  async findAllScheduled() {
    return prisma.automation.findMany({
      where: { active: true, trigger: "ON_SCHEDULE" },
    });
  }

  async create(data: Prisma.AutomationUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).automation.create({ data });
  }

  async update(id: string, data: Prisma.AutomationUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).automation.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).automation.delete({ where: { id } });
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
