import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class LoginUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_EMAIL") })
  email: string;

  @ApiProperty({ example: "P@ssw0rd!" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  password: string;
}
