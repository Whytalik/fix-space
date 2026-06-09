import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { CreatePropertyDto } from "../../property/dto/create-property.dto";
import { DatabaseConfigDto } from "./database-config.dto";

export type DatabaseType =
  | "trading-journal"
  | "daily-routine"
  | "routine-library"
  | "notes"
  | "mistakes"
  | "accounts"
  | "operations"
  | "trading-system"
  | "performance-review"
  | "custom";

export const DATABASE_TYPES: DatabaseType[] = [
  "trading-journal",
  "daily-routine",
  "routine-library",
  "notes",
  "mistakes",
  "accounts",
  "operations",
  "trading-system",
  "performance-review",
  "custom",
];

export class CreateDatabaseDto {
  @ApiProperty({ description: "Space ID" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  spaceId: string;

  @ApiProperty({ description: "Database slug name (1-120 chars)", example: "trading-journal" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "Display title (1-255 chars)", example: "My Trading Journal" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  title: string;

  @ApiProperty({ description: "Database type", example: "trading-journal", required: false })
  @IsOptional()
  @IsIn(DATABASE_TYPES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  type?: DatabaseType;

  @ApiProperty({ description: "Unique key for system databases", example: "trading-journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  key?: string;

  @ApiProperty({ description: "Section ID", required: false })
  @IsOptional()
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  sectionId?: string;

  @ApiProperty({ description: "Section key", example: "general", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sectionKey?: string;

  @ApiProperty({ description: "Database icon identifier", example: "database", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Whether database is a preset", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isPreset?: boolean;

  @ApiProperty({ description: "Whether to enable statistics", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  enableStats?: boolean;

  @ApiProperty({ description: "Database configuration", required: false, type: () => DatabaseConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseConfigDto)
  config?: DatabaseConfigDto;

  @ApiProperty({ description: "Initial properties", required: false, type: () => CreatePropertyDto, isArray: true })
  @IsOptional()
  properties?: CreatePropertyDto[];
}
