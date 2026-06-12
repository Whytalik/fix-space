import { IsBoolean, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class SpaceSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultSpaceIcon: string;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  showPresetIndicators: boolean;
}

export const DEFAULT_SPACE_SETTINGS: SpaceSettings = {
  defaultSpaceIcon: "icon:Box",
  showPresetIndicators: true,
};
