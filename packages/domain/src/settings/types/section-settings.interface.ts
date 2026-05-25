import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class SectionSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultSectionIcon: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultSectionColor: string;
}

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  defaultSectionIcon: "icon:FolderOpen",
  defaultSectionColor: "transparent",
};
