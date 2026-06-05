import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import {
  DatabaseSettings,
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_RECORD_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  RecordSettings,
  SectionSettings,
  SpaceSettings,
} from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { SettingsCategory } from "./constants/settings.constants";
import { SettingsService } from "./settings.service";

const DEFAULT_SETTINGS_MAP = {
  [SettingsCategory.SPACE]: DEFAULT_SPACE_SETTINGS,
  [SettingsCategory.DATABASE]: DEFAULT_DATABASE_SETTINGS,
  [SettingsCategory.SECTION]: DEFAULT_SECTION_SETTINGS,
  [SettingsCategory.RECORD]: DEFAULT_RECORD_SETTINGS,
};

type UpdateSettingsDto = Partial<SpaceSettings | DatabaseSettings | SectionSettings | RecordSettings>;

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(":category")
  getSettings(@Param("category") category: SettingsCategory, @CurrentUser("userId") userId: string) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.getSettings(userId, category, defaults);
  }

  @Patch(":category")
  updateSettings(
    @Param("category") category: SettingsCategory,
    @CurrentUser("userId") userId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.updateSettings(userId, category, updateSettingsDto, defaults);
  }
}
