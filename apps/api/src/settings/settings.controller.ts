import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DatabaseSettings,
  SectionSettings,
  SpaceSettings,
} from '@nucleus/domain';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('space')
  async getSpaceSettings(@CurrentUser('userId') userId: string) {
    return this.settingsService.getSettings(userId, 'space', DEFAULT_SPACE_SETTINGS);
  }

  @Patch('space')
  async updateSpaceSettings(@CurrentUser('userId') userId: string, @Body() updateSettingsDto: Partial<SpaceSettings>) {
    return this.settingsService.updateSettings(userId, 'space', updateSettingsDto, DEFAULT_SPACE_SETTINGS);
  }

  @Get('database')
  async getDatabaseSettings(@CurrentUser('userId') userId: string) {
    return this.settingsService.getSettings(userId, 'database', DEFAULT_DATABASE_SETTINGS);
  }

  @Patch('database')
  async updateDatabaseSettings(
    @CurrentUser('userId') userId: string,
    @Body() updateSettingsDto: Partial<DatabaseSettings>,
  ) {
    return this.settingsService.updateSettings(userId, 'database', updateSettingsDto, DEFAULT_DATABASE_SETTINGS);
  }

  @Get('section')
  async getSectionSettings(@CurrentUser('userId') userId: string) {
    return this.settingsService.getSettings(userId, 'section', DEFAULT_SECTION_SETTINGS);
  }

  @Patch('section')
  async updateSectionSettings(
    @CurrentUser('userId') userId: string,
    @Body() updateSettingsDto: Partial<SectionSettings>,
  ) {
    return this.settingsService.updateSettings(userId, 'section', updateSettingsDto, DEFAULT_SECTION_SETTINGS);
  }
}
