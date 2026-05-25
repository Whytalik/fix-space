import { IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const DURATION_FORMAT_VALUES = ["HH:mm", "HH:mm:ss", "Xh Ym", "minutes", "seconds"] as const;
export type DurationFormat = (typeof DURATION_FORMAT_VALUES)[number];

export class DurationProperty {
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  defaultValue: number | null;

  @IsEnum(DURATION_FORMAT_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  format: DurationFormat;
}

export const DEFAULT_DURATION_PROPERTY: DurationProperty = {
  defaultValue: null,
  format: "HH:mm",
};
