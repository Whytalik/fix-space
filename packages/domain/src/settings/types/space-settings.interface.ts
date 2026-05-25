import { IsEnum, IsIn, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class SpaceSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultSpaceIcon: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  dateFormat: string;

  @IsEnum(["12h", "24h"], { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  timeFormat: "12h" | "24h";

  @IsIn([0, 1], { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  startOfWeek: 0 | 1;
}

export const DEFAULT_SPACE_SETTINGS: SpaceSettings = {
  defaultSpaceIcon: "icon:LayoutDashboard",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  startOfWeek: 1,
};
