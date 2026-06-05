import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class SpaceConfigDto {
  @ApiProperty({ description: "Active trading session identifiers", example: ["morning", "evening"], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  activeTradingSessions?: string[];

  @ApiProperty({ description: "Whether to show daily workflow", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  showDailyWorkflow?: boolean;

  @ApiProperty({ description: "Whether to show today's cards", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  showTodayCards?: boolean;
}
