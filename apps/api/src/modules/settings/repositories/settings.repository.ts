import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";
import { SettingsCategory } from "../constants/settings.constants";

@Injectable()
export class SettingsRepository extends BaseRepository {
  findMany(userId: string, category: SettingsCategory) {
    return prisma.settings.findMany({ where: { userId, category } });
  }

  upsert(userId: string, key: string, category: SettingsCategory, value: unknown) {
    return prisma.settings.upsert({
      where: { userId_key: { userId, key } },
      update: { value: value as Prisma.InputJsonValue },
      create: { userId, key, value: value as Prisma.InputJsonValue, category },
    });
  }

  deleteMany(userId: string, key: string, category: SettingsCategory) {
    return prisma.settings.deleteMany({ where: { userId, key, category } });
  }

  async runTransaction(operations: Prisma.PrismaPromise<unknown>[]) {
    return prisma.$transaction(operations);
  }
}
