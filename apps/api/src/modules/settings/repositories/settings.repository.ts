import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";
import { SettingsCategory } from "@fixspace/domain";

@Injectable()
export class SettingsRepository extends BaseRepository {
  async findMany(userId: string, category: SettingsCategory) {
    return prisma.settings.findMany({ where: { userId, category } });
  }

  async upsert(userId: string, key: string, category: SettingsCategory, value: unknown, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).settings.upsert({
      where: { userId_key: { userId, key } },
      update: { value: value as Prisma.InputJsonValue },
      create: { userId, key, value: value as Prisma.InputJsonValue, category },
    });
  }

  async deleteMany(userId: string, key: string, category: SettingsCategory, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).settings.deleteMany({ where: { userId, key, category } });
  }
}
