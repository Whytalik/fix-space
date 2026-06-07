import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

import { NUMBER_FORMAT_VALUES, type NumberFormat } from "./number.constants";
export { NUMBER_FORMAT_VALUES, type NumberFormat } from "./number.constants";

export class NumberPropertyConfig {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  defaultValue: number;

  @IsEnum(NUMBER_FORMAT_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  format: NumberFormat;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  decimalPlaces?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  currencySymbol?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  prefix?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  suffix?: string;
}

export { DEFAULT_NUMBER_PROPERTY } from "./number.constants";
