import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class RatingProperty {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  @Min(0)
  defaultValue: number | null;

  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  @Max(10)
  maxStars: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  allowHalf: boolean;
}

export const DEFAULT_RATING_PROPERTY: RatingProperty = {
  defaultValue: null,
  maxStars: 5,
  allowHalf: false,
};
