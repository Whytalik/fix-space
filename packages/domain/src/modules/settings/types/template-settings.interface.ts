import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class TemplateSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultTemplateIcon: string;
}

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  defaultTemplateIcon: "icon:LayoutTemplate",
};
