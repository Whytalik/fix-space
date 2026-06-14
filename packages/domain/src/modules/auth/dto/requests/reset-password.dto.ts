import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class ResetPasswordDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  token: string;

  @ApiProperty({ example: "NewP@ssw0rd!" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(128, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: i18nValidationMessage<I18nTranslations>("validation.INVALID_PASSWORD"),
  })
  newPassword: string;
}
