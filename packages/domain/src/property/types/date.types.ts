import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const DATA_FORMATS_VALUES = ["DD.MM.YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;
export type DataFormat = (typeof DATA_FORMATS_VALUES)[number];

export const TIME_FORMATS_VALUES = ["HH:mm", "hh:mm A"] as const;
export type TimeFormat = (typeof TIME_FORMATS_VALUES)[number];

export class DateProperty {
  @IsOptional()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @Type(() => Date)
  defaultValue: Date | null;

  @IsEnum(DATA_FORMATS_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  format: DataFormat;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeTime: boolean;

  @IsEnum(TIME_FORMATS_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  timeFormat: TimeFormat;
}

export const DEFAULT_DATE_PROPERTY: DateProperty = {
  defaultValue: null,
  format: DATA_FORMATS_VALUES[0],
  includeTime: false,
  timeFormat: TIME_FORMATS_VALUES[0],
};
