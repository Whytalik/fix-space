import { IsNotEmpty, IsObject, IsString, MaxLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export enum ImportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export class CreateImportMappingDto {
  @ApiProperty({ description: "Target database identifier", example: "db_a1b2c3d4", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "Mapping name", example: "Binance Trades Import", required: true, maxLength: 255 })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "Source data type", example: "CSV", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  sourceType: string;

  @ApiProperty({ description: "Field mapping rules (source → target)", example: { col_name: "field_name" }, required: true })
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  mappingRules: Record<string, string>;
}
