import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

import { DATA_FORMATS_VALUES, type DataFormat, TIME_FORMATS_VALUES, type TimeFormat } from "./date.constants";
export { DATA_FORMATS_VALUES, type DataFormat, TIME_FORMATS_VALUES, type TimeFormat } from "./date.constants";

export class DatePropertyConfig {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultValue: string | null;

  @IsEnum(DATA_FORMATS_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  format: DataFormat;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeTime: boolean;

  @IsEnum(TIME_FORMATS_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  timeFormat: TimeFormat;
}

export { DEFAULT_DATE_PROPERTY } from "./date.constants";
