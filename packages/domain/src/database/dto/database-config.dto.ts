import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class DatabaseConfigDto {
  @ApiProperty({ description: "Whether to show summaries", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  showSummaries?: boolean;

  @ApiProperty({ description: "Whether to include in statistics", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeInStats?: boolean;

  @ApiProperty({ description: "Default name pattern", example: "Record #{n}", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultNamePattern?: string;
}
