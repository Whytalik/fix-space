import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export enum GroupField {
  PROPERTY = "property",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export enum DateGroupGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export class RecordGroupDto {
  @IsEnum(GroupField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field: GroupField;

  @ValidateIf((o) => o.field === GroupField.PROPERTY)
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;

  @IsOptional()
  @IsEnum(DateGroupGranularity, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  granularity?: DateGroupGranularity;
}
