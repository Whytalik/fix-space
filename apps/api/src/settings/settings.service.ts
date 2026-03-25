import { Injectable } from "@nestjs/common";
import { AppLogger } from "../common/logger/app-logger.service";
import { SettingsCategory } from "./settings.constants";
import { SettingsRepository } from "./settings.repository";

@Injectable()
export class SettingsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly settingsRepo: SettingsRepository,
  ) {
    this.logger.setContext(SettingsService.name);
  }

  async getSettings<T extends object>(userId: string, category: SettingsCategory, defaultValues: T): Promise<T> {
    this.logger.debug("Getting settings", { userId, category });

    const dbSettings = await this.settingsRepo.findMany(userId, category);

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
    category: SettingsCategory,
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
        return this.settingsRepo.deleteMany(userId, key, category);
      }

      return this.settingsRepo.upsert(userId, key, category, value);
    });

    await this.settingsRepo.runTransaction(operations);

    this.logger.log("Settings updated", { userId, category });

    return this.getSettings(userId, category, defaultValues);
  }
}
