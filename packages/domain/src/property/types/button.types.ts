import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsObject, IsString, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const BUTTON_COLOR_VALUES = ["neutral", "blue", "green", "red", "accent"] as const;
export type ButtonColor = (typeof BUTTON_COLOR_VALUES)[number];

export const BUTTON_ACTION_TYPE_VALUES = ["set_field", "set_fields", "create_record", "insert_block"] as const;
export type ButtonActionType = (typeof BUTTON_ACTION_TYPE_VALUES)[number];

export class ButtonAction {
  @IsEnum(BUTTON_ACTION_TYPE_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: ButtonActionType;

  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config: Record<string, unknown>;
}

export class ButtonProperty {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  label: string;

  @IsEnum(BUTTON_COLOR_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  color: ButtonColor;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  confirmDialog: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => ButtonAction)
  actions: ButtonAction[];
}

export const DEFAULT_BUTTON_PROPERTY: ButtonProperty = {
  label: "Click",
  color: "neutral",
  confirmDialog: false,
  actions: [],
};
