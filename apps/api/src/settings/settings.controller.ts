import { Body, Controller, Get, Patch } from "@nestjs/common";
import {
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_RECORD_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DatabaseSettings,
  RecordSettings,
  SectionSettings,
  SpaceSettings,
} from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { SettingsCategory } from "./settings.constants";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(SettingsCategory.SPACE)
  getSpaceSettings(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.settingsService.getSettings(userId, SettingsCategory.SPACE, DEFAULT_SPACE_SETTINGS);
  }

  @Patch(SettingsCategory.SPACE)
  updateSpaceSettings(
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateSettingsDto: Partial<SpaceSettings>,
  ) {
    return this.settingsService.updateSettings(
      userId,
      SettingsCategory.SPACE,
      updateSettingsDto,
      DEFAULT_SPACE_SETTINGS,
    );
  }

  @Get(SettingsCategory.DATABASE)
  getDatabaseSettings(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.settingsService.getSettings(userId, SettingsCategory.DATABASE, DEFAULT_DATABASE_SETTINGS);
  }

  @Patch(SettingsCategory.DATABASE)
  updateDatabaseSettings(
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateSettingsDto: Partial<DatabaseSettings>,
  ) {
    return this.settingsService.updateSettings(
      userId,
      SettingsCategory.DATABASE,
      updateSettingsDto,
      DEFAULT_DATABASE_SETTINGS,
    );
  }

  @Get(SettingsCategory.SECTION)
  getSectionSettings(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.settingsService.getSettings(userId, SettingsCategory.SECTION, DEFAULT_SECTION_SETTINGS);
  }

  @Patch(SettingsCategory.SECTION)
  updateSectionSettings(
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateSettingsDto: Partial<SectionSettings>,
  ) {
    return this.settingsService.updateSettings(
      userId,
      SettingsCategory.SECTION,
      updateSettingsDto,
      DEFAULT_SECTION_SETTINGS,
    );
  }

  @Get(SettingsCategory.RECORD)
  getRecordSettings(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.settingsService.getSettings(userId, SettingsCategory.RECORD, DEFAULT_RECORD_SETTINGS);
  }

  @Patch(SettingsCategory.RECORD)
  updateRecordSettings(
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateSettingsDto: Partial<RecordSettings>,
  ) {
    return this.settingsService.updateSettings(
      userId,
      SettingsCategory.RECORD,
      updateSettingsDto,
      DEFAULT_RECORD_SETTINGS,
    );
  }
}
