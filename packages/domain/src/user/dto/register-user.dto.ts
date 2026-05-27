import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class RegisterUserDto {
  @ApiProperty({ example: "user@example.com", description: "User email address" })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_EMAIL") })
  email: string;

  @ApiProperty({ example: "john_doe", description: "Username (3-50 chars, alphanumeric, underscores, hyphens)" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(3, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(50, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^[a-zA-Z0-9а-яА-ЯіІїЇєЄ_-]+$/, {
    message: i18nValidationMessage<I18nTranslations>("validation.INVALID_USERNAME"),
  })
  username: string;

  @ApiProperty({
    example: "P@ssw0rd!",
    description: "Password (8-128 chars, must contain uppercase, lowercase, digit, special char)",
  })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(128, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: i18nValidationMessage<I18nTranslations>("validation.INVALID_PASSWORD"),
  })
  password: string;
}
