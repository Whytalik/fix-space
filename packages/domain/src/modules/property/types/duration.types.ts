import { IsEnum, IsInt, IsOptional, Min, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

import { DURATION_FORMAT_VALUES, type DurationFormat } from "./duration.constants";
export { DURATION_FORMAT_VALUES, type DurationFormat } from "./duration.constants";

export class DurationPropertyConfig {
  @IsOptional()
  @ValidateIf((object: DurationPropertyConfig) => object.defaultValue !== null)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  defaultValue: number | null;

  @IsEnum(DURATION_FORMAT_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  format: DurationFormat;
}

export { DEFAULT_DURATION_PROPERTY } from "./duration.constants";
