import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class SelectOption {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  value: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  color?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;
}

export class SelectCategory {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  label: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => SelectOption)
  options: SelectOption[];
}

export class SelectPropertyConfig {
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isMultiSelect: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => SelectCategory)
  categories: SelectCategory[];
}

export { DEFAULT_SELECT_PROPERTY } from "./select.constants";
