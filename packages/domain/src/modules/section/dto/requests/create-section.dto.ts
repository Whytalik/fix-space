import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";

export class CreateSectionDto {
  @ApiProperty({ description: "Section name", example: "My Section", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "Section key", example: "my-section", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  key?: string;

  @ApiProperty({ description: "Position", example: 0, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  position?: number;

  @ApiProperty({ description: "Section icon", example: "icon-name", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Section color", example: "#ff0000", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  color?: string;
}
