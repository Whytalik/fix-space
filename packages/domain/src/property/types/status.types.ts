import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

import { STATUS_CATEGORY_VALUES, type StatusCategory } from "./status.constants";
export { STATUS_CATEGORY_VALUES, type StatusCategory, STATUS_OPTION_COLOR_VALUES, type StatusOptionColor } from "./status.constants";

export class StatusOption {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  name: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  color: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;
}

export class StatusCategoryConfig {
  @IsEnum(STATUS_CATEGORY_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  category: StatusCategory;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  label?: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  defaultOption: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => StatusOption)
  options: StatusOption[];
}

export class StatusProperty {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  defaultOption: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => StatusCategoryConfig)
  categories: StatusCategoryConfig[];
}

export { DEFAULT_STATUS_PROPERTY } from "./status.constants";
