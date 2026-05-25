import { IsBoolean, IsEnum, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

import { URL_HANDLING_VALUES, type UrlHandling } from "./text.constants";
export { URL_HANDLING_VALUES, type UrlHandling, DEFAULT_TEXT_PROPERTY } from "./text.constants";

export class TextProperty {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultValue: string;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isRichText: boolean;

  @IsEnum(URL_HANDLING_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  urlHandling: UrlHandling;
}
