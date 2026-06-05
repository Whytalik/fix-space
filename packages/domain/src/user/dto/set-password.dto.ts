import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";

export class SetPasswordDto {
  @ApiProperty({ description: "New password", example: "Str@ngPass1", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  password: string;
}
