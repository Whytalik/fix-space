import { IsEnum, IsIn, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class UserSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  dateFormat: string;

  @IsEnum(["12h", "24h"], { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  timeFormat: "12h" | "24h";

  @IsIn([0, 1], { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  startOfWeek: 0 | 1;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  timezone: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  startOfWeek: 1,
  timezone: "UTC",
};
