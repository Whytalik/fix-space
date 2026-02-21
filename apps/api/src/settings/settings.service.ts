import { Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';

@Injectable()
export class SettingsService {
  async getSettings<T extends object>(
    userId: string,
    category: string,
    defaultValues: T,
  ): Promise<T> {
    const dbSettings = await prisma.settings.findMany({
      where: { userId, category },
    });

    const result = { ...defaultValues };

    for (const setting of dbSettings) {
      if (setting.key in result) {
        result[setting.key as keyof T] = setting.value as T[keyof T];
      }
    }

    return result;
  }

  async updateSettings<T extends object>(
    userId: string,
    category: string,
    updateDto: Partial<T>,
    defaultValues: T,
  ): Promise<T> {
    const operations = Object.entries({ ...updateDto }).map(([key, value]) => {
      const defaultValue = defaultValues[key as keyof T];

      const isEqual = JSON.stringify(value) === JSON.stringify(defaultValue);

      if (isEqual) {
        return prisma.settings.deleteMany({
          where: { userId, key, category },
        });
      }

      return prisma.settings.upsert({
        where: { userId_key: { userId, key } },
        update: { value: value as Prisma.JsonValue },
        create: {
          userId,
          key,
          value: value as Prisma.JsonValue,
          category,
        },
      });
    });

    await Promise.all(operations);

    return this.getSettings(userId, category, defaultValues);
  }
}
