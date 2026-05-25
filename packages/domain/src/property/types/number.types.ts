import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const NUMBER_FORMAT_VALUES = ["integer", "float", "currency", "percentage"] as const;
export type NumberFormat = (typeof NUMBER_FORMAT_VALUES)[number];

export class NumberProperty {
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
}

export const DEFAULT_NUMBER_PROPERTY: NumberProperty = {
  defaultValue: 0,
  format: "float",
  decimalPlaces: 2,
  currencySymbol: "$",
};
