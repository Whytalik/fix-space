import { IsBoolean, IsEnum, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const URL_HANDLING_VALUES = ["none", "detect", "preview"] as const;
export type UrlHandling = (typeof URL_HANDLING_VALUES)[number];

export class TextProperty {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultValue: string;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isRichText: boolean;

  @IsEnum(URL_HANDLING_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  urlHandling: UrlHandling;
}

export const DEFAULT_TEXT_PROPERTY: TextProperty = {
  defaultValue: "",
  isRichText: false,
  urlHandling: "none",
};
