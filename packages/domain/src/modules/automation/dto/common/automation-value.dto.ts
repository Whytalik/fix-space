import { IsEnum, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";

export enum ValueType {
  FIXED = "FIXED",
  TODAY = "TODAY",
  FIELD_REF = "FIELD_REF",
}

export class AutomationValueDto {
  @ApiProperty({ description: "Value type", enum: ValueType, example: ValueType.FIXED })
  @IsEnum(ValueType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  valueType: ValueType;

  @ApiPropertyOptional({ description: "Fixed value (when valueType = FIXED)", example: "Win" })
  @IsOptional()
  value?: unknown;

  @ApiPropertyOptional({ description: "Source property ID (when valueType = FIELD_REF)", example: "clx123..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  fieldRef?: string;
}
