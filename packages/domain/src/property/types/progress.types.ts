import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class ProgressThreshold {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  upTo: number;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  color: string;
}

export class ProgressProperty {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  defaultValue: number | null;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  min: number;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  max: number;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  @Min(0.000001)
  step: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  showLabel: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => ProgressThreshold)
  thresholds: ProgressThreshold[];
}

export const DEFAULT_PROGRESS_PROPERTY: ProgressProperty = {
  defaultValue: null,
  min: 0,
  max: 100,
  step: 1,
  showLabel: true,
  thresholds: [],
};
