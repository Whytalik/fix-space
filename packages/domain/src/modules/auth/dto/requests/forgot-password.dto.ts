import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>("validation.INVALID_EMAIL") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  email: string;
}
