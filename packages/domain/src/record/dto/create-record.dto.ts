import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export class CreateRecordDto {
  @ApiProperty({ description: "Target database ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "View ID for contextual defaults", example: "uuid", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  viewId?: string;

  @ApiProperty({ description: "Record name", example: "My Record", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Record icon emoji", example: "📁", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Record configuration data", required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config?: Record<string, unknown>;

  @ApiProperty({ description: "Template ID", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  templateId?: string;

  @ApiProperty({ description: "Source integration ID", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sourceIntegrationId?: string;

  @ApiProperty({ description: "Source label", example: "API import", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sourceLabel?: string;

  @ApiProperty({ description: "Source position ID", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sourcePositionId?: string;

  @ApiProperty({ description: "Source currency code", example: "USD", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sourceCurrency?: string;
}
