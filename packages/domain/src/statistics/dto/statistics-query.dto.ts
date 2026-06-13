import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class StatisticsQueryDto {
  @ApiPropertyOptional({ description: "Space ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  spaceId?: string;

  @ApiPropertyOptional({ description: "Start of date range (ISO 8601)", example: "2025-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: "End of date range (ISO 8601)", example: "2025-12-31T23:59:59.999Z" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: "Compare period start (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  compareFrom?: string;

  @ApiPropertyOptional({ description: "Compare period end (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  compareTo?: string;
}
