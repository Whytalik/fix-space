import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  DatabaseSettings,
  DEFAULT_DATABASE_SETTINGS,
  DEFAULT_RECORD_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DEFAULT_USER_SETTINGS,
  DEFAULT_VIEW_SETTINGS,
  RecordSettings,
  SectionSettings,
  SpaceSettings,
  UserSettings,
  ViewSettings,
} from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { SettingsCategory } from "./constants/settings.constants";
import { SettingsService } from "./settings.service";

const DEFAULT_SETTINGS_MAP = {
  [SettingsCategory.USER]: DEFAULT_USER_SETTINGS,
  [SettingsCategory.SPACE]: DEFAULT_SPACE_SETTINGS,
  [SettingsCategory.DATABASE]: DEFAULT_DATABASE_SETTINGS,
  [SettingsCategory.SECTION]: DEFAULT_SECTION_SETTINGS,
  [SettingsCategory.RECORD]: DEFAULT_RECORD_SETTINGS,
  [SettingsCategory.VIEW]: DEFAULT_VIEW_SETTINGS,
};

type UpdateSettingsDto = Partial<UserSettings | SpaceSettings | DatabaseSettings | SectionSettings | RecordSettings | ViewSettings>;

@ApiTags("Settings")
@ApiBearerAuth("access-token")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(":category")
  @ApiOperation({ summary: "Get user settings by category" })
  @ApiParam({ name: "category", enum: SettingsCategory, description: "Settings category" })
  @ApiResponse({ status: 200, description: "Settings retrieved." })
  getSettings(@Param("category") category: SettingsCategory, @CurrentUser("userId") userId: string) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.getSettings(userId, category, defaults);
  }

  @Patch(":category")
  @ApiOperation({ summary: "Update user settings by category" })
  @ApiParam({ name: "category", enum: SettingsCategory, description: "Settings category" })
  @ApiResponse({ status: 200, description: "Settings updated." })
  @ApiResponse({ status: 400, description: "Validation error." })
  updateSettings(
    @Param("category") category: SettingsCategory,
    @CurrentUser("userId") userId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.updateSettings(userId, category, updateSettingsDto, defaults);
  }
}
