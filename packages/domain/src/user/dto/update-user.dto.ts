import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_EMAIL") })
  email?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(3, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(50, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^[a-zA-Z0-9\u0400-\u04FF_-]+$/, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_USERNAME") })
  username?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(128, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: i18nValidationMessage<I18nTranslations>("validation.INVALID_PASSWORD"),
  })
  password?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;
}
