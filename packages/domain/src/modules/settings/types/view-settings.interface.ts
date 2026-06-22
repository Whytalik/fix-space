import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class ViewSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultViewIcon: string;
}

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  defaultViewIcon: "icon:Table2",
};
