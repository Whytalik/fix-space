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

export class ProgressPropertyConfig {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  defaultValue: number | null;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  minValue: number;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  maxValue: number;

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

export { DEFAULT_PROGRESS_PROPERTY } from "./progress.constants";
