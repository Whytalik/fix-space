import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DatabaseSettings,
  SectionSettings,
  SpaceSettings,
  User,
} from '@nucleus/domain';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('space')
  async getSpaceSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(
      user.id,
      'space',
      DEFAULT_SPACE_SETTINGS,
    );
  }

  @Patch('space')
  async updateSpaceSettings(
    @CurrentUser() user: User,
    @Body() updateSettingsDto: Partial<SpaceSettings>,
  ) {
    return this.settingsService.updateSettings(
      user.id,
      'space',
      updateSettingsDto,
      DEFAULT_SPACE_SETTINGS,
    );
  }

  @Get('database')
  async getDatabaseSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(
      user.id,
      'database',
      DEFAULT_DATABASE_SETTINGS,
    );
  }

  @Patch('database')
  async updateDatabaseSettings(
    @CurrentUser() user: User,
    @Body() updateSettingsDto: Partial<DatabaseSettings>,
  ) {
    return this.settingsService.updateSettings(
      user.id,
      'database',
      updateSettingsDto,
      DEFAULT_DATABASE_SETTINGS,
    );
  }

  @Get('section')
  async getSectionSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(
      user.id,
      'section',
      DEFAULT_SECTION_SETTINGS,
    );
  }

  @Patch('section')
  async updateSectionSettings(
    @CurrentUser() user: User,
    @Body() updateSettingsDto: Partial<SectionSettings>,
  ) {
    return this.settingsService.updateSettings(
      user.id,
      'section',
      updateSettingsDto,
      DEFAULT_SECTION_SETTINGS,
    );
  }
}
