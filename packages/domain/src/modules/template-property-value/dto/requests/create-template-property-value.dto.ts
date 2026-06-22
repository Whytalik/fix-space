import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";

export class CreateTemplatePropertyValueDto {
  @ApiProperty({ description: "Template ID", example: "uuid", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  templateId: string;

  @ApiProperty({ description: "Property ID", example: "uuid", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Value", required: false })
  @IsOptional()
  value?: unknown;
}
