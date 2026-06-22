import { IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";

export enum FieldChangeConditionType {
  EQUALS = "equals",
  BECOMES_SET = "becomes_set",
  BECOMES_UNSET = "becomes_unset",
}

export enum ScheduleInterval {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export class FieldChangeConditionDto {
  @ApiProperty({ description: "Condition type", enum: FieldChangeConditionType, example: FieldChangeConditionType.EQUALS })
  @IsEnum(FieldChangeConditionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: FieldChangeConditionType;

  @ApiPropertyOptional({ description: "Expected value (for equals condition)", example: "Win" })
  @IsOptional()
  value?: unknown;
}

export class FieldChangeTriggerConfigDto {
  @ApiProperty({ description: "Property ID to watch for changes", example: "clx123..." })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId: string;

  @ApiPropertyOptional({ description: "Optional condition on the new value", type: () => FieldChangeConditionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldChangeConditionDto)
  condition?: FieldChangeConditionDto;
}

export class ScheduleTriggerConfigDto {
  @ApiProperty({ description: "Schedule interval", enum: ScheduleInterval, example: ScheduleInterval.WEEKLY })
  @IsEnum(ScheduleInterval, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  interval: ScheduleInterval;

  @ApiProperty({ description: "Time of day in HH:mm format", example: "09:00" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  time: string;

  @ApiPropertyOptional({ description: "Day of week (0=Sunday…6=Saturday), required for weekly interval", example: 1 })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  @Max(6, { message: i18nValidationMessage<I18nTranslations>("validation.MAX") })
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: "Day of month (1–31), required for monthly interval", example: 1 })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  @Max(31, { message: i18nValidationMessage<I18nTranslations>("validation.MAX") })
  dayOfMonth?: number;
}
