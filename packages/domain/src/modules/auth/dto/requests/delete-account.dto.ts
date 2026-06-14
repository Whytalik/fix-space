import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class DeleteAccountDto {
  @ApiProperty({ description: "Current password for identity confirmation", example: "P@ssw0rd!", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(8, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  password?: string;
}
