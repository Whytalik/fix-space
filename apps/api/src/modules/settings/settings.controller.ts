import { Body, Controller, Get, Param, ParseEnumPipe, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DEFAULT_SETTINGS_MAP, SettingsCategory } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { SettingsService } from "./settings.service";

export type UpdateSettingsDto = Partial<Record<string, unknown>>;

@ApiTags("Settings")
@ApiBearerAuth("access-token")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(":category")
  @ApiOperation({ summary: "Get user settings by category" })
  @ApiParam({ name: "category", enum: SettingsCategory, description: "Settings category" })
  @ApiResponse({ status: 200, description: "Settings retrieved." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getSettings(@Param("category", new ParseEnumPipe(SettingsCategory)) category: SettingsCategory, @CurrentUser("userId") userId: string) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.getSettings(userId, category, defaults);
  }

  @Patch(":category")
  @ApiOperation({ summary: "Update user settings by category" })
  @ApiParam({ name: "category", enum: SettingsCategory, description: "Settings category" })
  @ApiResponse({ status: 200, description: "Settings updated." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  updateSettings(
    @Param("category", new ParseEnumPipe(SettingsCategory)) category: SettingsCategory,
    @CurrentUser("userId") userId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const defaults = DEFAULT_SETTINGS_MAP[category];
    return this.settingsService.updateSettings(userId, category, updateSettingsDto, defaults);
  }
}
