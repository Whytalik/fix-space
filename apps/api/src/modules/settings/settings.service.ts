import { Injectable } from "@nestjs/common";
import { DEFAULT_SECTION_SETTINGS, DEFAULT_SETTINGS_MAP, ICON_KEY_MAP, SettingsCategory, type IconCategory } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SettingsRepository } from "./repositories/settings.repository";

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

    const result = { ...defaultValues };

    for (const setting of dbSettings) {
      if (setting.key in result) {
        result[setting.key as keyof T] = setting.value as T[keyof T];
      }
    }

    this.logger.log("Settings retrieved", { userId, category });

    return result;
  }

  async updateSettings<T extends object>(userId: string, category: SettingsCategory, updateDto: Partial<T>, defaultValues: T): Promise<T> {
    this.logger.debug("Updating settings", { userId, category });

    await this.settingsRepo.transaction(async (tx) => {
      for (const [key, value] of Object.entries(updateDto)) {
        const defaultValue = defaultValues[key as keyof T];

        const isEqual = JSON.stringify(value) === JSON.stringify(defaultValue);

        if (isEqual) {
          await this.settingsRepo.deleteMany(userId, key, category, tx);
        } else {
          await this.settingsRepo.upsert(userId, key, category, value, tx);
        }
      }
    });

    this.logger.log("Settings updated", { userId, category });

    return this.getSettings(userId, category, defaultValues);
  }

  async getDefaultIcon(userId: string, category: IconCategory): Promise<string> {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    const iconKey = ICON_KEY_MAP[category];
    const settings = await this.getSettings(userId, category, defaults);

    return (settings as Record<string, string>)[iconKey] ?? "";
  }

  async resolveDefaults(
    userId: string,
    category: SettingsCategory,
    provided: { icon?: string; color?: string } = {},
  ): Promise<{ icon: string; color?: string }> {
    const result: { icon: string; color?: string } = { icon: "", ...provided };

    if (!result.icon) {
      result.icon = await this.getDefaultIcon(userId, category as IconCategory);
    }

    if (category === SettingsCategory.SECTION && result.color === undefined) {
      const settings = await this.getSettings(userId, SettingsCategory.SECTION, DEFAULT_SECTION_SETTINGS);
      result.color = settings.defaultSectionColor;
    }

    return result;
  }
}
