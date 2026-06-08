import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { CreatePropertyDto } from "../../property/dto/create-property.dto";
import { DATABASE_TYPES, DatabaseType } from "./create-database.dto";
import { DatabaseConfigDto } from "./database-config.dto";

export class UpdateDatabaseDto {
  @ApiProperty({ description: "Space ID", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  spaceId?: string;

  @ApiProperty({ description: "Database slug name (1-120 chars)", example: "trading-journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Display title (1-255 chars)", example: "My Trading Journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  title?: string;

  @ApiProperty({ description: "Database type", example: "trading-journal", required: false })
  @IsOptional()
  @IsIn(DATABASE_TYPES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  type?: DatabaseType;

  @ApiProperty({ description: "Unique key for system databases", example: "trading-journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  key?: string;

  @ApiProperty({ description: "Position for ordering", example: 0, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  position?: number;

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

  @ApiProperty({ description: "Whether the database is locked", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isLocked?: boolean;

  @ApiProperty({ description: "Whether to enable statistics", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  enableStats?: boolean;

  @ApiProperty({ description: "Database configuration", required: false, type: () => DatabaseConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseConfigDto)
  config?: DatabaseConfigDto;

  @ApiProperty({ description: "Properties to update", required: false, type: () => CreatePropertyDto, isArray: true })
  @IsOptional()
  properties?: CreatePropertyDto[];
}
