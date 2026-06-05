import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import { RecordFilterDto } from "../../record/dto/record-filter.dto";
import { RecordSortDto } from "../../record/dto/record-sort.dto";

export class UpdateViewDto {
  @ApiProperty({ description: "View name", example: "Grid View", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Is default view", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isDefault?: boolean;

  @ApiProperty({ description: "Is view locked", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isLocked?: boolean;

  @ApiProperty({ description: "Page size", example: 50, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  pageSize?: number;

  @ApiProperty({ description: "Filters", required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => RecordFilterDto)
  filters?: RecordFilterDto[];

  @ApiProperty({ description: "Sort configuration", required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => RecordSortDto)
  sort?: RecordSortDto[];

  @ApiProperty({ description: "Group by property", example: "status", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  groupBy?: string | null;

  @ApiProperty({ description: "Hidden columns", example: ["col1", "col2"], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  hiddenColumns?: string[];

  @ApiProperty({ description: "Column widths", example: { col1: 200 }, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  columnWidths?: Record<string, number> | null;

  @ApiProperty({ description: "Text wrap enabled", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  textWrap?: boolean;

  @ApiProperty({ description: "Search query", example: "search term", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  searchQuery?: string | null;
}
