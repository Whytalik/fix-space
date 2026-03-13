import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { AppLogger } from "../common/logger/app-logger.service";

@Injectable()
export class SettingsService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(SettingsService.name);
  }

  async getSettings<T extends object>(userId: string, category: string, defaultValues: T): Promise<T> {
    this.logger.debug("Getting settings", { userId, category });

    const dbSettings = await prisma.settings.findMany({
      where: {
        userId,
        category,
      },
    });

    const result = {
      ...defaultValues,
    };

    for (const setting of dbSettings) {
      if (setting.key in result) {
        result[setting.key as keyof T] = setting.value as T[keyof T];
      }
    }

    this.logger.log("Settings retrieved", { userId, category });

    return result;
  }

  async updateSettings<T extends object>(
    userId: string,
    category: string,
    updateDto: Partial<T>,
    defaultValues: T,
  ): Promise<T> {
    this.logger.debug("Updating settings", { userId, category });

    const operations = Object.entries({
      ...updateDto,
    }).map(([key, value]) => {
      const defaultValue = defaultValues[key as keyof T];

      const isEqual = JSON.stringify(value) === JSON.stringify(defaultValue);

      if (isEqual) {
        return prisma.settings.deleteMany({
          where: {
            userId,
            key,
            category,
          },
        });
      }

      return prisma.settings.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          value: value as Prisma.InputJsonValue,
        },
        create: {
          userId,
          key,
          value: value as Prisma.InputJsonValue,
          category,
        },
      });
    });

    await Promise.all(operations);

    this.logger.log("Settings updated", { userId, category });

    return this.getSettings(userId, category, defaultValues);
  }
}
