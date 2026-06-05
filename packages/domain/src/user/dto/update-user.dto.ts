import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";

export class UpdateUserDto {
  @ApiProperty({ description: "User email", example: "user@example.com", required: false })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_EMAIL") })
  email?: string;

  @ApiProperty({ description: "Username", example: "john_doe", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(3, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(50, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_USERNAME") })
  username?: string;

  @ApiProperty({ description: "User password", example: "Str@ngPass1", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(128, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: i18nValidationMessage<I18nTranslations>("validation.INVALID_PASSWORD"),
  })
  password?: string;

  @ApiProperty({ description: "User icon URL", example: "https://example.com/icon.png", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;
}
